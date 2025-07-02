const express = require('express');
const router = express.Router();
const ForumQuestion = require('../models/Forum');

// Poser une question
router.post('/', async (req, res) => {
  try {
    const question = new ForumQuestion(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voir toutes les questions
router.get('/', async (req, res) => {
  try {
    const questions = await ForumQuestion.find().populate('author');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;