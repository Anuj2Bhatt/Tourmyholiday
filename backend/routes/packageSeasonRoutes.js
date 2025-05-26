const express = require('express');
const router = express.Router();
const packageSeasonController = require('../controllers/packageSeasonController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use absolute path for uploads directory
        const uploadDir = path.join(__dirname, '..', 'uploads');
        console.log('Upload directory:', uploadDir);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
                console.log('Created upload directory:', uploadDir);
            } catch (error) {
                console.error('Error creating upload directory:', error);
                return cb(error);
            }
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = 'season-' + uniqueSuffix + ext;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        fieldSize: 5 * 1024 * 1024 // 5MB limit for fields
    },
    fileFilter: (req, file, cb) => {
        console.log('Processing file:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.error('Invalid file type:', file.mimetype);
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
        }
    }
});

// Add error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        console.error('Unknown error:', err);
        return res.status(500).json({
            success: false,
            message: `Error: ${err.message}`
        });
    }
    next();
};

// Season routes
router.post('/:packageId/seasons', packageSeasonController.createSeason);
router.put('/:packageId/seasons/:season', packageSeasonController.updateSeason);
router.get('/:packageId/seasons', packageSeasonController.getSeasons);
router.get('/:packageId/seasons/:season', packageSeasonController.getSeason);
router.delete('/:packageId/seasons/:season', packageSeasonController.deleteSeason);
router.patch('/:packageId/seasons/:season/toggle', packageSeasonController.toggleActive);

// Image routes
router.get('/:packageId/images', packageSeasonController.getImages);
router.get('/:packageId/seasons/:season/images', packageSeasonController.getSeasonImages);

// Upload image route with proper error handling
router.post(
    '/:packageId/seasons/:season/images',
    (req, res, next) => {
        console.log('Starting file upload...');
        upload.single('image')(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
            }
            console.log('File upload completed:', req.file);
            next();
        });
    },
    handleMulterError,
    packageSeasonController.uploadImage
);

router.put(
    '/:packageId/seasons/:season/images/:imageId',
    (req, res, next) => {
        upload.single('image')(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
            }
            next();
        });
    },
    handleMulterError,
    packageSeasonController.updateImage
);

router.delete(
    '/:packageId/seasons/:season/images/:imageId',
    packageSeasonController.deleteImage
);

module.exports = router; 