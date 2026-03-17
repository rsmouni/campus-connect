const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');

// GET /api/profile/me
router.get('/me', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/profile/me
router.put('/me', protect, async (req, res) => {
  try {
    const {
      degree, institution, yearOfStudy, gpa,
      skills, interests, coursesTaken, projects,
      bio, linkedIn, github, preferredTypes,
    } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      {
        degree, institution, yearOfStudy, gpa,
        skills, interests, coursesTaken, projects,
        bio, linkedIn, github, preferredTypes,
        profileSummary: '', // reset summary so AI regenerates on next match
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/profile/completeness
router.get('/completeness', protect, async (req, res) => {
  try {
    const p = await Profile.findOne({ user: req.user._id });
    if (!p) return res.json({ score: 0, missing: [] });

    const checks = [
      { field: 'bio', label: 'Bio', ok: p.bio && p.bio.length > 20 },
      { field: 'skills', label: 'Skills (3+)', ok: p.skills.length >= 3 },
      { field: 'interests', label: 'Interests', ok: p.interests.length >= 1 },
      { field: 'courses', label: 'Courses', ok: p.coursesTaken.length >= 2 },
      { field: 'projects', label: 'Projects', ok: p.projects.length >= 1 },
      { field: 'degree', label: 'Degree', ok: !!p.degree },
      { field: 'institution', label: 'Institution', ok: !!p.institution },
    ];

    const passed = checks.filter((c) => c.ok).length;
    const score = Math.round((passed / checks.length) * 100);
    const missing = checks.filter((c) => !c.ok).map((c) => c.label);

    res.json({ score, missing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
