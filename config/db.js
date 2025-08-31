// config/db.js
const mongoose = require('mongoose');

// ✅ Importe tous les modèles centralisés
require('../models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Échec de connexion à MongoDB', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;