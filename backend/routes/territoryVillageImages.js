const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/territory-villages';
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

// Get all images for a territory village
router.get('/:villageId', async (req, res) => {
  try {
    const { villageId } = req.params;
    console.log('Fetching images for territory village ID:', villageId);
    
    // First check if village exists
    const [village] = await db.query('SELECT id FROM territory_villages WHERE id = ?', [villageId]);
    if (village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }
    
    const [images] = await db.query(
      'SELECT * FROM territory_village_images WHERE village_id = ? ORDER BY display_order ASC',
      [villageId]
    );

    // Format image paths
    const formattedImages = images.map(img => ({
      ...img,
      image_path: `/uploads/territory-villages/${img.image_path}`
    }));

    res.json({
      success: true,
      data: formattedImages
    });
  } catch (error) {
    console.error('Error fetching territory village images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch village images: ' + error.message
    });
  }
});

// Upload multiple images for a territory village
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { village_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // First check if village exists
    const [village] = await db.query('SELECT id FROM territory_villages WHERE id = ?', [village_id]);
    if (village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    // Insert each image into database
    const values = files.map((file, index) => [
      village_id,
      file.filename,
      req.body.alt_texts?.[index] || '',
      req.body.descriptions?.[index] || '',
      req.body.display_orders?.[index] || index + 1
    ]);

    await db.query(
      'INSERT INTO territory_village_images (village_id, image_path, alt_text, description, display_order) VALUES ?',
      [values]
    );

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        files: files.map(file => ({
          filename: file.filename,
          path: `/uploads/territory-villages/${file.filename}`
        }))
      }
    });
  } catch (error) {
    console.error('Error uploading territory village images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images: ' + error.message
    });
  }
});

// Delete a territory village image
router.delete('/:imageId', async (req, res) => {
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
    const filePath = path.join(__dirname, '../../uploads/territory-villages', image[0].image_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting territory village image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image: ' + error.message
    });
  }
});

module.exports = router; 