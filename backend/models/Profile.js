const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [String],
  link: String,
});

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    yearOfStudy: { type: Number, min: 1, max: 6 },
    gpa: { type: Number, min: 0, max: 10 },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    coursesTaken: [{ type: String, trim: true }],
    projects: [projectSchema],
    bio: { type: String, default: '' },
    linkedIn: { type: String, default: '' },
    github: { type: String, default: '' },
    preferredTypes: {
      type: [String],
      enum: ['internship', 'research', 'competition', 'scholarship'],
      default: ['internship', 'research', 'competition', 'scholarship'],
    },
    // AI-generated embedding summary cached for matching
    profileSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
