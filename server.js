// server.js — v4 daily booking + Twilio + cash option
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const twilio = require('twilio');

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

// ── API: book (supports paymentMethod: 'card' | 'cash') ───────────────────────
app.post('/api/book', async (req, res) => {
  let { date, name, phone, paymentMethod } = req.body || {};
  if (!date) return res.status(400).json({ success: false, message: 'Missing date.' });

  // sanitize input
  date = String(date).slice(0, 10); // YYYY-MM-DD
  name = typeof name === 'string' ? name.slice(0, 80) : '';
  phone = typeof phone === 'string' ? phone.slice(0, 40) : '';
  paymentMethod = (paymentMethod === 'cash' ? 'cash' : 'card');

  const bookings = readBookings();
  if (bookings.some(b => b.date === date)) {
    return res.status(409).json({ success: false, message: 'That day is already booked.' });
  }

  // If paymentMethod === 'card', you would create/confirm a payment intent here.
  // In demo mode we just proceed. For cash, proceed immediately.
  bookings.push({ date, name, phone, method: paymentMethod, deposit: (paymentMethod === 'card' ? 250 : 0), createdAt: new Date().toISOString() });
  writeBookings(bookings);

  // Notify Jason by SMS
  const humanDate = new Date(date + 'T12:00:00').toLocaleDateString([], { weekday:'short', month:'short', day:'numeric', timeZone: 'America/Los_Angeles' });
  const msg = `New Flawless Finish booking:
Date: ${humanDate}
Method: ${paymentMethod.toUpperCase()}
Client: ${name || 'N/A'}
Phone: ${phone || 'N/A'}`;
  await sendSMS(msg);

  return res.json({ success: true, message: 'Booking saved.', date, method: paymentMethod });
});

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Flawless Finish server running on ${PORT}`));
