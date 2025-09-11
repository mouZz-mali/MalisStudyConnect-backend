require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
connectDB();

const app = express();

// ✅ 1. Middleware POUR parser le JSON (doit être en premier)
app.use(express.json());

// ✅ 2. Middlewares de sécurité et logs
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ✅ 3. Middleware de débogage (peut accéder à req.body)
app.use((req, res, next) => {
  console.log('➡️  Requête:', req.method, req.path);
  console.log('🔍 Headers:', req.headers);
  console.log('📥 Body reçu:', req.body); // ✅ Maintenant, req.body est bon
  next();
});

// ✅ 4. Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/universities', require('./routes/university'));
app.use('/api/communities', require('./routes/community'));
app.use('/api/documents', require('./routes/document'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/users', require('./routes/user'));

// ✅ 5. Routes de test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur MaliStudyConnect API 🎉' });
});

app.get('/test', async (req, res) => {
  try {
    const users = await mongoose.connection.db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 6. Démarrage du serveur
const PORT = process.env.PORT || 5000;
console.log(`🔧 Port utilisé : ${PORT}`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Serveur lancé sur http://0.0.0.0:${PORT}`);
});

// ✅ 7. Route pour tester les variables d'environnement
app.get('/test-env', (req, res) => {
  res.json({
    JWT_SECRET: !!process.env.JWT_SECRET,
    REFRESH_TOKEN_SECRET: !!process.env.REFRESH_TOKEN_SECRET,
    MONGO_URI: !!process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  });
});