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
        // Correct path to save files to backend/uploads
        const uploadDir = path.join(__dirname, '../../uploads');
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
            // Only require preview_image for new territories (POST requests)
            if (req.method === 'POST') {
                if (!req.files || !req.files['preview_image'] || req.files['preview_image'].length === 0) {
                    throw new Error('Preview image is required for new territories');
                }
            }
            
            // If a file was uploaded (for either POST or PUT), validate it
            if (req.files && req.files['preview_image'] && req.files['preview_image'].length > 0) {
                const file = req.files['preview_image'][0];
                // Check file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error('Preview image must be a valid image file (JPEG, PNG, JPG)');
                }
                // Check file size (max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    throw new Error('Preview image size must not exceed 5MB');
                }
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

module.exports = router; 