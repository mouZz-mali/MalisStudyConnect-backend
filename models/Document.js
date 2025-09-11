// models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['TD', 'TP', 'Résumé', 'Annale', 'Cours', 'Exercice']
  },
  filePath: { type: String, required: true },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // ✅ Majuscule
    required: true 
  },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 }
    }
  ],
  averageRating: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 }, // ✅ Ajouté
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);