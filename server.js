// server.js — v5 Stripe + Twilio integration
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const twilio = require('twilio');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(cors({ origin: true }));
app.disable('x-powered-by');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use(express.json());
app.use(express.static(__dirname, { extensions: ['html'] }));

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

// ── Helpers ───────────────────────────────────────────────────────────────────
function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
  } catch {
    return [];
  }
}
function writeBookings(bookings) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch {}
}
function toYMD(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── Twilio (optional) ─────────────────────────────────────────────────────────
const T_SID   = process.env.TWILIO_SID || '';
const T_TOKEN = process.env.TWILIO_TOKEN || '';
const T_FROM  = process.env.TWILIO_FROM || '';
const T_TO    = process.env.TWILIO_TO   || '';
const smsClient = (T_SID && T_TOKEN) ? twilio(T_SID, T_TOKEN) : null;

async function sendSMS(message) {
  if (!smsClient || !T_FROM || !T_TO) {
    console.log('SMS skipped – Twilio vars missing.');
    return;
  }
  try {
    const res = await smsClient.messages.create({ from: T_FROM, to: T_TO, body: message });
    console.log('SMS sent:', res.sid);
  } catch (err) {
    console.error('SMS error:', err?.message || err);
  }
}

// ── API: availability (one car per day) ───────────────────────────────────────
app.get('/api/availability', (req, res) => {
  const days = parseInt(req.query.days || '30', 10);
  const bookings = readBookings();
  const now = new Date();
  now.setHours(0,0,0,0);

  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dow = d.getDay(); // 0 Sun .. 6 Sat
    if (dow === 0) continue; // closed Sundays

    const ymd = toYMD(d);
    const booked = bookings.some(b => b.date === ymd);
    out.push({ date: ymd, booked });
  }
  res.json({ days: out });
});

// ── API: create payment intent ─────────────────────────────────────────────────
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { date, name, phone } = req.body || {};
    if (!date) return res.status(400).json({ success: false, message: 'Missing date.' });

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 25000, // $250.00 in cents
      currency: 'usd',
      metadata: {
        date: String(date).slice(0, 10),
        name: String(name || '').slice(0, 80),
        phone: String(phone || '').slice(0, 40),
        service: 'Flawless Finish Ceramic Coating Deposit'
      }
    });

    res.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ success: false, message: 'Payment processing error.' });
  }
});

// ── API: confirm payment and book ──────────────────────────────────────────────
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, date, name, phone } = req.body || {};
    
    if (!paymentIntentId || !date) {
      return res.status(400).json({ success: false, message: 'Missing payment or date information.' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not completed.' });
    }

    // Sanitize input
    const sanitizedDate = String(date).slice(0, 10);
    const sanitizedName = String(name || '').slice(0, 80);
    const sanitizedPhone = String(phone || '').slice(0, 40);

    const bookings = readBookings();
    if (bookings.some(b => b.date === sanitizedDate)) {
      return res.status(409).json({ success: false, message: 'That day is already booked.' });
    }

    // Save booking with payment confirmation
    bookings.push({ 
      date: sanitizedDate, 
      name: sanitizedName, 
      phone: sanitizedPhone, 
      method: 'card', 
      deposit: 250,
      stripePaymentId: paymentIntentId,
      createdAt: new Date().toISOString() 
    });
    writeBookings(bookings);

    // Notify Jason by SMS
    const humanDate = new Date(sanitizedDate + 'T12:00:00').toLocaleDateString([], { weekday:'short', month:'short', day:'numeric', timeZone: 'America/Los_Angeles' });
    const msg = `New Flawless Finish booking (PAID):
Date: ${humanDate}
Payment: $250 deposit confirmed
Client: ${sanitizedName || 'N/A'}
Phone: ${sanitizedPhone || 'N/A'}
Stripe ID: ${paymentIntentId}`;
    await sendSMS(msg);

    return res.json({ 
      success: true, 
      message: 'Payment confirmed and booking saved.', 
      date: sanitizedDate, 
      method: 'card',
      paymentId: paymentIntentId
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ success: false, message: 'Payment confirmation failed.' });
  }
});

// ── API: book cash reservation ────────────────────────────────────────────────
app.post('/api/book-cash', async (req, res) => {
  let { date, name, phone } = req.body || {};
  if (!date) return res.status(400).json({ success: false, message: 'Missing date.' });

  // sanitize input
  const sanitizedDate = String(date).slice(0, 10); // YYYY-MM-DD
  const sanitizedName = typeof name === 'string' ? name.slice(0, 80) : '';
  const sanitizedPhone = typeof phone === 'string' ? phone.slice(0, 40) : '';

  const bookings = readBookings();
  if (bookings.some(b => b.date === sanitizedDate)) {
    return res.status(409).json({ success: false, message: 'That day is already booked.' });
  }

  // Save cash booking
  bookings.push({ 
    date: sanitizedDate, 
    name: sanitizedName, 
    phone: sanitizedPhone, 
    method: 'cash', 
    deposit: 0, 
    createdAt: new Date().toISOString() 
  });
  writeBookings(bookings);

  // Notify Jason by SMS
  const humanDate = new Date(sanitizedDate + 'T12:00:00').toLocaleDateString([], { weekday:'short', month:'short', day:'numeric', timeZone: 'America/Los_Angeles' });
  const msg = `New Flawless Finish booking (CASH):
Date: ${humanDate}
Method: CASH RESERVATION
Client: ${sanitizedName || 'N/A'}
Phone: ${sanitizedPhone || 'N/A'}`;
  await sendSMS(msg);

  return res.json({ success: true, message: 'Cash reservation saved.', date: sanitizedDate, method: 'cash' });
});

// ── API: get Stripe publishable key ───────────────────────────────────────────
app.get('/api/stripe-key', (_, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
});

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Flawless Finish server running on ${PORT}`));
