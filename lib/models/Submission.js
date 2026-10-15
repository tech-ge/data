const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  fullName:         { type: String, required: true, maxlength: 120, trim: true },
  country:          { type: String, required: true, maxlength: 4 },
  countryName:      { type: String, required: true, maxlength: 80 },
  idNumber:         { type: String, required: true, unique: true, maxlength: 40, trim: true },
  email:            { type: String, required: true, unique: true, maxlength: 120, lowercase: true, trim: true },
  phone:            { type: String, required: true, maxlength: 25, trim: true },
  studyLevel:       { type: String, enum: ['continuing', 'graduate'], required: true },
  fieldOfStudy:     { type: String, default: '', maxlength: 120 },
  completedCourse:  { type: String, default: '', maxlength: 120 },
  guardianName:     { type: String, required: true, maxlength: 120, trim: true },
  guardianPhone:    { type: String, required: true, maxlength: 25, trim: true },
  agreedToTerms:    { type: Boolean, required: true },
  localFee:         { type: String, default: '' },
  ip:               { type: String, default: '' },
  location: {
    country: { type: String, default: '' },
    region:  { type: String, default: '' },
    city:    { type: String, default: '' },
    isp:     { type: String, default: '' }
  },
  userAgent:        { type: String, default: '', maxlength: 300 }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
