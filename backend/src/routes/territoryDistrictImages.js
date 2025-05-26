const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TerritoryDistrictImage = require('../../models/TerritoryDistrictImage');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
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
    }
});

// Get all images for a district
router.get('/district/:districtId/images', async (req, res) => {
    try {
        const images = await TerritoryDistrictImage.getImagesByDistrictId(req.params.districtId);
        res.json(images);
    } catch (error) {
        console.error('Error fetching district images:', error);
        res.status(500).json({ message: 'Error fetching images' });
    }
});

// Upload new image
router.post('/district/:districtId/images', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const imageData = {
            district_id: req.params.districtId,
            image_url: `/uploads/${req.file.filename}`,
            caption: req.body.caption || '',
            alt_text: req.body.alt_text || ''
        };

        const imageId = await TerritoryDistrictImage.addImage(imageData);
        const image = await TerritoryDistrictImage.getImageById(imageId);
        res.status(201).json(image);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

// Delete image
router.delete('/images/:imageId', async (req, res) => {
    try {
        const image = await TerritoryDistrictImage.getImageById(req.params.imageId);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete file from uploads directory
        const imagePath = path.join(__dirname, '../../', image.image_url);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await TerritoryDistrictImage.deleteImage(req.params.imageId);
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
});

module.exports = router; 