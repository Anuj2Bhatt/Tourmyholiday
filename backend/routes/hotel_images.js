const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for hotel images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Helper to clean image path
const cleanImagePath = (file) => {
  if (!file) return '';
  return file.filename; // Only filename, no uploads/
};

// Get all images for a hotel
router.get('/:hotel_id', async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const [rows] = await db.query('SELECT * FROM hotel_images WHERE hotel_id = ?', [hotel_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch images', error: error.message });
  }
});

// Add image to hotel
router.post('/:hotel_id', upload.single('image'), async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const { alt_text, description } = req.body;
    const url = cleanImagePath(req.file);

    const [result] = await db.query(
      `INSERT INTO hotel_images (hotel_id, url, alt_text, description) VALUES (?, ?, ?, ?)`,
      [hotel_id, url, alt_text, description]
    );
    res.status(201).json({ id: result.insertId, url, alt_text, description });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add image', error: error.message });
  }
});

// Delete image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM hotel_images WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

module.exports = router;
