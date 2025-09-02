const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true },
  filePath: { type: String, required: true }, // ex: URL ou chemin local
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 }
    }
  ],
  averageRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);