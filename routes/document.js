const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const auth = require('../middleware/authJwt');

// ===================== CRÉER UN DOCUMENT =====================
router.post('/', auth, async (req, res) => {
  try {
    const document = new Document({
      ...req.body,
      author: req.user // ✅ auteur = utilisateur connecté
    });
    await document.save();
    res.status(201).json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===================== LISTER LES DOCUMENTS PAR COURS =====================
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

// ===================== NOTER UN DOCUMENT =====================
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
    document.averageRating =
      document.ratings.reduce((a, b) => a + b.rating, 0) / document.ratings.length;

    await document.save();
    res.json({ averageRating: document.averageRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== UPVOTE UN DOCUMENT =====================
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

// ===================== SUPPRIMER UN DOCUMENT PAR ID =====================
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ msg: 'Document non trouvé' });

    if (document.author.toString() !== req.user) {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    await document.deleteOne();
    res.json({ msg: 'Document supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
⚠️ Ancienne route NON sécurisée :
router.delete('/by-name/:name', ...) supprimée.
Car "name" n’est pas unique → risques.
*/

module.exports = router;
