const slotsEl = document.getElementById('slots');
const selectionEl = document.getElementById('selection');
const bookBtn = document.getElementById('bookBtn');
let selectedISO = null;

function fmt(dt){
  const d = new Date(dt);
  return d.toLocaleString([], { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
}

async function loadSlots(){
  slotsEl.innerHTML = '<div class="sub">Loading availability…</div>';
  const res = await fetch('/api/availability?days=21');
  const data = await res.json();
  slotsEl.innerHTML = '';
  data.slots.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'slot' + (s.taken ? ' taken': '');
    btn.textContent = fmt(s.iso);
    btn.disabled = s.taken;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.slot').forEach(n=>n.classList.remove('selected'));
      btn.classList.add('selected');
      selectedISO = s.iso;
      selectionEl.textContent = 'Selected: ' + fmt(s.iso);
      bookBtn.disabled = false;
    });
    slotsEl.appendChild(btn);
  });
}

bookBtn.addEventListener('click', async () => {
  if (!selectedISO) return;
  bookBtn.disabled = true;
  bookBtn.textContent = 'Processing deposit (demo)…';
  try {
    const name = prompt('Your name (optional):') || '';
    const phone = prompt('Phone (optional):') || '';
    const res = await fetch('/api/book', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ iso: selectedISO, name, phone })
    });
    const out = await res.json();
    if (out.success){
      alert('Booked! ' + fmt(selectedISO) + ' — $250 deposit recorded (demo).');
      await loadSlots();
      selectionEl.textContent = '';
      selectedISO = null;
    } else {
      alert('Could not book: ' + out.message);
    }
  } catch (e) {
    alert('Network error.');
  } finally {
    bookBtn.textContent = 'Pay $250 Deposit (Demo)';
  }
});

loadSlots();
