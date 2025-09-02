const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const auth = require('../middleware/authJwt');

// Téléverser un document
router.post('/', async (req, res) => {
  try {
    const document = new Document(req.body);
    await document.save();
    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lister tous les documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find().populate('uploader');
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/:id/rate
router.post('/:id/rate', auth, async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Note invalide' });
  }

  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ msg: 'Document non trouvé' });

    document.ratings.push({
      user: req.user,
      rating,
    });

    // Calcule la moyenne
    const avg = document.ratings
      .map(r => r.rating)
      .reduce((a, b) => a + b, 0) / document.ratings.length;

    document.averageRating = avg;
    await document.save();

    res.json({ averageRating: avg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;