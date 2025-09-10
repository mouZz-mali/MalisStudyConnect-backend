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
  try {
    console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? 'Présent' : 'MANQUANT');
    console.log('🔁 REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Présent' : 'MANQUANT');
    console.log('🌐 MONGO_URI:', process.env.MONGO_URI ? 'Présent' : 'MANQUANT');
    console.log('🔐 /login appelé');
    console.log('📩 req.body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(400).json({ msg: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Mot de passe incorrect');
      return res.status(400).json({ msg: 'Identifiants invalides' });
    }

    // ✅ Vérifie que les secrets existent
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET non défini');
      return res.status(500).json({ msg: 'Erreur serveur : JWT_SECRET manquant' });
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
      console.error('❌ REFRESH_TOKEN_SECRET non défini');
      return res.status(500).json({ msg: 'Erreur serveur : REFRESH_TOKEN_SECRET manquant' });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        department: user.department,
        courses: user.courses,
      },
    });
  } catch (err) {
    console.error('💥 Erreur critique dans /login:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Erreur serveur interne' });
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
