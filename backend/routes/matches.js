const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Profile = require('../models/Profile');
const Opportunity = require('../models/Opportunity');
const { protect } = require('../middleware/auth');
const { matchProfileToOpportunities } = require('../utils/aiMatcher');

// POST /api/matches/generate  — run AI matching for current user
router.post('/generate', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile || profile.skills.length === 0) {
      return res.status(400).json({ message: 'Please complete your profile before generating matches.' });
    }

    // Get preferred types from profile or body
    const types = req.body.types || profile.preferredTypes || [];
    const query = { deadline: { $gte: new Date() }, isActive: true };
    if (types.length > 0) query.type = { $in: types };

    const opportunities = await Opportunity.find(query).limit(30);
    if (opportunities.length === 0) {
      return res.status(404).json({ message: 'No active opportunities found.' });
    }

    // Call Claude AI matcher
    const aiResults = await matchProfileToOpportunities(profile, req.user.name, opportunities);

    // Upsert match records
    const matchDocs = await Promise.all(
      aiResults.map(async (result) => {
        const doc = await Match.findOneAndUpdate(
          { user: req.user._id, opportunity: result.opportunityId },
          {
            user: req.user._id,
            opportunity: result.opportunityId,
            relevanceScore: result.score,
            explanation: result.explanation,
            highlights: result.highlights || [],
            skillsMatched: result.skillsMatched || [],
            gapAnalysis: result.gapAnalysis || '',
          },
          { upsert: true, new: true }
        ).populate('opportunity');
        return doc;
      })
    );

    // Sort by score descending
    matchDocs.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({ matches: matchDocs, count: matchDocs.length });
  } catch (err) {
    console.error('Matching error:', err);
    res.status(500).json({ message: 'AI matching failed: ' + err.message });
  }
});

// GET /api/matches  — get cached matches for user
router.get('/', protect, async (req, res) => {
  try {
    const { type, minScore = 0, saved } = req.query;
    const query = { user: req.user._id };
    if (saved === 'true') query.saved = true;

    let matches = await Match.find(query)
      .populate({
        path: 'opportunity',
        match: {
          deadline: { $gte: new Date() },
          ...(type && type !== 'all' ? { type } : {}),
        },
      })
      .sort({ relevanceScore: -1 });

    // Filter out matches where opportunity was filtered out or expired
    matches = matches.filter((m) => m.opportunity && m.relevanceScore >= Number(minScore));

    res.json({ matches, count: matches.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/matches/:id/save
router.patch('/:id/save', protect, async (req, res) => {
  try {
    const match = await Match.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { saved: req.body.saved },
      { new: true }
    ).populate('opportunity');
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/matches/:id/apply
router.patch('/:id/apply', protect, async (req, res) => {
  try {
    const match = await Match.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { applied: true },
      { new: true }
    ).populate('opportunity');
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/matches/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const matches = await Match.find({ user: req.user._id }).populate('opportunity');
    const active = matches.filter((m) => m.opportunity?.deadline >= new Date());
    const avg = active.length
      ? Math.round(active.reduce((s, m) => s + m.relevanceScore, 0) / active.length)
      : 0;
    res.json({
      total: active.length,
      saved: active.filter((m) => m.saved).length,
      applied: active.filter((m) => m.applied).length,
      avgScore: avg,
      topMatch: active[0]?.relevanceScore || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
