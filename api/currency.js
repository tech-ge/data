const { getLocalFee } = require('../lib/rates');

module.exports = (req, res) => {
  const code = String(req.query.currency || '').toUpperCase().slice(0, 4);

  if (!/^[A-Z]{3}$/.test(code)) {
    return res.status(400).json({ ok: false, message: 'Invalid currency' });
  }

  const result = getLocalFee(code);
  if (!result) {
    return res.status(404).json({ ok: false, message: 'Currency not supported' });
  }

  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.json({
    ok: true,
    currency: result.currency,
    rate: result.rate,
    amount: result.amount,
    formatted: result.formatted
  });
};
