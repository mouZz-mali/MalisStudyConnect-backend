// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');
const ForumQuestion = require('../models/Forum');
const authJwt = require('../middleware/authJwt');
const { sendSuccess, sendError } = require('../utils/response');

// =====================
// Profil utilisateur
// =====================
router.get('/me', authJwt, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password -refreshToken');
    if (!user) return sendError(res, 'Utilisateur non trouvé', 404);

    sendSuccess(res, user, 'Profil récupéré');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

// =====================
// Mettre à jour les cours
// =====================
router.put('/me/courses', authJwt, async (req, res) => {
  const { courses } = req.body;

  if (!Array.isArray(courses) || courses.length === 0) {
    return sendError(res, 'La liste des cours doit être un tableau non vide', 400);
  }

  try {
    const user = await User.findById(req.user);
    if (!user) return sendError(res, 'Utilisateur non trouvé', 404);

    user.courses = courses;
    await user.save();

    sendSuccess(res, { courses: user.courses }, 'Cours mis à jour avec succès');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

// =====================
// Supprimer un cours de la liste
// =====================
router.delete('/me/courses/:course', authJwt, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return sendError(res, 'Utilisateur non trouvé', 404);

    user.courses = user.courses.filter(c => c !== req.params.course);
    await user.save();

    sendSuccess(res, { courses: user.courses }, 'Cours supprimé avec succès');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

// =====================
// Supprimer son compte et nettoyer les données associées
// =====================
router.delete('/me', authJwt, async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);
    if (!user) return sendError(res, 'Utilisateur non trouvé', 404);

    // Supprimer toutes les questions et réponses de l’utilisateur
    await ForumQuestion.updateMany(
      { 'answers.author': userId },
      { $pull: { answers: { author: userId } } }
    );
    await ForumQuestion.deleteMany({ author: userId });

    // Supprimer tous les documents de l’utilisateur
    await Document.deleteMany({ author: userId });

    // Supprimer l’utilisateur
    await User.findByIdAndDelete(userId);

    sendSuccess(res, null, 'Compte et données associées supprimés définitivement');
  } catch (err) {
    sendError(res, 'Erreur lors de la suppression', 500, err.message);
  }
});

module.exports = router;
