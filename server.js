const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(cors({ origin: true }));
app.disable('x-powered-by');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use(express.json());
app.use(express.static(__dirname, { extensions: ['html'] }));

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}
function writeBookings(bookings) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (e) {}
}

app.get('/api/availability', (req, res) => {
  const days = parseInt(req.query.days || '21', 10);
  const bookings = readBookings();
  const now = new Date();
  const slots = [];

  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() + d);
    const day = date.getDay(); // 0 Sun .. 6 Sat
    if (day === 0) continue; // closed Sundays

    for (let hour = 9; hour <= 16; hour++) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0, 0);
      const iso = slotTime.toISOString();
      const taken = bookings.some(b => b.iso === iso);
      slots.push({ iso, taken });
    }
  }
  res.json({ slots });
});

app.post('/api/book', (req, res) => {
  const { iso, name, phone } = req.body || {};
  if (!iso) return res.status(400).json({ success: false, message: 'Missing slot.' });

  const bookings = readBookings();
  if (bookings.some(b => b.iso === iso)) {
    return res.status(409).json({ success: false, message: 'Slot already booked.' });
  }
  const safeName = typeof name === 'string' ? name.slice(0, 80) : '';
  const safePhone = typeof phone === 'string' ? phone.slice(0, 40) : '';

  bookings.push({ iso, name: safeName, phone: safePhone, deposit: 250, createdAt: new Date().toISOString() });
  writeBookings(bookings);
  res.json({ success: true, message: 'Deposit captured in demo mode. Booking saved.', iso });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Flawless Finish server running on ${PORT}`));
