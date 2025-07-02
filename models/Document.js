const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true },
  filePath: { type: String, required: true }, // ex: URL ou chemin local
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);