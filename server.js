const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.static(__dirname));

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

app.post('/api/book', (req, res) => {
  const booking = req.body;
  let bookings = [];
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading bookings file:', err);
  }
  bookings.push(booking);
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  res.json({ success: true, message: 'Booking saved (demo mode, no real payment).' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
