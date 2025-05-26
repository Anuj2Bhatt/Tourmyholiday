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
        console.log('=== Places API Debug ===');
        console.log('1. Received request for state:', stateName);
        
        // Get all states for debugging
        const [allStates] = await db.query('SELECT id, name, route FROM states');
        console.log('2. All states in database:', JSON.stringify(allStates, null, 2));
        
        // Get state ID with detailed logging
        const stateId = await getStateId(stateName);
        console.log('3. Found state ID:', stateId);
        
        if (!stateId) {
            console.log('4. No state found for:', stateName);
            return res.json([]);
        }
        
        // Verify places exist for this state
        const [placesCheck] = await db.query(
            'SELECT COUNT(*) as count FROM places WHERE state_id = ?',
            [stateId]
        );
        console.log('5. Places count for state:', placesCheck[0].count);
        
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
        console.log('6. Found places for state:', {
            stateName,
            stateId,
            placesCount: places.length,
            places: places.map(p => ({
                id: p.id,
                title: p.title,
                state_id: p.state_id
            }))
        });
        
        res.json(places || []);
    } catch (error) {
        console.error('Error in places API:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            stateName: req.params.stateName
        });
        res.json([]);
    }
});

// Serve place images
router.get('/places/images/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        console.log('Requested image:', filename);
        
        const imagePath = path.join(__dirname, '..', 'uploads', 'places', filename);
        console.log('Image path:', imagePath);

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            console.log('Image not found at path:', imagePath);
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
            console.error('Error streaming file:', error);
            res.status(500).json({ message: 'Error streaming file' });
        });
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ message: 'Error serving image' });
    }
});

// Helper function to get state ID from state name/URL
async function getStateId(stateName) {
    try {
        console.log('=== getStateId Debug ===');
        console.log('1. Input stateName:', stateName);
        
        // Remove leading slash and clean the state name
        const cleanStateName = stateName.replace(/^\//, '').toLowerCase().trim();
        console.log('2. Cleaned state name:', cleanStateName);
        
        // Get all states for debugging
        const [allStates] = await db.query('SELECT id, name, route FROM states');
        console.log('3. Available states:', JSON.stringify(allStates, null, 2));
        
        // Try exact match first
        const [exactMatch] = await db.query(
            `SELECT id, name, route 
             FROM states 
             WHERE LOWER(name) = ? 
             OR LOWER(route) = ? 
             OR LOWER(TRIM(LEADING '/' FROM route)) = ?`,
            [cleanStateName, cleanStateName, cleanStateName]
        );
        
        console.log('4. Exact match query results:', JSON.stringify(exactMatch, null, 2));
        
        if (exactMatch.length > 0) {
            console.log('5. Found exact match:', exactMatch[0]);
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
        
        console.log('6. Fuzzy match query results:', JSON.stringify(fuzzyMatch, null, 2));
        
        if (fuzzyMatch.length > 0) {
            console.log('7. Found fuzzy match:', fuzzyMatch[0]);
            return fuzzyMatch[0].id;
        }
        
        console.log('8. No state found for:', cleanStateName);
        return null;
    } catch (error) {
        console.error('Error in getStateId:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            stateName
        });
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
        console.error('Error fetching place:', error);
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
        console.error('Error creating place:', error);
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
        console.error('Error updating place:', error);
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
        console.error('Error deleting place:', error);
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
        console.log('Found places:', places);
        
        res.json(places || []);
    } catch (error) {
        console.error('Error fetching all places:', error);
        res.status(500).json({ message: 'Error fetching places' });
    }
});

module.exports = router; 