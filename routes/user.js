const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authJwt = require('../middleware/authJwt');

// Route protégée → requiert un token valide
router.get('/me', authJwt, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password'); // req.user vient du middleware
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;