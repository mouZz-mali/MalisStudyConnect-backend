const express = require('express');
const router = express.Router();
const auth = require('../middleware/authJwt'); // ✅ Ajout du middleware
const ForumQuestion = require('../models/Forum');

// POST /api/forum
// @desc  Poser une question (authentifié)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, course } = req.body;

    // ✅ Validation
    if (!title || !content || !course) {
      return res.status(400).json({ msg: 'Tous les champs sont requis' });
    }

    const question = new ForumQuestion({
      title,
      content,
      course,
      author: req.user, // ✅ req.user = userId (défini par authJwt)
    });

    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forum?course=L2-Math
// @desc  Voir les questions d'un cours
router.get('/', auth, async (req, res) => {
  const { course } = req.query;

  // ✅ Le cours est requis
  if (!course) {
    return res.status(400).json({ msg: 'Le paramètre "course" est requis' });
  }

  try {
    const questions = await ForumQuestion.find({ course })
      .populate('author', 'fullName email') // ✅ Récupère le nom de l’auteur
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/:id/answers
// @desc  Répondre à une question
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ msg: 'Le contenu est requis' });
    }

    const question = await ForumQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    question.answers.push({
      author: req.user,
      content,
    });

    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;