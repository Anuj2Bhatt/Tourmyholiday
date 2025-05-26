const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create directory if it doesn't exist
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

// GET /api/state-village-images - Get all images
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM state_village_images ORDER BY village_id, display_order ASC');
    const images = result[0] || []; // Safely get first element or empty array
    
    // Format image paths - ensure no double /uploads/
    const formattedImages = images.map(img => ({
      ...img,
      image_path: img.image_path.startsWith('/uploads/') ? img.image_path : `/uploads/${img.image_path}`
    }));

    res.json({
      success: true,
      data: formattedImages
    });
  } catch (error) {
    console.error('Error fetching all village images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images: ' + error.message
    });
  }
});

// GET /api/state-village-images/:villageId - Get images for a specific village
router.get('/:villageId', async (req, res) => {
  try {
    const { villageId } = req.params;
    console.log('Fetching images for village ID:', villageId);
    
    // First check if village exists
    const villageResult = await db.query('SELECT id FROM villages WHERE id = ?', [villageId]);
    const village = villageResult[0] || [];
    if (village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }
    
    const imagesResult = await db.query(
      'SELECT * FROM state_village_images WHERE village_id = ? ORDER BY display_order ASC',
      [villageId]
    );
    const images = imagesResult[0] || [];

    // Format image paths - ensure no double /uploads/
    const formattedImages = images.map(img => ({
      ...img,
      image_path: img.image_path.startsWith('/uploads/') ? img.image_path : `/uploads/${img.image_path}`
    }));

    res.json({
      success: true,
      data: formattedImages
    });
  } catch (error) {
    console.error('Error fetching village images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch village images: ' + error.message
    });
  }
});

// POST /api/state-village-images - Upload multiple images
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { village_id } = req.body;
    const files = req.files;

    console.log('Upload request received:', {
      village_id,
      filesCount: files?.length,
      body: req.body
    });

    if (!village_id) {
      return res.status(400).json({
        success: false,
        message: 'Village ID is required'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // First check if village exists
    const [village] = await db.query('SELECT id FROM villages WHERE id = ?', [village_id]);
    if (village.length === 0) {
      // Delete uploaded files if village doesn't exist
      files.forEach(file => {
        const filePath = path.join(__dirname, '../../uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    // Insert each image into database
    const values = files.map((file, index) => [
      village_id,
      file.filename, // Store just the filename without /uploads/
      req.body.alt_texts?.[index] || '',
      req.body.descriptions?.[index] || '',
      req.body.display_orders?.[index] || index + 1
    ]);

    await db.query(
      'INSERT INTO state_village_images (village_id, image_path, alt_text, description, display_order) VALUES ?',
      [values]
    );

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        files: files.map(file => ({
          filename: file.filename,
          path: `/uploads/${file.filename}` // Add /uploads/ prefix here
        }))
      }
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images: ' + error.message
    });
  }
});

// DELETE /api/state-village-images/:imageId - Delete an image
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    // Get image path before deleting
    const [image] = await db.query(
      'SELECT image_path FROM state_village_images WHERE id = ?',
      [imageId]
    );

    if (image.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from database
    await db.query('DELETE FROM state_village_images WHERE id = ?', [imageId]);

    // Delete file from uploads folder
    const filePath = path.join(__dirname, '../../uploads', image[0].image_path);
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
      message: 'Failed to delete image: ' + error.message
    });
  }
});

module.exports = router; 