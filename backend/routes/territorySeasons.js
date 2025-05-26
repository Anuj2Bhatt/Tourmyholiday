const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/territory-seasons')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
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

// Get all seasons for a territory district
router.get('/district/:districtId', async (req, res) => {
    try {
        const [seasons] = await db.query(
            'SELECT * FROM territory_seasons WHERE territory_district_id = ? ORDER BY season_name',
            [req.params.districtId]
        );
        res.json(seasons);
    } catch (error) {
        console.error('Error fetching territory seasons:', error);
        res.status(500).json({ error: 'Failed to fetch seasons' });
    }
});

// Create a new season for territory district
router.post('/', async (req, res) => {
    try {
        const { territory_district_id, season_name } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO territory_seasons (territory_district_id, season_name) VALUES (?, ?)',
            [territory_district_id, season_name]
        );
        
        res.status(201).json({
            id: result.insertId,
            territory_district_id,
            season_name
        });
    } catch (error) {
        console.error('Error creating territory season:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'This season already exists for this district' });
        } else {
            res.status(500).json({ error: 'Failed to create season' });
        }
    }
});

// Delete a season
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM territory_seasons WHERE id = ?', [req.params.id]);
        res.json({ message: 'Season deleted successfully' });
    } catch (error) {
        console.error('Error deleting territory season:', error);
        res.status(500).json({ error: 'Failed to delete season' });
    }
});

module.exports = router; 