const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const territoryController = require('../controllers/territoryController');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use exact same path as static middleware
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create exact same filename format as existing images
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Keep original extension
        const ext = path.extname(file.originalname);
        // Create filename in format: preview_image-timestamp-randomnumber.ext
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).fields([
    { name: 'preview_image', maxCount: 1 },
    { name: 'featured_image', maxCount: 1 }
]);

// Validation middleware
const validateTerritory = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 2, max: 255 }).withMessage('Title must be between 2 and 255 characters'),
    
    body('slug')
        .trim()
        .notEmpty().withMessage('Slug is required')
        .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
        .isLength({ min: 2, max: 255 }).withMessage('Slug must be between 2 and 255 characters'),
    
    body('capital')
        .trim()
        .notEmpty().withMessage('Capital is required')
        .isLength({ min: 2, max: 255 }).withMessage('Capital must be between 2 and 255 characters'),
    
    body('famous_for')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Famous for must not exceed 1000 characters'),
    
    body('preview_image')
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('Preview image is required');
            }
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                throw new Error('Preview image must be a valid image file (JPEG, PNG)');
            }
            // Check file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (req.file.size > maxSize) {
                throw new Error('Preview image size must not exceed 5MB');
            }
            return true;
        }),
    
    body('meta_title')
        .trim()
        .notEmpty().withMessage('Meta title is required')
        .isLength({ min: 50, max: 60 }).withMessage('Meta title must be between 50 and 60 characters'),
    
    body('meta_description')
        .trim()
        .notEmpty().withMessage('Meta description is required')
        .isLength({ min: 150, max: 160 }).withMessage('Meta description must be between 150 and 160 characters'),
    
    body('meta_keywords')
        .trim()
        .notEmpty().withMessage('Meta keywords are required')
        .custom((value) => {
            if (!value) return false;
            const keywords = value.split(',').map(k => k.trim()).filter(k => k);
            if (keywords.length < 8) {
                throw new Error('At least 8 keywords are required');
            }
            return true;
        })
];

// Routes
router.get('/', territoryController.getAllTerritories);
router.get('/slug/:slug', territoryController.getTerritoryBySlug);
router.get('/:id', territoryController.getTerritory);
router.post('/', upload, validateTerritory, territoryController.createTerritory);
router.put('/:id', upload, validateTerritory, territoryController.updateTerritory);
router.delete('/:id', territoryController.deleteTerritory);

// Update territory by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      state_name,
      description,
      featured_image,
      banner_image,
      meta_title,
      meta_description,
      meta_keywords
    } = req.body;

    console.log('Updating territory with ID:', id);

    // First check if territory exists
    const [territories] = await pool.query('SELECT id FROM territories WHERE id = ?', [id]);
    if (territories.length === 0) {
      return res.status(404).json({ message: 'Territory not found' });
    }

    // Check if slug is already taken by another territory
    if (slug) {
      const [existing] = await pool.query(
        'SELECT id FROM territories WHERE slug = ? AND id != ?',
        [slug, id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Slug is already taken by another territory' });
      }
    }

    // Update territory
    const [result] = await pool.query(`
      UPDATE territories 
      SET 
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        state_name = COALESCE(?, state_name),
        description = COALESCE(?, description),
        featured_image = COALESCE(?, featured_image),
        banner_image = COALESCE(?, banner_image),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name,
      slug,
      state_name,
      description,
      featured_image,
      banner_image,
      meta_title,
      meta_description,
      meta_keywords,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Territory not found or no changes made' });
    }

    // Get updated territory
    const [updated] = await pool.query(`
      SELECT t.*, s.name as state_name 
      FROM territories t
      JOIN states s ON t.state_name = s.name
      WHERE t.id = ?
    `, [id]);

    // Format image URLs
    const territory = {
      ...updated[0],
      featured_image: updated[0].featured_image ? `http://localhost:5000/uploads/${path.basename(updated[0].featured_image)}` : null,
      banner_image: updated[0].banner_image ? `http://localhost:5000/uploads/${path.basename(updated[0].banner_image)}` : null
    };

    console.log('Successfully updated territory:', id);
    res.json({
      message: 'Territory updated successfully',
      territory
    });
  } catch (error) {
    console.error('Error updating territory:', error);
    res.status(500).json({ 
      message: 'Failed to update territory', 
      error: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

module.exports = router; 