const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TerritoryDistrictImage = require('../models/TerritoryDistrictImage');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'territory-district-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Get all images for a district
router.get('/district/:districtId/images', async (req, res) => {
    try {
        const images = await TerritoryDistrictImage.getImagesByDistrictId(req.params.districtId);
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Upload new image
router.post('/district/:districtId/images', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imageData = {
            district_id: req.params.districtId,
            image_url: `/uploads/${req.file.filename}`,
            caption: req.body.caption || '',
            alt_text: req.body.alt_text || ''
        };

        const imageId = await TerritoryDistrictImage.addImage(imageData);
        const newImage = await TerritoryDistrictImage.getImageById(imageId);
        
        res.status(201).json(newImage);
    } catch (error) {
        // Delete uploaded file if database operation fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) });
        }
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Delete image
router.delete('/images/:imageId', async (req, res) => {
    try {
        const image = await TerritoryDistrictImage.getImageById(req.params.imageId);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const success = await TerritoryDistrictImage.deleteImage(req.params.imageId);
        if (success) {
            // Delete the actual file
            const filePath = path.join(__dirname, '..', image.image_url);
            fs.unlink(filePath, (err) => {
                if (err) });
            
            res.json({ message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

module.exports = router; 