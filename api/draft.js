const connectDB = require('../lib/db');
const Draft = require('../lib/models/Draft');
const sanitize = require('../lib/sanitize');
const UUID_RE = /^[0-9a-f-]{36}$/i;
module.exports = async (req, res) => {
  try {
    await connectDB();
    if (req.method === 'GET') {
      const draftId = String(req.query.id || '').trim();
      if (!UUID_RE.test(draftId)) return res.status(400).json({ ok: false });
      const doc = await Draft.findOne({ draftId }).lean();
      if (!doc) return res.json({ ok: true, draft: null });
      delete doc._id;
      return res.json({ ok: true, draft: doc });
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      const draftId = String(b.draftId || '').trim();
      if (!UUID_RE.test(draftId)) return res.status(400).json({ ok: false });
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const data = {
        draftId,
        fullName:        sanitize(b.fullName, 120),
        country:         sanitize(b.country, 4).toUpperCase(),
        countryName:     sanitize(b.countryName, 80),
        idNumber:        sanitize(b.idNumber, 40),
        email:           sanitize(b.email, 120).toLowerCase(),
        phone:           sanitize(b.phone, 25),
        studyLevel:      ['continuing','graduate'].includes(b.studyLevel) ? b.studyLevel : '',
        fieldOfStudy:    sanitize(b.fieldOfStudy, 120),
        completedCourse: sanitize(b.completedCourse, 120),
        guardianName:    sanitize(b.guardianName, 120),
        guardianPhone:   sanitize(b.guardianPhone, 25),
        agreedToTerms:   b.agreedToTerms === true,
        localFee:        sanitize(b.localFee, 60),
        lastIp:          ip,
        updatedAt:       new Date()
      };
      await Draft.updateOne(
        { draftId },
        { $set: data, $setOnInsert: { expiresAt: new Date('2026-11-04T23:59:59+03:00') } },
        { upsert: true }
      );
      return res.json({ ok: true });
    }
    res.status(405).json({ ok: false });
  } catch (e) {
    console.error('draft:', e);
    res.status(500).json({ ok: false });
  }
};
