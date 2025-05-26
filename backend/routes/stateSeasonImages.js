const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Database connection pool (reuse your config)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tourmyholiday'
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

// GET all season images for a state and season
router.get('/:stateId/:season', async (req, res) => {
  try {
    const { stateId, season } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM state_season_images WHERE state_id = ? AND season = ?',
      [stateId, season]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch season images' });
  }
});

// POST new image for a state and season
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { state_id, season, location } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image uploaded' });

    const url = '/uploads/' + file.filename;
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO state_season_images (state_id, season, url, location) VALUES (?, ?, ?, ?)',
      [state_id, season, url, location]
    );
    connection.release();
    res.json({ message: 'Image uploaded', url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// DELETE an image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    // Get image path to delete file
    const [rows] = await connection.query('SELECT url FROM state_season_images WHERE id = ?', [id]);
    if (rows.length > 0) {
      const filePath = path.join(__dirname, '..', rows[0].url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await connection.query('DELETE FROM state_season_images WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// PUT update an image
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { season, location, alt, caption } = req.body;
    const connection = await pool.getConnection();

    // Get current image data
    const [currentImage] = await connection.query(
      'SELECT url FROM state_season_images WHERE id = ?',
      [id]
    );

    if (currentImage.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Image not found' });
    }

    let url = currentImage[0].url;

    // If new image is uploaded, delete old one and update url
    if (req.file) {
      // Delete old image file
      const oldFilePath = path.join(__dirname, '..', currentImage[0].url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      url = '/uploads/' + req.file.filename;
    }

    // Update the record
    await connection.query(
      `UPDATE state_season_images 
       SET season = ?, url = ?, location = ?, alt = ?, caption = ?
       WHERE id = ?`,
      [season, url, location, alt, caption, id]
    );

    // Get updated record
    const [updatedImage] = await connection.query(
      'SELECT * FROM state_season_images WHERE id = ?',
      [id]
    );

    connection.release();
    res.json(updatedImage[0]);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

module.exports = router; 