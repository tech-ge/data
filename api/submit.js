const connectDB = require('../lib/db');
const Submission = require('../lib/models/Submission');
const Draft = require('../lib/models/Draft');
const sanitize = require('../lib/sanitize');

const DEADLINE = new Date('2026-11-04T23:59:59+03:00');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE  = /^[A-Za-z\u00C0-\u024F '\-.]+$/;
const ID_RE    = /^[A-Za-z0-9\-\/]+$/;
const PHONE_RE = /^[+0-9\s\-()]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (new Date() > DEADLINE) return res.status(403).json({ ok: false, message: 'Submission window closed.' });

  try {
    await connectDB();
    const b = req.body || {};

    const data = {
      fullName:        sanitize(b.fullName, 120),
      country:         sanitize(b.country, 4).toUpperCase(),
      countryName:     sanitize(b.countryName, 80),
      idNumber:        sanitize(b.idNumber, 40),
      email:           sanitize(b.email, 120).toLowerCase(),
      phone:           sanitize(b.phone, 25),
      studyLevel:      b.studyLevel,
      fieldOfStudy:    sanitize(b.fieldOfStudy, 120),
      completedCourse: sanitize(b.completedCourse, 120),
      guardianName:    sanitize(b.guardianName, 120),
      guardianPhone:   sanitize(b.guardianPhone, 25),
      agreedToTerms:   b.agreedToTerms === true || b.agreedToTerms === 'true',
      localFee:        sanitize(b.localFee, 60),
      ip:              (req.headers['x-forwarded-for'] || '').split(',')[0].trim(),
      userAgent:       String(req.headers['user-agent'] || '').slice(0, 300)
    };

    const errors = [];
    if (!NAME_RE.test(data.fullName) || data.fullName.length < 2) errors.push('fullName');
    if (!/^[A-Z]{2,3}$/.test(data.country)) errors.push('country');
    if (!ID_RE.test(data.idNumber) || data.idNumber.length < 3) errors.push('idNumber');
    if (!EMAIL_RE.test(data.email)) errors.push('email');
    if (!PHONE_RE.test(data.phone) || data.phone.length < 6) errors.push('phone');
    if (!['continuing','graduate'].includes(data.studyLevel)) errors.push('studyLevel');
    if (data.studyLevel === 'continuing' && !data.fieldOfStudy) errors.push('fieldOfStudy');
    if (data.studyLevel === 'graduate' && !data.completedCourse) errors.push('completedCourse');
    if (!NAME_RE.test(data.guardianName) || data.guardianName.length < 2) errors.push('guardianName');
    if (!PHONE_RE.test(data.guardianPhone) || data.guardianPhone.length < 6) errors.push('guardianPhone');
    if (!data.agreedToTerms) errors.push('agreedToTerms');

    if (errors.length) {
      return res.status(400).json({ ok: false, message: 'Invalid: ' + errors.join(', ') });
    }

    if (await Submission.findOne({ email: data.email }).lean()) {
      return res.status(409).json({ ok: false, message: 'This email has a record. Please use another one.' });
    }
    if (await Submission.findOne({ idNumber: data.idNumber }).lean()) {
      return res.status(409).json({ ok: false, message: 'This ID number has a record. Please use another one.' });
    }

    await Submission.create(data);

    if (b.draftId) await Draft.deleteOne({ draftId: b.draftId }).catch(() => {});

    res.json({ ok: true, redirect: '/thank-you' });
  } catch (e) {
    console.error('submit:', e);
    if (e.code === 11000) {
      const f = Object.keys(e.keyPattern || {})[0];
      return res.status(409).json({ ok: false, message: f === 'email'
        ? 'This email has a record. Please use another one.'
        : 'This ID number has a record. Please use another one.' });
    }
    res.status(500).json({ ok: false, message: 'Server error' });
  }
};
