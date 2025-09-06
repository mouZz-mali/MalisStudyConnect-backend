const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===================== INSCRIPTION =====================
router.post('/signup', async (req, res) => {
  const {
    fullName,
    email,
    password,
    university,
    department,
    courses
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Utilisateur déjà existant' });

    user = new User({
      fullName,
      email,
      password,
      university,
      department,
      courses
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== CONNEXION =====================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Identifiants invalides' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Identifiants invalides' });

    // 🔐 Génère un accessToken (valide 1h)
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 🔁 Génère un refreshToken (valide 7 jours)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // 🔐 Sauvegarde le refreshToken dans la base
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token: accessToken,
      refreshToken, // ✅ envoyé au frontend
      user: {
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        department: user.department,
        courses: user.courses,
      },
    });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// ===================== REFRESH TOKEN =====================
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ msg: 'Token manquant' });

  try {
    // Vérifie si le refreshToken existe en DB
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ msg: 'Refresh token invalide' });

    // Vérifie la validité du refreshToken
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ msg: 'Refresh token expiré ou invalide' });

      // Génère un nouvel accessToken
      const newAccessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token: newAccessToken });
    });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// ===================== LOGOUT =====================
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(400).json({ msg: 'Utilisateur non trouvé' });

    // Supprime le refreshToken de la DB
    user.refreshToken = null;
    await user.save();

    res.json({ msg: 'Déconnexion réussie' });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
