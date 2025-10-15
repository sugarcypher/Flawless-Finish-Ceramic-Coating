// scripts.js — v4 daily calendar + cash/card options
const calEl = document.getElementById('calendar');
const nextSlotEl = document.getElementById('nextSlot');
const depositBtn = document.getElementById('depositBtn'); // we’ll repurpose label
let selectedDate = null;

function fmtDay(ymd){
  const d = new Date(ymd + 'T12:00:00');
  return d.toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' });
}

async function loadCalendar(){
  calEl.innerHTML = '<div class="notice">Loading days…</div>';
  const res = await fetch('/api/availability?days=30');
  const data = await res.json();
  calEl.innerHTML = '';

  // Build a simple 6x5-ish grid of days
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
  grid.style.gap = '8px';

  let firstOpen = null;
  data.days.forEach(day => {
    const cell = document.createElement('button');
    cell.className = 'slot';
    cell.style.padding = '12px';
    cell.textContent = fmtDay(day.date);
    cell.disabled = day.booked;
    if (day.booked) {
      cell.classList.add('taken');
      cell.title = 'Booked';
    }
    cell.addEventListener('click', () => {
      selectedDate = day.date;
      document.querySelectorAll('.slot').forEach(n=>n.classList.remove('selected'));
      cell.classList.add('selected');
      // enable action buttons below (we’ll render them if not present)
      renderActions();
    });
    if (!day.booked && !firstOpen) firstOpen = day.date;
    grid.appendChild(cell);
  });

  calEl.appendChild(grid);
  nextSlotEl.textContent = firstOpen
    ? 'Next available: ' + fmtDay(firstOpen)
    : 'No available days in the next 30 days.';
}

function ensureActionRow(){
  let row = document.getElementById('actionRow');
  if (row) return row;
  row = document.createElement('div');
  row.id = 'actionRow';
  row.className = 'cta-row';
  row.style.marginTop = '12px';
  calEl.parentElement.appendChild(row);
  return row;
}

function renderActions(){
  const row = ensureActionRow();
  row.innerHTML = '';

  const cashBtn = document.createElement('button');
  cashBtn.className = 'button secondary';
  cashBtn.textContent = 'Reserve with Cash';
  cashBtn.disabled = !selectedDate;
  cashBtn.onclick = () => bookSelected('cash');

  const cardBtn = document.createElement('button');
  cardBtn.className = 'button primary';
  cardBtn.textContent = 'Pay $250 Deposit (Demo Card)';
  cardBtn.disabled = !selectedDate;
  cardBtn.onclick = () => bookSelected('card');

  row.appendChild(cashBtn);
  row.appendChild(cardBtn);
}

async function bookSelected(method){
  if (!selectedDate) return;
  const name = prompt('Your name (optional):') || '';
  const phone = prompt('Your phone (optional):') || '';

  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ date: selectedDate, name, phone, paymentMethod: method })
    });
    const out = await res.json();
    if (out.success) {
      alert(`Booked ${fmtDay(selectedDate)} via ${method.toUpperCase()}. Jason has been notified.`);
      selectedDate = null;
      await loadCalendar();
      renderActions();
    } else {
      alert(out.message || 'Could not book.');
    }
  } catch {
    alert('Network error.');
  }
}

loadCalendar();
