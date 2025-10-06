const express = require('express');
const router = express.Router();
const authJwt = require('../middleware/authJwt');
const User = require('../models/User');

router.get('/', authJwt, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // Filtrer les cours selon le département et l’université
    // À adapter selon votre logique métier
    res.json({ courses: user.courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;