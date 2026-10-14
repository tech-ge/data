const axios = require('axios');
const BASE_FEE = 24;
let cache = { rates: null, ts: 0 };
module.exports = async (req, res) => {
  const code = String(req.query.currency || '').toUpperCase().slice(0, 4);
  if (!/^[A-Z]{3}$/.test(code)) return res.status(400).json({ ok: false });
  try {
    if (!cache.rates || Date.now() - cache.ts > 3600000) {
      const r = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 4000 });
      cache = { rates: r.data.rates, ts: Date.now() };
    }
    const rate = cache.rates[code];
    if (!rate) return res.status(404).json({ ok: false });
    const amt = BASE_FEE * rate;
    const formatted = code + ' ' + amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    res.json({ ok: true, currency: code, rate, formatted });
  } catch (e) { res.status(502).json({ ok: false }); }
};
