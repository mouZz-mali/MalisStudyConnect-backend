// routes/community.js
const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const authJwt = require('../middleware/authJwt'); // ✅ Import du middleware

// ===================== LISTE DES COMMUNAUTÉS =====================
router.get('/', authJwt, async (req, res) => {
  try {
    const communities = await Community.find().populate('members', 'fullName email');
    res.json(communities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== CRÉER UNE COMMUNAUTÉ =====================
router.post('/', authJwt, async (req, res) => {
  try {
    const { course, department } = req.body;

    if (!course || !department) {
      return res.status(400).json({ msg: 'Course et department requis' });
    }

    // ✅ Ajoute l'utilisateur connecté comme membre fondateur
    const community = new Community({
      course,
      department,
      members: [req.user], // `req.user` est injecté par authJwt
    });

    await community.save();
    res.status(201).json(community);
  } catch (err) {
    console.error('💥 Erreur lors de la création de communauté:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
