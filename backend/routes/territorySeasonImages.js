const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'territory-season-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all images for a season
router.get('/season/:seasonId', async (req, res) => {
    try {
        const [images] = await db.query(
            'SELECT * FROM territory_season_images WHERE season_id = ? ORDER BY image_order',
            [req.params.seasonId]
        );
        res.json(images);
    } catch (error) {
        console.error('Error fetching territory season images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Upload a new image for a season
router.post('/season/:seasonId', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { location, alt_text, description } = req.body;
        const seasonId = req.params.seasonId;

        // Get current max image_order
        const [maxOrder] = await db.query(
            'SELECT MAX(image_order) as max_order FROM territory_season_images WHERE season_id = ?',
            [seasonId]
        );
        const nextOrder = (maxOrder[0].max_order || 0) + 1;

        const [result] = await db.query(
            'INSERT INTO territory_season_images (season_id, image_url, location, alt_text, description, image_order) VALUES (?, ?, ?, ?, ?, ?)',
            [seasonId, req.file.path, location, alt_text, description, nextOrder]
        );

        res.status(201).json({
            id: result.insertId,
            season_id: seasonId,
            image_url: req.file.path,
            location,
            alt_text,
            description,
            image_order: nextOrder
        });
    } catch (error) {
        console.error('Error uploading territory season image:', error);
        // Delete uploaded file if database insert fails
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Update an image
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { location, alt_text, description } = req.body;
        const imageId = req.params.id;

        let updateQuery = 'UPDATE territory_season_images SET location = ?, alt_text = ?, description = ?';
        let queryParams = [location, alt_text, description];

        if (req.file) {
            // Get old image path
            const [oldImage] = await db.query(
                'SELECT image_url FROM territory_season_images WHERE id = ?',
                [imageId]
            );

            // Delete old image file
            if (oldImage[0]?.image_url) {
                try {
                    fs.unlinkSync(oldImage[0].image_url);
                } catch (unlinkError) {
                    console.error('Error deleting old image file:', unlinkError);
                }
            }

            updateQuery += ', image_url = ?';
            queryParams.push(req.file.path);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(imageId);

        await db.query(updateQuery, queryParams);

        // Get updated image data
        const [updatedImage] = await db.query(
            'SELECT * FROM territory_season_images WHERE id = ?',
            [imageId]
        );

        res.json(updatedImage[0]);
    } catch (error) {
        console.error('Error updating territory season image:', error);
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        res.status(500).json({ error: 'Failed to update image' });
    }
});

// Delete an image
router.delete('/:id', async (req, res) => {
    try {
        // Get image path before deleting
        const [image] = await db.query(
            'SELECT image_url FROM territory_season_images WHERE id = ?',
            [req.params.id]
        );

        // Delete from database
        await db.query('DELETE FROM territory_season_images WHERE id = ?', [req.params.id]);

        // Delete image file
        if (image[0]?.image_url) {
            try {
                fs.unlinkSync(image[0].image_url);
            } catch (unlinkError) {
                console.error('Error deleting image file:', unlinkError);
            }
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting territory season image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// Update image order
router.put('/:id/order', async (req, res) => {
    try {
        const { image_order } = req.body;
        await db.query(
            'UPDATE territory_season_images SET image_order = ? WHERE id = ?',
            [image_order, req.params.id]
        );
        res.json({ message: 'Image order updated successfully' });
    } catch (error) {
        console.error('Error updating territory season image order:', error);
        res.status(500).json({ error: 'Failed to update image order' });
    }
});

module.exports = router; 