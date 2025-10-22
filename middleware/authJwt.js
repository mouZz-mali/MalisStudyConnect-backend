// middleware/authJwt.js
const jwt = require('jsonwebtoken');

const authJwt = (req, res, next) => {
  // 🔍 On accepte à la fois Authorization: Bearer xxx et x-auth-token
  const authHeader = req.headers['authorization'] || req.header('x-auth-token');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Aucun token, autorisation refusée' });
  }

  // 🔹 Si c’est "Bearer xxx", on découpe
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // ✅ très important
    console.log('✅ Token valide, user ID =', req.user);
    next();
  } catch (err) {
    console.error('❌ Token invalide :', err.message);
    return res.status(401).json({ msg: 'Token invalide' });
  }
};

module.exports = authJwt;
