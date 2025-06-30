const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const wildlifeController = require('../controllers/wildlifeController');
const fs = require('fs');

// Configure multer for file upload
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
        cb(null, 'wildlife-' + uniqueSuffix + path.extname(file.originalname));
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
const validateWildlife = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('metaTitle').optional().trim(),
    body('metaDescription').optional().trim(),
    body('metaKeywords').optional().trim()
];

// Routes
router.get('/', wildlifeController.getAllSanctuaries);
router.get('/:id', wildlifeController.getSanctuaryById);
router.post('/', 
    upload.single('featuredImage'), 
    handleMulterError,
    validateWildlife, 
    wildlifeController.createSanctuary
);
router.put('/:id', 
    upload.single('featuredImage'), 
    handleMulterError,
    validateWildlife, 
    wildlifeController.updateSanctuary
);
router.delete('/:id', wildlifeController.deleteSanctuary);

module.exports = router; 