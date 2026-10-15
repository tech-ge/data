function sanitize(v, max = 300) {
  if (typeof v !== 'string') return '';
  return v
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}
module.exports = sanitize;
