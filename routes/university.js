const express = require('express');
const router = express.Router();
const University = require('../models/University');

// Liste des universités
router.get('/', async (req, res) => {
  try {
    const universities = await University.find({ approved: true });
    res.json(universities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter une université
router.post('/', async (req, res) => {
  try {
    const university = new University(req.body);
    await university.save();
    res.status(201).json(university);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;