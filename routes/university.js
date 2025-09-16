// routes/university.js
const express = require('express');
const router = express.Router();
const University = require('../models/University');
const auth = require('../middleware/authJwt'); // middleware JWT
const isAdmin = require('../middleware/isAdmin'); // middleware admin
const { body, validationResult } = require('express-validator');

// ========================
// Liste des universités (avec recherche)
// ========================
router.get('/', async (req, res) => {
  const { search } = req.query;
  const filter = { approved: true };

  if (search) {
    filter.name = { $regex: search, $options: 'i' }; // recherche insensible à la casse
  }

  try {
    const universities = await University.find(filter).lean();
    res.json({ success: true, data: universities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur, réessayez plus tard.' });
  }
});

// ========================
// Ajouter une université (utilisateur connecté)
// ========================
router.post(
  '/',
  auth,
  [
    body('name').isString().trim().notEmpty().withMessage('Le nom est requis'),
    body('country').isString().trim().notEmpty().withMessage('Le pays est requis'),
    body('city').isString().trim().notEmpty().withMessage('La ville est requise'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await University.findOne({
        name: req.body.name,
        country: req.body.country,
        city: req.body.city,
      });

      if (existing) {
        return res.status(409).json({ success: false, message: 'Cette université existe déjà.' });
      }

      const university = new University({
        ...req.body,
        approved: false, // pas approuvée par défaut
        addedBy: req.user, // stocke l'id de l'utilisateur qui ajoute
      });

      await university.save();
      res.status(201).json({
        success: true,
        message: 'Université ajoutée avec succès, en attente d’approbation.',
        data: university,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erreur serveur, impossible d’ajouter.' });
    }
  }
);

// ========================
// Approuver une université (ADMIN uniquement)
// ========================
router.put('/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ success: false, message: 'Université non trouvée' });
    }

    university.approved = true;
    await university.save();

    res.json({ success: true, message: 'Université approuvée', data: university });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur, réessayez plus tard.' });
  }
});

module.exports = router;
