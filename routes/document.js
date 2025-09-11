// routes/document.js
const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const auth = require('../middleware/authJwt');

// POST /api/documents
router.post('/', auth, async (req, res) => {
  try {
    const document = new Document({
      ...req.body,
      author: req.user // ✅ L’auteur est l’utilisateur connecté
    });
    await document.save();
    res.status(201).json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents?course=L2-Math
router.get('/', auth, async (req, res) => {
  const { course } = req.query;
  if (!course) {
    return res.status(400).json({ msg: 'Le paramètre course est requis' });
  }

  try {
    const documents = await Document.find({ course })
      .populate('author', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/:id/rate
router.post('/:id/rate', auth, async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Note invalide (1 à 5)' });
  }

  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ msg: 'Document non trouvé' });

    // Vérifie si l'utilisateur a déjà noté
    const existingRating = document.ratings.find(r => r.user.toString() === req.user);
    if (existingRating) {
      return res.status(400).json({ msg: 'Vous avez déjà noté ce document' });
    }

    document.ratings.push({ user: req.user, rating });
    
    const avg = document.ratings.reduce((a, b) => a + b.rating, 0) / document.ratings.length;
    document.averageRating = avg;

    await document.save();
    res.json({ averageRating: document.averageRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/:id/upvote
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ msg: 'Document non trouvé' });

    document.upvotes += 1;
    await document.save();

    res.json({ upvotes: document.upvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;