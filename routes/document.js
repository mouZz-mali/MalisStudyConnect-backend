const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// Téléverser un document
router.post('/', async (req, res) => {
  try {
    const document = new Document(req.body);
    await document.save();
    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lister tous les documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find().populate('uploader');
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;