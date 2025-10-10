const calEl = document.getElementById('calendar');
const nextSlotEl = document.getElementById('nextSlot');
const depositBtn = document.getElementById('depositBtn');
const toast = document.getElementById('toast');
let selected = null;
let firstAvailableISO = null;

function fmtDay(dateISO){
  const d = new Date(dateISO);
  return d.toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' });
}
function fmtTime(iso){
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
}

async function loadCalendar(){
  calEl.innerHTML = '<div class="notice">Loading availability…</div>';
  const res = await fetch('/api/availability?days=21');
  const data = await res.json();
  calEl.innerHTML = '';
  firstAvailableISO = null;

  data.days.forEach(day => {
    const dayCard = document.createElement('div');
    dayCard.className = 'day';

    const h = document.createElement('h4');
    h.textContent = fmtDay(day.date);
    dayCard.appendChild(h);

    const slots = document.createElement('div');
    slots.className = 'slots';

    day.slots.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'slot' + (s.taken ? ' taken' : '');
      btn.textContent = fmtTime(s.iso);
      btn.disabled = s.taken;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.slot').forEach(n=>n.classList.remove('selected'));
        btn.classList.add('selected');
        selected = s.iso;
        depositBtn.disabled = false;
      });
      if (!s.taken && !firstAvailableISO) firstAvailableISO = s.iso;
      slots.appendChild(btn);
    });

    dayCard.appendChild(slots);
    calEl.appendChild(dayCard);
  });

  if (firstAvailableISO){
    nextSlotEl.textContent = 'Next available: ' + new Date(firstAvailableISO).toLocaleString([], {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
  } else {
    nextSlotEl.textContent = 'No availability in the next 21 days. Please call.';
  }
}

depositBtn.addEventListener('click', async () => {
  if (!selected) return;
  depositBtn.disabled = true;
  const name = prompt('Your name (optional):') || '';
  const phone = prompt('Phone (optional):') || '';

  try {
    const res = await fetch('/api/book', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ iso: selected, name, phone })
    });
    const out = await res.json();
    if (out.success){
      toast.textContent = 'Booked! Deposit recorded (demo).';
      toast.style.display = 'block';
      setTimeout(()=>toast.style.display='none', 2500);
      await loadCalendar();
      selected = null;
      depositBtn.disabled = true;
    } else {
      alert('Could not book: ' + out.message);
      depositBtn.disabled = false;
    }
  } catch (e) {
    alert('Network error.');
    depositBtn.disabled = false;
  }
});

loadCalendar();
