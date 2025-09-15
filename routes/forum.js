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

// GET /api/forum?course=...
router.get('/', auth, async (req, res) => {
  const { course } = req.query;
  if (!course) {
    return res.status(400).json({ msg: 'Le paramètre course est requis' });
  }

  try {
    const questions = await ForumQuestion.find({ course })
      .populate('author', 'fullName email') // ✅ Renvoie le nom
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
    res.status(201).json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forum/:id/answers
router.get('/:id/answers', auth, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id)
      .populate('answers.author', 'fullName email'); // ✅ Renvoie le nom des auteurs des réponses

    if (!question) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    res.json(question.answers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/:id/upvote
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ msg: 'Question non trouvée' });

    question.upvotes += 1;
    await question.save();
    res.json({ upvotes: question.upvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forum/:id/downvote
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ msg: 'Question non trouvée' });

    question.downvotes += 1;
    await question.save();
    res.json({ downvotes: question.downvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/forum/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ msg: 'Question non trouvée' });

    // Vérifie que l'utilisateur est l'auteur
    if (question.author.toString() !== req.user) {
      return res.status(403).json({ msg: 'Action non autorisée' });
    }

    await question.remove();
    res.json({ msg: 'Question supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;