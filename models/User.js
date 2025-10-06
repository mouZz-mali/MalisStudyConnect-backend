const mongoose = require('mongoose');

// models/User.js
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: { type: String, required: true },
  department: { type: String, required: true },
  courses: { type: [String], required: true },
  refreshToken: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }, // ✅ Nouveau champ
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);