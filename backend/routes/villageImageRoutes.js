const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log('Village Image Route accessed:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body
  });
  next();
});

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine which directory to use based on the route
    const isStateVillage = req.path.includes('/state/');
    const uploadDir = isStateVillage ? 'uploads/state-villages' : 'uploads/territory-villages';
    console.log('Upload directory selected:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all images for a state village
router.get('/state/:villageId', async (req, res) => {
  console.log('GET /state/:villageId called with params:', req.params);
  try {
    const { villageId } = req.params;
    console.log('Fetching images for state village ID:', villageId);
    
    // First check if village exists
    const [village] = await db.query('SELECT id FROM villages WHERE id = ?', [villageId]);
    console.log('Village check result:', village);

    if (village.length === 0) {
      console.log('Village not found');
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }
    
    const [images] = await db.query(
      'SELECT * FROM village_images WHERE village_id = ? ORDER BY display_order ASC',
      [villageId]
    );
    console.log('Images found:', images.length);

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error in GET /state/:villageId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch village images: ' + error.message
    });
  }
});

// Get all images for a territory village
router.get('/territory/:villageId', async (req, res) => {
  console.log('GET /territory/:villageId called with params:', req.params);
  try {
    const { villageId } = req.params;
    console.log('Fetching images for territory village ID:', villageId);
    
    // First check if village exists
    const [village] = await db.query('SELECT id FROM territory_villages WHERE id = ?', [villageId]);
    console.log('Village check result:', village);

    if (village.length === 0) {
      console.log('Village not found');
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }
    
    const [images] = await db.query(
      'SELECT * FROM territory_village_images WHERE village_id = ? ORDER BY display_order ASC',
      [villageId]
    );
    console.log('Images found:', images.length);

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error in GET /territory/:villageId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch territory village images: ' + error.message
    });
  }
});

// Upload multiple images for a state village
router.post('/state/:villageId', upload.array('images', 10), async (req, res) => {
  console.log('POST /state/:villageId called with params:', req.params);
  try {
    const { villageId } = req.params;
    const { alt_texts, descriptions, display_orders } = req.body;
    const files = req.files;

    console.log('Upload request details:', {
      villageId,
      filesCount: files?.length,
      alt_texts,
      descriptions,
      display_orders
    });

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // First check if village exists
    const [village] = await db.query('SELECT id FROM villages WHERE id = ?', [villageId]);
    if (village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    // Insert each image into database
    const values = files.map((file, index) => [
      villageId,
      file.filename,
      alt_texts?.[index] || '',
      descriptions?.[index] || '',
      display_orders?.[index] || index + 1
    ]);

    await db.query(
      'INSERT INTO village_images (village_id, image_path, alt_text, description, display_order) VALUES ?',
      [values]
    );

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        files: files.map(file => ({
          filename: file.filename,
          path: file.path
        }))
      }
    });
  } catch (error) {
    console.error('Error in POST /state/:villageId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images: ' + error.message
    });
  }
});

// Upload multiple images for a territory village
router.post('/territory/:villageId', upload.array('images', 10), async (req, res) => {
  console.log('POST /territory/:villageId called with params:', req.params);
  try {
    const { villageId } = req.params;
    const { alt_texts, descriptions, display_orders } = req.body;
    const files = req.files;

    console.log('Upload request details:', {
      villageId,
      filesCount: files?.length,
      alt_texts,
      descriptions,
      display_orders
    });

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // First check if village exists
    const [village] = await db.query('SELECT id FROM territory_villages WHERE id = ?', [villageId]);
    if (village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    // Insert each image into database
    const values = files.map((file, index) => [
      villageId,
      file.filename,
      alt_texts?.[index] || '',
      descriptions?.[index] || '',
      display_orders?.[index] || index + 1
    ]);

    await db.query(
      'INSERT INTO territory_village_images (village_id, image_path, alt_text, description, display_order) VALUES ?',
      [values]
    );

    res.json({
      success: true,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
    console.error('Error in POST /territory/:villageId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images: ' + error.message
    });
  }
});

// Delete a state village image
router.delete('/village-images/state/:imageId', async (req, res) => {
  console.log('DELETE /village-images/state/:imageId called with params:', req.params);
  try {
    const { imageId } = req.params;

    // Get image path before deleting
    const [image] = await db.query(
      'SELECT image_path FROM village_images WHERE id = ?',
      [imageId]
    );

    if (image.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from database
    await db.query('DELETE FROM village_images WHERE id = ?', [imageId]);

    // Delete file from uploads folder
    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads/state-villages', image[0].image_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /village-images/state/:imageId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image: ' + error.message
    });
  }
});

// Delete a territory village image
router.delete('/village-images/territory/:imageId', async (req, res) => {
  console.log('DELETE /village-images/territory/:imageId called with params:', req.params);
  try {
    const { imageId } = req.params;

    // Get image path before deleting
    const [image] = await db.query(
      'SELECT image_path FROM territory_village_images WHERE id = ?',
      [imageId]
    );

    if (image.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from database
    await db.query('DELETE FROM territory_village_images WHERE id = ?', [imageId]);

    // Delete file from uploads folder
    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads/territory-villages', image[0].image_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /village-images/territory/:imageId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image: ' + error.message
    });
  }
});

module.exports = router; 