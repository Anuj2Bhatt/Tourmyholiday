const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const wildlifeMediaController = require('../controllers/wildlifeMediaController');

// Configure multer for gallery images upload (unlimited images)
const galleryStorage = multer.diskStorage({
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
        cb(null, 'wildlife-gallery-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer for video upload
const videoStorage = multer.diskStorage({
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
        cb(null, 'wildlife-video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images (PNG, JPG, JPEG, WebP)
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid image format. Only PNG, JPG, JPEG and WebP images are allowed.'), false);
    }
};

// File filter for videos
const videoFileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid video format. Only MP4, AVI, MOV, WMV, FLV and WebM videos are allowed.'), false);
    }
};

// Multer configurations
const uploadGalleryImages = multer({ 
    storage: galleryStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per image
        files: 50 // Allow up to 50 images at once (practically unlimited)
    }
});

const uploadVideo = multer({ 
    storage: videoStorage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit per video
    }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'File size too large. Maximum size is 10MB for images and 100MB for videos.' 
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
                success: false, 
                message: 'Too many files. Maximum 50 images can be uploaded at once.' 
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

// Gallery Images routes
router.post('/:sanctuaryId/gallery', 
    uploadGalleryImages.array('galleryImages', 50), // Allow up to 50 images
    handleMulterError,
    wildlifeMediaController.uploadGalleryImages
);

router.get('/:sanctuaryId/gallery', wildlifeMediaController.getGalleryImages);
router.delete('/:sanctuaryId/gallery/:imageId', wildlifeMediaController.deleteGalleryImage);

// Video routes
router.post('/:sanctuaryId/videos', 
    uploadVideo.single('video'),
    handleMulterError,
    wildlifeMediaController.uploadVideo
);

router.get('/:sanctuaryId/videos', wildlifeMediaController.getVideos);
router.delete('/:sanctuaryId/videos/:videoId', wildlifeMediaController.deleteVideo);

module.exports = router; 