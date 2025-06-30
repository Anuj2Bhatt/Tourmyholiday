const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Get all tourism types
router.get('/tourism-types', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tourism_types ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tourism types' });
  }
});

// Get all trip styles
router.get('/trip-styles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trip_styles ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching trip styles' });
  }
});

// Get all seasons
router.get('/seasons', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM seasons ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching seasons' });
  }
});

// Get all budget categories
router.get('/budget-categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM budget_categories ORDER BY min_amount');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching budget categories' });
  }
});

module.exports = router; 