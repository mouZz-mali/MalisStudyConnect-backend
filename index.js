require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
connectDB();

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDocs = require('./swaggerOptions'); // ton fichier de config Swagger
const swaggerSpec = swaggerJsdoc(swaggerDocs);

const app = express();

// ========================
// Middleware
// ========================
app.use(express.json()); // parser JSON
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Debug middleware
app.use((req, res, next) => {
  console.log('➡️  Requête:', req.method, req.path);
  console.log('🔍 Headers:', req.headers);
  console.log('📥 Body reçu:', req.body);
  next();
});

// ========================
// Swagger UI
// ========================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ========================
// Routes API
// ========================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/universities', require('./routes/university'));
app.use('/api/communities', require('./routes/community'));
app.use('/api/documents', require('./routes/document'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/users', require('./routes/user'));

// ========================
// Routes de test
// ========================
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

app.get('/test-env', (req, res) => {
  res.json({
    JWT_SECRET: !!process.env.JWT_SECRET,
    REFRESH_TOKEN_SECRET: !!process.env.REFRESH_TOKEN_SECRET,
    MONGO_URI: !!process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  });
});

// ========================
// Démarrage du serveur
// ========================
const PORT = process.env.PORT || 5000;
console.log(`🔧 Port utilisé : ${PORT}`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Serveur lancé sur http://0.0.0.0:${PORT}`);
  console.log(`📄 Documentation Swagger : http://0.0.0.0:${PORT}/api-docs`);
});
