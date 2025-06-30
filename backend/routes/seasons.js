const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Simple test route
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/seasons');
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
    cb(new Error('Only .png, .jpg, .jpeg and .webp files are allowed!'));
  }
});

// Test route to check database connection
router.get('/test', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({ message: 'Database connection successful', result });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
});

// GET all seasons for a district
router.get('/district/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    // First check if the district exists
    const [district] = await pool.query('SELECT id, name FROM districts WHERE id = ?', [districtId]);
    if (district.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }
    
    const [seasons] = await pool.query(
      'SELECT * FROM seasons WHERE district_id = ? ORDER BY id',
      [districtId]
    );
    
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch seasons', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST new season
router.post('/', async (req, res) => {
  try {
    const { district_id, season_name } = req.body;
    // Check if district exists
    const [district] = await pool.query('SELECT id FROM districts WHERE id = ?', [district_id]);
    if (district.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }
    
    // Check if season already exists for this district
    const [existing] = await pool.query(
      'SELECT id FROM seasons WHERE district_id = ? AND season_name = ?',
      [district_id, season_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'This season already exists for this district' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO seasons (district_id, season_name) VALUES (?, ?)',
      [district_id, season_name]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      district_id, 
      season_name,
      created_at: new Date(),
      updated_at: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create season', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT update season
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { season_name } = req.body;
    
    await pool.query(
      'UPDATE seasons SET season_name = ? WHERE id = ?',
      [season_name, id]
    );
    
    res.json({ id, season_name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update season' });
  }
});

// DELETE season
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete all images associated with this season
    await pool.query('DELETE FROM season_images WHERE season_id = ?', [id]);
    
    // Then delete the season
    await pool.query('DELETE FROM seasons WHERE id = ?', [id]);
    
    res.json({ message: 'Season deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete season' });
  }
});

module.exports = router; 