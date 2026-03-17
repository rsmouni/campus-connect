const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    relevanceScore: { type: Number, min: 0, max: 100, required: true },
    explanation: { type: String, required: true },
    highlights: [String],      // bullet-point reasons
    skillsMatched: [String],
    gapAnalysis: { type: String, default: '' },
    saved: { type: Boolean, default: false },
    applied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

matchSchema.index({ user: 1, relevanceScore: -1 });
matchSchema.index({ user: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
