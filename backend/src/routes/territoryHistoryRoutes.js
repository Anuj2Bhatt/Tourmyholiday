const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const TerritoryHistory = require('../models/TerritoryHistory');
const { validateTerritoryHistory } = require('../middleware/validationMiddleware');
const fs = require('fs');
const pool = require('../../db');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../uploads/territory-history');
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
        const imageUrl = `/uploads/territory-history/${req.file.filename}`;

        res.json({
            success: true,
            url: imageUrl,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
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
        res.status(500).json({
            success: false,
            error: 'Failed to fetch territory history'
        });
    }
});

// Get territory history by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // First try to get from territory_history
        const [territoryHistory] = await pool.query(`
            SELECT 
                th.id,
                th.territory_id,
                th.title,
                th.content,
                th.image,
                th.slug,
                th.status,
                th.meta_title,
                th.meta_description,
                th.meta_keywords,
                th.created_at,
                th.updated_at
            FROM territory_history th
            WHERE th.slug = ? AND th.status = 'Public'
        `, [slug]);

        // If not found in territory_history, try state_history
        if (territoryHistory.length === 0) {
            const [stateHistory] = await pool.query(`
                SELECT 
                    sh.id,
                    sh.state_id,
                    sh.title,
                    sh.content,
                    sh.image,
                    sh.slug,
                    sh.status,
                    sh.meta_title,
                    sh.meta_description,
                    sh.meta_keywords
                FROM state_history sh
                WHERE sh.slug = ? AND sh.status = 'Public'
            `, [slug]);

            if (stateHistory.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'History not found'
                });
            }

            // Format image URL for state history
            let historyItem = stateHistory[0];
            if (historyItem.image) {
                let imageUrl = historyItem.image;
                // Remove any leading slashes or 'uploads/' prefix
                imageUrl = imageUrl.replace(/^uploads[\\/]/, '').replace(/^\//, '');
                if (!imageUrl.startsWith('http')) {
                    imageUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${imageUrl}`;
                }
                historyItem.image = imageUrl;
            }

            return res.json({
                success: true,
                data: historyItem
            });
        }

        // Format image URL for territory history
        let historyItem = territoryHistory[0];
        if (historyItem.image) {
            let imageUrl = historyItem.image;
            // Remove any leading slashes or 'uploads/' prefix
            imageUrl = imageUrl.replace(/^uploads[\\/]/, '').replace(/^\//, '');
            if (!imageUrl.startsWith('http')) {
                imageUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${imageUrl}`;
            }
            historyItem.image = imageUrl;
        }

        res.json({
            success: true,
            data: historyItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch history'
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