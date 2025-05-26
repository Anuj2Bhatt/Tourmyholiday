const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
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
    cb(null, 'season-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .jpeg and .webp files are allowed!'));
  }
});

// GET all images for a season
router.get('/season/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;
    console.log('Fetching images for season:', seasonId);

    // Check if season exists
    const [season] = await pool.query('SELECT id FROM seasons WHERE id = ?', [seasonId]);
    if (season.length === 0) {
      console.log('Season not found:', seasonId);
      return res.status(404).json({ error: 'Season not found' });
    }

    // Check if season_images table exists
    try {
      await pool.query('SELECT 1 FROM season_images LIMIT 1');
    } catch (error) {
      console.log('Season images table does not exist, creating it...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS season_images (
          id INT PRIMARY KEY AUTO_INCREMENT,
          season_id INT NOT NULL,
          image_url VARCHAR(255) NOT NULL,
          alt_text VARCHAR(255),
          location VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE
        )
      `);
    }

    const [images] = await pool.query(
      'SELECT * FROM season_images WHERE season_id = ? ORDER BY created_at DESC',
      [seasonId]
    );
    
    // Format image URLs
    const formattedImages = images.map(img => ({
      ...img,
      image_url: `http://localhost:5000/uploads/${path.basename(img.image_url)}`
    }));
    
    console.log('Found images:', formattedImages.length);
    res.json(formattedImages);
  } catch (error) {
    console.error('Error fetching season images:', error);
    res.status(500).json({ 
      error: 'Failed to fetch season images',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST new image for a season
router.post('/season/:seasonId', upload.single('image'), async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { alt_text, location } = req.body;
    
    // Check if season exists
    const [season] = await pool.query('SELECT id FROM seasons WHERE id = ?', [seasonId]);
    if (season.length === 0) {
      console.log('Season not found:', seasonId);
      return res.status(404).json({ error: 'Season not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = `uploads/${req.file.filename}`;
    
    const [result] = await pool.query(
      'INSERT INTO season_images (season_id, image_url, alt_text, location) VALUES (?, ?, ?, ?)',
      [seasonId, imageUrl, alt_text, location]
    );
    
    res.status(201).json({
      id: result.insertId,
      season_id: seasonId,
      image_url: `http://localhost:5000/${imageUrl}`,
      alt_text,
      location
    });
  } catch (error) {
    console.error('Error adding season image:', error);
    res.status(500).json({ 
      error: 'Failed to add season image',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get image details before deleting
    const [images] = await pool.query('SELECT image_url FROM season_images WHERE id = ?', [id]);
    
    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete from database
    await pool.query('DELETE FROM season_images WHERE id = ?', [id]);
    
    // Delete file from filesystem
    const imagePath = path.join(__dirname, '..', images[0].image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting season image:', error);
    res.status(500).json({ 
      error: 'Failed to delete season image',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT update image
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, location } = req.body;
    
    // Get current image data
    const [currentImage] = await pool.query(
      'SELECT image_url FROM season_images WHERE id = ?',
      [id]
    );

    if (currentImage.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    let imageUrl = currentImage[0].image_url;

    // If new image is uploaded, delete old one and update url
    if (req.file) {
      // Delete old image file
      const oldFilePath = path.join(__dirname, '..', currentImage[0].image_url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      imageUrl = `uploads/${req.file.filename}`;
    }

    // Update the record
    await pool.query(
      `UPDATE season_images 
       SET image_url = ?, alt_text = ?, location = ?
       WHERE id = ?`,
      [imageUrl, alt_text, location, id]
    );

    // Get updated record
    const [updatedImage] = await pool.query(
      'SELECT * FROM season_images WHERE id = ?',
      [id]
    );

    // Format the response
    const formattedImage = {
      ...updatedImage[0],
      image_url: `http://localhost:5000/uploads/${path.basename(updatedImage[0].image_url)}`
    };

    res.json(formattedImage);
  } catch (error) {
    console.error('Error updating season image:', error);
    res.status(500).json({ 
      error: 'Failed to update season image',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 