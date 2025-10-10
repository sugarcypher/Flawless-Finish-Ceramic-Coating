document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

  const booking = { date, time, deposit: 250 };
  const response = await fetch('/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  const result = await response.json();
  document.getElementById('response').textContent = result.message;
});
