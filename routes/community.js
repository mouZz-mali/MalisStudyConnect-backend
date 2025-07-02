const express = require('express');
const router = express.Router();
const Community = require('../models/Community');

// Liste des communautés
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find().populate('members');
    res.json(communities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Créer une communauté
router.post('/', async (req, res) => {
  try {
    const community = new Community(req.body);
    await community.save();
    res.status(201).json(community);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;