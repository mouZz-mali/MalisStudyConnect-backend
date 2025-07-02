require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');

// Connexion à MongoDB
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/universities', require('./routes/university'));
app.use('/api/communities', require('./routes/community'));
app.use('/api/documents', require('./routes/document'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/users', require('./routes/user'));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur MaliStudyConnect API 🎉' });
});

// Route de test pour récupérer tous les utilisateurs
app.get('/test', async (req, res) => {
  try {
    const users = await mongoose.connection.db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🟢 Serveur lancé sur le port ${PORT}`);
});