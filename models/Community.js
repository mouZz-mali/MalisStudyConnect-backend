const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  course: { type: String, required: true },
  department: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Community', communitySchema);