const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Database connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tourmyholiday',
  port: process.env.DB_PORT || 3306
});

// Multer setup for image upload
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
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s/g, '-'));
  }
});
const upload = multer({ storage: storage });

// GET all images for a state
router.get('/:stateId', async (req, res) => {
  try {
    const { stateId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM state_images WHERE state_id = ?', [stateId]);
    connection.release();
    // Map DB fields to frontend expected fields
    const images = rows.map(img => ({
      id: img.id,
      url: img.url,
      caption: img.caption,
      alt: img.alt
    }));
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch state images' });
  }
});

// POST add a new image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { state_id, caption, alt } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO state_images (state_id, url, caption, alt) VALUES (?, ?, ?, ?)',
      [state_id, imageUrl, caption, alt]
    );
    connection.release();
    res.status(201).json({ 
      id: result.insertId, 
      url: `http://localhost:5000${imageUrl}`, 
      caption, 
      alt 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload state image' });
  }
});

// DELETE an image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM state_images WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete state image' });
  }
});

module.exports = router;
