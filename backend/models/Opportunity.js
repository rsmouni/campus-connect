const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['internship', 'research', 'competition', 'scholarship'],
    },
    description: { type: String, required: true },
    requirements: { type: String, default: '' },
    skills: [String],
    location: { type: String, default: 'Remote' },
    stipend: { type: String, default: '' },
    deadline: { type: Date, required: true },
    link: { type: String, required: true },
    tags: [String],
    isActive: { type: Boolean, default: true },
    source: { type: String, default: 'manual' },
  },
  { timestamps: true }
);

// Auto-deactivate expired opportunities
opportunitySchema.pre('find', function () {
  this.where({ deadline: { $gte: new Date() }, isActive: true });
});

opportunitySchema.index({ type: 1, deadline: 1 });
opportunitySchema.index({ skills: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
