// models/Forum.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  content: { type: String, required: true },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  answers: [answerSchema],
  createdAt: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 }
});

module.exports = mongoose.model('ForumQuestion', questionSchema);