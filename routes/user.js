// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');
const ForumQuestion = require('../models/Forum');
const authJwt = require('../middleware/authJwt');
const { sendSuccess, sendError } = require('../utils/response');

// =====================
// Profil utilisateur - VERSION DEBUG TOKEN
// =====================
router.get('/me', authJwt, async (req, res) => {
  try {
    console.log("Utilisateur connecté :", req.user); // 👈 voir l'ID reçu
    const user = await User.findById(req.user);
    console.log("Utilisateur trouvé :", user); // 👈 vérifier le contenu

    if (!user) return sendError(res, 'Utilisateur non trouvé', 404);

    if (!user.fullName || !user.university || !user.department) {
      console.log("Champs manquants :", user.fullName, user.university, user.department);
      return sendError(res, 'Profil incomplet', 400);
    }

    sendSuccess(res, user);
  } catch (err) {
    console.error("Erreur serveur :", err);
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

// =====================
// Mettre à jour le profil utilisateur
// =====================
router.put('/profile', authJwt, async (req, res) => {
  const { fullName, university, department, email } = req.body;

  if (!fullName || !university || !department || !email) {
    return sendError(res, 'Tous les champs sont requis', 400);
  }

  try {
    const user = await User.findById(req.user);
    if (!user) return sendError(res, 'Utilisateur non trouvé', 404);

    user.fullName = fullName;
    user.university = university;
    user.department = department;
    user.email = email;
    await user.save();

    // On retourne le profil mis à jour
    const updatedUser = await User.findById(req.user)
      .populate('university', 'name')
      .populate('department', 'name');

    sendSuccess(res, {
      fullName: updatedUser.fullName,
      university: updatedUser.university.name,
      department: updatedUser.department.name,
      email: updatedUser.email,
      courses: updatedUser.courses,
    }, 'Profil mis à jour avec succès');
  } catch (err) {
    sendError(res, 'Erreur serveur', 500, err.message);
  }
});

module.exports = router;
