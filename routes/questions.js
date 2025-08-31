const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // ← Middleware pour vérifier le token
const Question = require('../models/Question');

// POST /api/questions
// @desc  Créer une nouvelle question
// @access Privé
router.post('/', auth, async (req, res) => {
  const { title, content, course } = req.body;

  // Validation basique
  if (!title || !content || !course) {
    return res.status(400).json({ msg: 'Tous les champs sont requis' });
  }

  try {
    const newQuestion = new Question({
      title,
      content,
      course,
      author: req.user.userId, // ← userId mis par le middleware `auth`
    });

    const question = await newQuestion.save();
    res.status(201).json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// GET /api/questions?course=L2-Math
// @desc  Lister les questions d’un cours
// @access Privé
router.get('/', auth, async (req, res) => {
  const { course } = req.query;

  if (!course) {
    return res.status(400).json({ msg: 'Le paramètre course est requis' });
  }

  try {
    const questions = await Question.find({ course }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;