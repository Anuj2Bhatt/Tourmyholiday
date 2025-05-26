const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const territoryVillageController = require('../controllers/territoryVillageController');
const fs = require('fs');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Validation middleware
const validateVillage = [
  body('name').notEmpty().withMessage('Name is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('territory_id').isInt().withMessage('Valid territory ID is required'),
  body('meta_title').optional().isLength({ min: 50, max: 60 }).withMessage('Meta title must be between 50-60 characters'),
  body('meta_description').optional().isLength({ min: 150, max: 160 }).withMessage('Meta description must be between 150-160 characters'),
  body('meta_keywords').optional().custom(value => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    if (keywords.length < 8) {
      throw new Error('At least 8 keywords are required');
    }
    return true;
  })
];

// Routes
router.get('/', territoryVillageController.getTerritoryVillages);
router.get('/:id', territoryVillageController.getTerritoryVillage);
router.post('/', validateVillage, territoryVillageController.createTerritoryVillage);
router.put('/:id', validateVillage, territoryVillageController.updateTerritoryVillage);
router.delete('/:id', territoryVillageController.deleteTerritoryVillage);

// Image upload routes
router.post('/:id/images', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    const { alt_text, description, display_order } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Validate village exists
    const db = require('../config/database');
    const [village] = await db.query('SELECT id FROM territory_villages WHERE id = ?', [id]);
    
    if (!village || village.length === 0) {
      // Delete uploaded files if village doesn't exist
      files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads/territory-villages', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    // Move files to territory-villages directory
    const territoryVillageDir = path.join(__dirname, '../uploads/territory-villages');
    if (!fs.existsSync(territoryVillageDir)) {
      fs.mkdirSync(territoryVillageDir, { recursive: true });
    }

    const values = await Promise.all(files.map(async (file, index) => {
      const newPath = path.join(territoryVillageDir, file.filename);
      await fs.promises.rename(file.path, newPath);
      
      return [
        id,
        file.filename,
        alt_text || file.originalname,
        description || '',
        display_order || index + 1
      ];
    }));

    await db.query(
      'INSERT INTO territory_village_images (village_id, image_path, alt_text, description, display_order) VALUES ?',
      [values]
    );

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: files.map(file => ({
        filename: file.filename,
        path: `/uploads/territory-villages/${file.filename}`
      }))
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    
    // Cleanup uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

// Get village images
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../config/database');

    // Validate village exists
    const [village] = await db.query('SELECT id FROM territory_villages WHERE id = ?', [id]);
    if (!village || village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    const [images] = await db.query(
      'SELECT * FROM territory_village_images WHERE village_id = ? ORDER BY display_order ASC',
      [id]
    );

    res.json({
      success: true,
      data: images.map(img => ({
        ...img,
        image_path: `/uploads/territory-villages/${img.image_path}`
      }))
    });

  } catch (error) {
    console.error('Error fetching village images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: error.message
    });
  }
});

// Delete village image
router.delete('/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const db = require('../config/database');
    const fs = require('fs');

    // Get image details before deleting
    const [images] = await db.query(
      'SELECT image_path, village_id FROM territory_village_images WHERE id = ?',
      [imageId]
    );

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from database
    await db.query('DELETE FROM territory_village_images WHERE id = ?', [imageId]);

    // Delete file
    const filePath = path.join(__dirname, '../uploads/territory-villages', images[0].image_path);
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