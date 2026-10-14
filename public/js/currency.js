const CurrencyCache = {};
const RATE_TTL = 3600 * 1000;
async function getLocalFee(currencyCode) {
  const el = document.getElementById('localFee');
  const note = document.getElementById('feeNote');
  const hidden = document.getElementById('localFeeInput');
  if (!currencyCode || !/^[A-Z]{3}$/.test(currencyCode)) {
    el.textContent = '$24.00 USD';
    note.textContent = 'Select country for local amount';
    hidden.value = '';
    return;
  }
  note.textContent = 'Fetching live rate...';
  const cached = CurrencyCache[currencyCode];
  if (cached && Date.now() - cached.ts < RATE_TTL) return applyFee(cached);
  try {
    const r = await fetch('/api/currency?currency=' + currencyCode);
    const data = await r.json();
    if (!data.ok) throw new Error();
    const payload = { formatted: data.formatted, ts: Date.now() };
    CurrencyCache[currencyCode] = payload;
    applyFee(payload);
  } catch {
    el.textContent = '$24.00 USD';
    note.textContent = 'Could not fetch rate - showing USD';
    hidden.value = '$24.00 USD';
  }
}
function applyFee(p) {
  document.getElementById('localFee').textContent = p.formatted;
  document.getElementById('feeNote').textContent = 'approx $24.00 USD - live rate';
  document.getElementById('localFeeInput').value = p.formatted;
}
window.getLocalFee = getLocalFee;
