const express = require('express');
const router = express.Router();
const auth = require('../middleware/authJwt');
const ForumQuestion = require('../models/Forum');

// POST /api/forum
router.post('/', auth, async (req, res) => {
  const { title, content, course } = req.body;
  if (!title || !content || !course) {
    return res.status(400).json({ msg: 'Tous les champs sont requis' });
  }

  try {
    const question = new ForumQuestion({
      title,
      content,
      course,
      author: req.user,
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forum?course=L2-Math
router.get('/', auth, async (req, res) => {
  const { course } = req.query;
  if (!course) {
    return res.status(400).json({ msg: 'Le paramètre course est requis' });
  }

  try {
    const questions = await ForumQuestion.find({ course })
      .populate('author', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/:id/answers
router.post('/:id/answers', auth, async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ msg: 'Le contenu est requis' });
  }

  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    question.answers.push({
      author: req.user,
      content,
    });

    await question.save();
    res.status(201).json(question); // ✅ Renvoie la question complète
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forum/:id/answers
router.get('/:id/answers', auth, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id)
      .populate('answers.author', 'fullName email'); // ✅ Popule l'auteur des réponses

    if (!question) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    res.json(question.answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;