const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Direct upload to uploads folder
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload multiple images for state village
router.post('/state-village-images', upload.array('images', 10), async (req, res) => {
  try {
    const { village_id } = req.body;
    const altTexts = req.body.altTexts || [];
    const descriptions = req.body.descriptions || [];
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No images uploaded' 
      });
    }

    // Insert images into database
    const values = files.map((file, index) => [
      village_id,
      file.filename,
      altTexts[index] || '',
      descriptions[index] || '',
      index // display_order
    ]);

    const query = `
      INSERT INTO state_village_images 
      (village_id, image_path, alt_text, description, display_order) 
      VALUES ?
    `;

    await db.query(query, [values]);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: files.map(file => file.filename)
    });

  } catch (error) {
    console.error('Error uploading state village images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading images',
      error: error.message 
    });
  }
});

// Upload multiple images for territory village
router.post('/territory-village-images', upload.array('images', 10), async (req, res) => {
  try {
    const { village_id } = req.body;
    const altTexts = req.body.altTexts || [];
    const descriptions = req.body.descriptions || [];
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No images uploaded' 
      });
    }

    // Insert images into database
    const values = files.map((file, index) => [
      village_id,
      file.filename,
      altTexts[index] || '',
      descriptions[index] || '',
      index // display_order
    ]);

    const query = `
      INSERT INTO territory_village_images 
      (village_id, image_path, alt_text, description, display_order) 
      VALUES ?
    `;

    await db.query(query, [values]);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: files.map(file => file.filename)
    });

  } catch (error) {
    console.error('Error uploading territory village images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading images',
      error: error.message 
    });
  }
});

// Get images for a state village
router.get('/state-village-images/:villageId', async (req, res) => {
  try {
    const { villageId } = req.params;
    
    const query = `
      SELECT * FROM state_village_images 
      WHERE village_id = ? 
      ORDER BY display_order ASC
    `;

    const [images] = await db.query(query, [villageId]);

    res.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error('Error fetching state village images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching images',
      error: error.message 
    });
  }
});

// Get images for a territory village
router.get('/territory-village-images/:villageId', async (req, res) => {
  try {
    const { villageId } = req.params;
    
    const query = `
      SELECT * FROM territory_village_images 
      WHERE village_id = ? 
      ORDER BY display_order ASC
    `;

    const [images] = await db.query(query, [villageId]);

    res.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error('Error fetching territory village images:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching images',
      error: error.message 
    });
  }
});

// Delete an image
router.delete('/village-image/:imageId/:type', async (req, res) => {
  try {
    const { imageId, type } = req.params;
    const table = type === 'state' ? 'state_village_images' : 'territory_village_images';
    
    // First get the image path
    const [image] = await db.query(
      `SELECT image_path FROM ${table} WHERE id = ?`,
      [imageId]
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from database
    await db.query(
      `DELETE FROM ${table} WHERE id = ?`,
      [imageId]
    );

    // Delete file from uploads folder
    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', image.image_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting image',
      error: error.message 
    });
  }
});

module.exports = router; 