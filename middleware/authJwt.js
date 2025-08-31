const jwt = require('jsonwebtoken');

const authJwt = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'Aucun token, autorisation refusée' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // ✅ decoded.userId, pas decoded.user
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token invalide' });
  }
};

module.exports = authJwt;