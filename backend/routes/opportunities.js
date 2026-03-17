const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { protect } = require('../middleware/auth');

// GET /api/opportunities  — list active opportunities with optional filters
router.get('/', protect, async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const query = { deadline: { $gte: new Date() }, isActive: true };

    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Opportunity.countDocuments(query);
    const opportunities = await Opportunity.find(query)
      .sort({ deadline: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ opportunities, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/opportunities/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(opp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/opportunities  — admin/seed only (no role system for brevity)
router.post('/', protect, async (req, res) => {
  try {
    const opp = await Opportunity.create(req.body);
    res.status(201).json(opp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/opportunities/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
