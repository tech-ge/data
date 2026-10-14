const mongoose = require('mongoose');
const DRAFT_EXPIRY = new Date('2026-11-04T23:59:59+03:00');
const draftSchema = new mongoose.Schema({
  draftId:         { type: String, required: true, unique: true, index: true },
  fullName:        { type: String, default: '', maxlength: 120 },
  country:         { type: String, default: '', maxlength: 4 },
  countryName:     { type: String, default: '', maxlength: 80 },
  idNumber:        { type: String, default: '', maxlength: 40 },
  email:           { type: String, default: '', maxlength: 120, lowercase: true },
  phone:           { type: String, default: '', maxlength: 25 },
  studyLevel:      { type: String, enum: ['', 'continuing', 'graduate'], default: '' },
  fieldOfStudy:    { type: String, default: '', maxlength: 120 },
  completedCourse: { type: String, default: '', maxlength: 120 },
  guardianName:    { type: String, default: '', maxlength: 120 },
  guardianPhone:   { type: String, default: '', maxlength: 25 },
  agreedToTerms:   { type: Boolean, default: false },
  localFee:        { type: String, default: '' },
  lastIp:          { type: String, default: '' },
  updatedAt:       { type: Date, default: Date.now },
  expiresAt:       { type: Date, default: DRAFT_EXPIRY, index: { expires: 0 } }
}, { versionKey: false });
module.exports = mongoose.models.Draft || mongoose.model('Draft', draftSchema);
