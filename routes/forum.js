// routes/forum.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authJwt');
const ForumQuestion = require('../models/Forum');
const rateLimit = require('express-rate-limit');
const { sendSuccess, sendError } = require('../utils/response');

// =====================
// Limiteurs
// =====================
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 votes par IP
  message: { success: false, message: 'Trop de votes. Essayez plus tard.' },
});

const questionLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // max 5 questions par IP
  message: { success: false, message: 'Trop de questions créées. Essayez plus tard.' },
});

// =====================
// Créer une question
// =====================
router.post('/', auth, questionLimiter, async (req, res) => {
  const { title, content, course } = req.body;
  if (!title || !content || !course) {
    return sendError(res, 'Tous les champs sont requis', 400);
  }

  try {
    const question = new ForumQuestion({
      title,
      content,
      course,
      author: req.user,
    });
    await question.save();
    sendSuccess(res, question, 'Question créée avec succès');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

// =====================
// Liste des questions
// =====================
router.get('/', auth, async (req, res) => {
  const { course } = req.query;
  if (!course) return sendError(res, 'Le paramètre course est requis', 400);

  try {
    const questions = await ForumQuestion.find({ course })
      .populate('author', 'fullName email')
      .select('-downvotes')
      .sort({ createdAt: -1 });
    sendSuccess(res, questions, 'Questions récupérées');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

// =====================
// Ajouter une réponse
// =====================
router.post('/:id/answers', auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return sendError(res, 'Le contenu est requis', 400);

  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) return sendError(res, 'Question non trouvée', 404);

    question.answers.push({ author: req.user, content });
    await question.save();
    sendSuccess(res, question, 'Réponse ajoutée');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

// =====================
// Récupérer les réponses
// =====================
router.get('/:id/answers', auth, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id)
      .populate('answers.author', 'fullName email');
    if (!question) return sendError(res, 'Question non trouvée', 404);

    sendSuccess(res, question.answers, 'Réponses récupérées');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

// =====================
// Upvote & Downvote (limité)
// =====================
router.post('/:id/upvote', auth, voteLimiter, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) return sendError(res, 'Question non trouvée', 404);

    question.upvotes += 1;
    await question.save();
    sendSuccess(res, { upvotes: question.upvotes }, 'Upvote enregistré');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

router.post('/:id/downvote', auth, voteLimiter, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) return sendError(res, 'Question non trouvée', 404);

    question.downvotes += 1;
    await question.save();
    sendSuccess(res, { downvotes: question.downvotes }, 'Downvote enregistré');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

// =====================
// Supprimer une question
// =====================
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) return sendError(res, 'Question non trouvée', 404);

    if (question.author.toString() !== req.user) {
      return sendError(res, 'Action non autorisée', 403);
    }

    await question.remove();
    sendSuccess(res, null, 'Question supprimée');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

module.exports = router;
/**
 * @swagger
 * /forum:
 *   post:
 *     summary: Poster une question dans un cours
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               course:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question créée
 *       400:
 *         description: Champs manquants
 *       401:
 *         description: Non autorisé
 */