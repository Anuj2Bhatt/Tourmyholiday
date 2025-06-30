const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const wildlifeFloraController = require('../controllers/wildlifeFloraController');
const fs = require('fs');

// Configure multer for file upload (images go directly to uploads folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'wildlife-flora-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'File size too large. Maximum size is 5MB.' 
            });
        }
        return res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    } else if (err) {
        return res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
    next();
};

// Validation middleware
const validateWildlifeFloraItem = [
    body('sanctuary_id').isInt().withMessage('Valid sanctuary ID is required'),
    body('category').custom((value) => {
        const validCategories = ['mammals', 'birds', 'reptiles', 'amphibians', 'fish', 'insects', 'butterflies', 'flowers', 'trees', 'herbs', 'grasses', 'flora', 'endangered_species', 'rare_species', 'migratory_birds', 'aquatic_life'];
        if (!validCategories.includes(value)) {
            throw new Error(`Valid category is required. Got: ${value}`);
        }
        return true;
    }),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('sort_order').optional().isInt().withMessage('Sort order must be a number'),
    body('is_active').optional().isBoolean().withMessage('Active status must be boolean')
];

const validateAdditionalImage = [
    body('alt_text').optional().trim(),
    body('sort_order').optional().isInt().withMessage('Sort order must be a number')
];

// Routes for wildlife flora items
router.get('/', wildlifeFloraController.getAllWildlifeFloraItems);
router.get('/grouped-by-sanctuary', wildlifeFloraController.getAllWildlifeFloraBySanctuary);
router.get('/sanctuary/:sanctuaryId', wildlifeFloraController.getWildlifeFloraBySanctuary);
router.get('/category/:category', wildlifeFloraController.getWildlifeFloraByCategory);
router.get('/:id', wildlifeFloraController.getWildlifeFloraItemById);

// Create wildlife flora item with image
router.post('/', 
    upload.single('image'), 
    handleMulterError,
    validateWildlifeFloraItem, 
    wildlifeFloraController.createWildlifeFloraItem
);

// Update wildlife flora item with image
router.put('/:id', 
    upload.single('image'), 
    handleMulterError,
    validateWildlifeFloraItem, 
    wildlifeFloraController.updateWildlifeFloraItem
);

// Delete wildlife flora item
router.delete('/:id', wildlifeFloraController.deleteWildlifeFloraItem);

// Delete all wildlife flora items for a sanctuary
router.delete('/sanctuary/:sanctuaryId', wildlifeFloraController.deleteAllWildlifeFloraBySanctuary);

// Routes for additional images
router.post('/:itemId/images', 
    upload.single('image'), 
    handleMulterError,
    validateAdditionalImage, 
    wildlifeFloraController.uploadAdditionalImages
);

router.delete('/images/:imageId', wildlifeFloraController.deleteAdditionalImage);

module.exports = router; 