const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'place-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
});

// Get all places for a state
router.get('/states/:stateName/places', async (req, res) => {
    try {
        const { stateName } = req.params;
        // Get all states for debugging
        const [allStates] = await db.query('SELECT id, name, route FROM states');
        );
        
        // Get state ID with detailed logging
        const stateId = await getStateId(stateName);
        if (!stateId) {
            return res.json([]);
        }
        
        // Verify places exist for this state
        const [placesCheck] = await db.query(
            'SELECT COUNT(*) as count FROM places WHERE state_id = ?',
            [stateId]
        );
        const query = `
            SELECT 
                p.*,
                s.name as state_name,
                CASE 
                    WHEN p.featured_image IS NOT NULL 
                    THEN CONCAT('http://localhost:5000/uploads/places/', p.featured_image)
                    ELSE NULL 
                END as featured_image_url
            FROM places p
            JOIN states s ON p.state_id = s.id
            WHERE s.id = ?
            ORDER BY p.created_at DESC
        `;
        
        const [places] = await db.query(query, [stateId]);
        )
        });
        
        res.json(places || []);
    } catch (error) {
        res.json([]);
    }
});

// Serve place images
router.get('/places/images/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path.join(__dirname, '..', 'uploads', 'places', filename);
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Get file extension
        const ext = path.extname(filename).toLowerCase();
        
        // Set content type based on file extension
        let contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.gif') contentType = 'image/gif';
        if (ext === '.webp') contentType = 'image/webp';

        // Set headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Stream the file
        const fileStream = fs.createReadStream(imagePath);
        fileStream.on('error', (error) => {
            res.status(500).json({ message: 'Error streaming file' });
        });
        fileStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error serving image' });
    }
});

// Helper function to get state ID from state name/URL
async function getStateId(stateName) {
    try {
        // Remove leading slash and clean the state name
        const cleanStateName = stateName.replace(/^\//, '').toLowerCase().trim();
        // Get all states for debugging
        const [allStates] = await db.query('SELECT id, name, route FROM states');
        );
        
        // Try exact match first
        const [exactMatch] = await db.query(
            `SELECT id, name, route 
             FROM states 
             WHERE LOWER(name) = ? 
             OR LOWER(route) = ? 
             OR LOWER(TRIM(LEADING '/' FROM route)) = ?`,
            [cleanStateName, cleanStateName, cleanStateName]
        );
        
        );
        
        if (exactMatch.length > 0) {
            return exactMatch[0].id;
        }
        
        // Try fuzzy match
        const [fuzzyMatch] = await db.query(
            `SELECT id, name, route 
             FROM states 
             WHERE LOWER(name) LIKE ? 
             OR LOWER(REPLACE(name, ' ', '-')) LIKE ?`,
            [`%${cleanStateName}%`, `%${cleanStateName}%`]
        );
        
        );
        
        if (fuzzyMatch.length > 0) {
            return fuzzyMatch[0].id;
        }
        
        return null;
    } catch (error) {
        throw error;
    }
}

// Get a single place
router.get('/places/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.*, s.name as state_name 
            FROM places p
            JOIN states s ON p.state_id = s.id
            WHERE p.id = ?
        `;
        
        const [places] = await db.query(query, [id]);
        
        if (places.length === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }
        
        res.json(places[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching place' });
    }
});

// Create a new place
router.post('/states/:stateName/places', upload.single('featuredImage'), async (req, res) => {
    try {
        const { stateName } = req.params;
        const stateId = await getStateId(stateName);
        
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
            return res.status(400).json({ message: 'Missing required fields' });
        }

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

        const values = [
            stateId,
            title,
            slug,
            location,
            description,
            content,
            bestTimeToVisit,
            entryFee,
            timings,
            featured === '1' ? 1 : 0,
            req.file ? req.file.filename : null
        ];

        const [result] = await db.query(query, values);
        
        res.status(201).json({
            message: 'Place created successfully',
            placeId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ 
            message: error.message || 'Error creating place',
            details: {
                stateName: req.params.stateName,
                error: error.toString()
            }
        });
    }
});

// Update a place
router.put('/states/:stateName/places/:id', upload.single('featuredImage'), async (req, res) => {
    try {
        const { stateName, id } = req.params;
        const stateId = await getStateId(stateName);
        
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
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // First get the current place to check if it exists
        const [places] = await db.query('SELECT * FROM places WHERE id = ? AND state_id = ?', [id, stateId]);
        
        if (places.length === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }

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
                featured_image = COALESCE(?, featured_image),
                updated_at = NOW()
            WHERE id = ? AND state_id = ?
        `;

        const values = [
            title,
            slug,
            location,
            description,
            content,
            bestTimeToVisit,
            entryFee,
            timings,
            featured === '1' ? 1 : 0,
            req.file ? req.file.filename : null,
            id,
            stateId
        ];

        await db.query(query, values);
        
        res.json({ message: 'Place updated successfully' });
    } catch (error) {
        res.status(404).json({ 
            message: error.message || 'Error updating place',
            details: {
                stateName: req.params.stateName,
                error: error.toString()
            }
        });
    }
});

// Delete a place
router.delete('/states/:stateName/places/:id', async (req, res) => {
    try {
        const { stateName, id } = req.params;
        const stateId = await getStateId(stateName);

        // First get the place to check if it exists
        const [places] = await db.query('SELECT * FROM places WHERE id = ? AND state_id = ?', [id, stateId]);
        
        if (places.length === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }

        // Delete the place
        await db.query('DELETE FROM places WHERE id = ? AND state_id = ?', [id, stateId]);
        
        res.json({ message: 'Place deleted successfully' });
    } catch (error) {
        res.status(404).json({ 
            message: error.message || 'Error deleting place',
            details: {
                stateName: req.params.stateName,
                error: error.toString()
            }
        });
    }
});

// Get all places
router.get('/places', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                s.name as state_name,
                CASE 
                    WHEN p.featured_image IS NOT NULL 
                    THEN CONCAT('http://localhost:5000/uploads/places/', p.featured_image)
                    ELSE NULL 
                END as featured_image_url
            FROM places p
            JOIN states s ON p.state_id = s.id
            ORDER BY p.created_at DESC
        `;
        
        const [places] = await db.query(query);
        res.json(places || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching places' });
    }
});

// Get a single place by slug
router.get('/places/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
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
                    THEN CONCAT('http://localhost:5000/uploads/places/', p.featured_image)
                    ELSE NULL 
                END as featured_image_url
            FROM places p
            JOIN states s ON p.state_id = s.id
            WHERE p.slug = ?
        `;
        
        const [places] = await db.query(query, [slug]);
        
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

module.exports = router; 