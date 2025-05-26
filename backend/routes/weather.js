const express = require('express');
const axios = require('axios');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// GET /api/weather?city=CityName
router.get('/weather', async (req, res) => {
  const city = req.query.city || 'Dehradun';
  const apiKey = process.env.OWM_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  try {
    const response = await axios.get(url);
    res.json({
      temperature: response.data.main?.temp,
      climate_description: response.data.weather?.[0]?.description,
      icon: response.data.weather?.[0]?.icon,
      raw: response.data // (optional) full data for debugging
    });
  } catch (err) {
    res.status(500).json({ error: 'Weather fetch failed', details: err.message });
  }
});

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/weather/seasonal-guides';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'seasonal-guide-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload seasonal guide images
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const altTexts = req.body.alt_texts || [];
    const imagePaths = req.files.map((file, index) => ({
      path: file.path.replace(/\\/g, '/'), // Convert Windows path to URL format
      alt_text: altTexts[index] || ''
    }));

    // Store image information in database
    const insertPromises = imagePaths.map(async (image) => {
      const [result] = await db.query(
        'INSERT INTO seasonal_guide_images (image_path, alt_text) VALUES (?, ?)',
        [image.path, image.alt_text]
      );
      return {
        ...image,
        id: result.insertId
      };
    });

    const uploadedImages = await Promise.all(insertPromises);

    res.json({
      message: 'Images uploaded successfully',
      imagePaths: uploadedImages.map(img => img.path),
      images: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Get seasonal guide images
router.get('/images/:guideId', async (req, res) => {
  try {
    const [images] = await db.query(
      'SELECT * FROM seasonal_guide_images WHERE guide_id = ?',
      [req.params.guideId]
    );
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Delete seasonal guide image
router.delete('/images/:imageId', async (req, res) => {
  try {
    // Get image path before deleting
    const [image] = await db.query(
      'SELECT image_path FROM seasonal_guide_images WHERE id = ?',
      [req.params.imageId]
    );

    if (image.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from database
    await db.query(
      'DELETE FROM seasonal_guide_images WHERE id = ?',
      [req.params.imageId]
    );

    // Delete file from filesystem
    const imagePath = image[0].image_path;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router; 