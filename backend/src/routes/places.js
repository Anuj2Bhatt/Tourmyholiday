const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../db');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'places');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all places for a state
router.get('/states/:stateIdentifier/places', async (req, res) => {
    try {
        const { stateIdentifier } = req.params;
        // First try to find state by ID
        let stateQuery = 'SELECT id, name, route FROM states WHERE id = ?';
        let queryParams = [stateIdentifier];
        
        // If stateIdentifier is not a number, try to find by route
        if (isNaN(stateIdentifier)) {
            stateQuery = 'SELECT id, name, route FROM states WHERE route = ?';
            queryParams = [`/${stateIdentifier}`];
        }
        
        // Get all states for debugging
        const [allStates] = await db.query('SELECT id, name, route FROM states');
        // Verify state exists
        const [states] = await db.query(stateQuery, queryParams);
        
        if (!states || states.length === 0) {
            return res.status(404).json({
                success: false,
                message: `State not found with identifier: ${stateIdentifier}`
            });
        }

        const state = states[0];
        const query = `
            SELECT 
                p.id,
                p.state_id,
                p.title,
                p.slug,
                p.location,
                p.description,
                p.content,
                p.best_time_to_visit as bestTimeToVisit,
                p.entry_fee as entryFee,
                p.timings,
                p.featured,
                p.featured_image,
                p.created_at as createdAt,
                p.updated_at as updatedAt,
                s.name as state_name,
                CASE 
                    WHEN p.featured_image IS NOT NULL 
                    THEN CONCAT('${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/places/', p.featured_image)
                    ELSE NULL 
                END as featured_image_url
            FROM places p
            JOIN states s ON p.state_id = s.id
            WHERE s.id = ?
            ORDER BY p.created_at DESC
        `;
        
        const [places] = await db.query(query, [state.id]);
        res.json({
            success: true,
            data: places || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching places',
            error: error.message
        });
    }
});

// Get a single place
router.get('/places/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                p.id,
                p.state_id,
                p.title,
                p.slug,
                p.location,
                p.description,
                p.content,
                p.best_time_to_visit as bestTimeToVisit,
                p.entry_fee as entryFee,
                p.timings,
                p.featured,
                p.featured_image,
                p.created_at as createdAt,
                p.updated_at as updatedAt,
                s.name as state_name,
                CASE 
                    WHEN p.featured_image IS NOT NULL 
                    THEN CONCAT('${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/places/', p.featured_image)
                    ELSE NULL 
                END as featured_image_url
            FROM places p
            JOIN states s ON p.state_id = s.id
            WHERE p.id = ?
        `;
        
        const [places] = await db.query(query, [id]);
        
        if (!places || places.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Place not found'
            });
        }

        res.json({
            success: true,
            data: places[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching place',
            error: error.message
        });
    }
});

// Add new place for a state
router.post('/states/:stateIdentifier/places', upload.single('featuredImage'), async (req, res) => {
    try {
        const { stateIdentifier } = req.params;
        const { title, slug, location, description, content, bestTimeToVisit, entryFee, timings, featured, featured_image } = req.body;
        
        // Find state by ID or route
        let stateQuery = 'SELECT id FROM states WHERE id = ?';
        let queryParams = [stateIdentifier];
        
        if (isNaN(stateIdentifier)) {
            stateQuery = 'SELECT id FROM states WHERE route = ?';
            queryParams = [`/${stateIdentifier}`];
        }
        
        const [states] = await db.query(stateQuery, queryParams);
        if (!states || states.length === 0) {
            return res.status(404).json({
                success: false,
                message: `State not found with identifier: ${stateIdentifier}`
            });
        }
        
        const stateId = states[0].id;
        // Verify state exists
        const [stateRows] = await db.query('SELECT id, name, route FROM states WHERE id = ?', [stateId]);
        
        if (!stateRows || stateRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: `State not found with ID: ${stateId}`
            });
        }

        const state = stateRows[0];
        // Validate required fields
        if (!title || !slug || !location || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, slug, location, and description are required'
            });
        }

        // Handle featured image
        const featuredImage = req.file ? req.file.filename : null;

        // Insert new place
        const query = `
            INSERT INTO places (
                state_id,
                title,
                slug,
                location,
                description,
                content,
                best_time_to_visit,
                entry_fee,
                timings,
                featured,
                featured_image,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const [result] = await db.query(query, [
            stateId,
            title,
            slug,
            location,
            description,
            content || '',
            bestTimeToVisit || '',
            entryFee || '',
            timings || '',
            featured === 'true' || featured === true ? 1 : 0,
            featuredImage
        ]);

        // Get the newly created place
        const [newPlaces] = await db.query(
            `SELECT 
                p.*,
                s.name as state_name,
                CASE 
                    WHEN p.featured_image IS NOT NULL 
                    THEN CONCAT('${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/places/', p.featured_image)
                    ELSE NULL 
                END as featured_image_url
            FROM places p
            JOIN states s ON p.state_id = s.id
            WHERE p.id = ?`,
            [result.insertId]
        );

        if (!newPlaces || newPlaces.length === 0) {
            throw new Error('Failed to retrieve created place');
        }

        res.status(201).json({
            success: true,
            message: 'Place created successfully',
            data: newPlaces[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating place',
            error: error.message
        });
    }
});

