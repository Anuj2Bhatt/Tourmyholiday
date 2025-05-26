const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const TerritoryHistory = require('../models/TerritoryHistory');
const { validateTerritoryHistory } = require('../middleware/validationMiddleware');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'territory-history-' + uniqueSuffix + path.extname(file.originalname));
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
});

// Upload territory history image
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }

        // Create the full URL for the uploaded image
        const imageUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: imageUrl,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading territory history image:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload image'
        });
    }
});

// Get all territory history entries with optional filtering
router.get('/', async (req, res) => {
    try {
        const history = await TerritoryHistory.getAll(req.query);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching territory history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch territory history'
        });
    }
});

// Get territory history by ID
router.get('/:id', async (req, res) => {
    try {
        const history = await TerritoryHistory.getById(req.params.id);
        if (!history) {
            return res.status(404).json({
                success: false,
                error: 'Territory history not found'
            });
        }
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching territory history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch territory history'
        });
    }
});

// Get territory history by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const history = await TerritoryHistory.getBySlug(req.params.slug);
        if (!history) {
            return res.status(404).json({
                success: false,
                error: 'Territory history not found'
            });
        }
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching territory history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch territory history'
        });
    }
});

// Create new territory history
router.post('/', validateTerritoryHistory, async (req, res) => {
    try {
        // Check if slug already exists
        const slugExists = await TerritoryHistory.checkSlugExists(req.body.slug);
        if (slugExists) {
            return res.status(400).json({
                success: false,
                error: 'Slug already exists'
            });
        }

        const history = await TerritoryHistory.create(req.body);
        res.status(201).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error creating territory history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create territory history'
        });
    }
});

// Update territory history
router.put('/:id', validateTerritoryHistory, async (req, res) => {
    try {
        // Check if slug exists for other entries
        const slugExists = await TerritoryHistory.checkSlugExists(req.body.slug, req.params.id);
        if (slugExists) {
            return res.status(400).json({
                success: false,
                error: 'Slug already exists'
            });
        }

        const history = await TerritoryHistory.update(req.params.id, req.body);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error updating territory history:', error);
        if (error.message === 'Territory history not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update territory history'
        });
    }
});

// Delete territory history
router.delete('/:id', async (req, res) => {
    try {
        await TerritoryHistory.delete(req.params.id);
        res.json({
            success: true,
            message: 'Territory history deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting territory history:', error);
        if (error.message === 'Territory history not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to delete territory history'
        });
    }
});

module.exports = router; 