// Update a place
router.put('/states/:stateIdentifier/places/:placeId', upload.single('featuredImage'), async (req, res) => {
    try {
        const { stateIdentifier, placeId } = req.params;
        // Find state by ID or route
        let stateQuery = 'SELECT id FROM states WHERE id = ?';
        let queryParams = [stateIdentifier];
        
        if (isNaN(stateIdentifier)) {
            stateQuery = 'SELECT id FROM states WHERE route = ?';
            queryParams = [`/${stateIdentifier}`];
        }
        
        const [states] = await db.query(stateQuery, queryParams);
        if (!states || states.length === 0) {
            return res.status(404).json({
                success: false,
                message: `State not found with identifier: ${stateIdentifier}`
            });
        }
        
        const stateId = states[0].id;
        // Verify place exists and belongs to the state
        const [places] = await db.query(
            'SELECT * FROM places WHERE id = ? AND state_id = ?',
            [placeId, stateId]
        );

        if (!places || places.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Place not found or does not belong to the specified state'
            });
        }

        const {
            title,
            slug,
            location,
            description,
            content,
            bestTimeToVisit,
            entryFee,
            timings,
            featured
        } = req.body;

        // Validate required fields
        if (!title || !slug || !location || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, slug, location, and description are required'
            });
        }

        // Handle featured image
        const featuredImage = req.file ? req.file.filename : places[0].featured_image;

        // Update place
        const query = `
            UPDATE places SET
                title = ?,
                slug = ?,
                location = ?,
                description = ?,
                content = ?,
                best_time_to_visit = ?,
                entry_fee = ?,
                timings = ?,
                featured = ?,
                featured_image = ?,
                updated_at = NOW()
            WHERE id = ? AND state_id = ?
        `;

        await db.query(query, [
            title,
            slug,
            location,
            description,
            content || '',
            bestTimeToVisit || '',
            entryFee || '',
            timings || '',
            featured === 'true' || featured === true ? 1 : 0,
            featuredImage,
            placeId,
            stateId
        ]);

        // Get the updated place
        const [updatedPlaces] = await db.query(
            `SELECT 
                p.*,
                s.name as state_name,
                CASE 
                    WHEN p.featured_image IS NOT NULL 
                    THEN CONCAT('${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/places/', p.featured_image)
                    ELSE NULL 
                END as featured_image_url
            FROM places p
            JOIN states s ON p.state_id = s.id
            WHERE p.id = ? AND p.state_id = ?`,
            [placeId, stateId]
        );

        if (!updatedPlaces || updatedPlaces.length === 0) {
            throw new Error('Failed to retrieve updated place');
        }

        res.json({
            success: true,
            message: 'Place updated successfully',
            data: updatedPlaces[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating place',
            error: error.message
        });
    }
});

// Delete a place
router.delete('/states/:stateIdentifier/places/:placeId', async (req, res) => {
    try {
        const { stateIdentifier, placeId } = req.params;

        // Find state by ID or route
        let stateQuery = 'SELECT id FROM states WHERE id = ?';
        let queryParams = [stateIdentifier];
        
        if (isNaN(stateIdentifier)) {
            stateQuery = 'SELECT id FROM states WHERE route = ?';
            queryParams = [`/${stateIdentifier}`];
        }
        
        const [states] = await db.query(stateQuery, queryParams);
        if (!states || states.length === 0) {
            return res.status(404).json({
                success: false,
                message: `State not found with identifier: ${stateIdentifier}`
            });
        }
        
        const stateId = states[0].id;

        // Check if place exists and get its image filename
        const [places] = await db.query(
            'SELECT featured_image FROM places WHERE id = ? AND state_id = ?',
            [placeId, stateId]
        );

        if (!places || places.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Place not found or does not belong to specified state'
            });
        }

        const featuredImage = places[0].featured_image;

        // Delete from database
        await db.query('DELETE FROM places WHERE id = ? AND state_id = ?', [placeId, stateId]);

        // Delete the image file if it exists
        if (featuredImage) {
            const imagePath = path.join(__dirname, '..', '..', 'uploads', 'places', featuredImage);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    } else {
                    }
            });
        }

        res.json({
            success: true,
            message: 'Place deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting place',
            error: error.message
        });
    }
}); 

module.exports = router; 