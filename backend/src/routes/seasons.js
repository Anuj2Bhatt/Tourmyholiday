const express = require('express');
const router = express.Router();
const pool = require('../../db');
const path = require('path');

// Get seasons by district ID with images
router.get('/district/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    // First check if district exists
    const [districts] = await pool.query('SELECT id FROM districts WHERE id = ?', [districtId]);
    if (districts.length === 0) {
      return res.status(404).json({ message: 'District not found' });
    }

    // Get seasons for this district
    const [seasons] = await pool.query(`
      SELECT s.*, d.name as district_name, d.state_name
      FROM seasons s
      JOIN districts d ON s.district_id = d.id
      WHERE s.district_id = ?
      ORDER BY s.created_at DESC
    `, [districtId]);

    // Get images for each season
    const seasonsWithImages = await Promise.all(seasons.map(async (season) => {
      const [images] = await pool.query(`
        SELECT * FROM season_images 
        WHERE season_id = ?
        ORDER BY created_at DESC
      `, [season.id]);

      // Format image URLs
      const formattedImages = images.map(image => ({
        ...image,
        image_url: image.image_url ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/${image.image_url.replace(/\\/g, '/')}` : null
      }));

      return {
        ...season,
        images: formattedImages
      };
    }));

    res.json(seasonsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch district seasons', error: error.message });
  }
});

// Get season by ID with images
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [seasons] = await pool.query(`
      SELECT s.*, d.name as district_name, d.state_name
      FROM seasons s
      JOIN districts d ON s.district_id = d.id
      WHERE s.id = ?
    `, [id]);

    if (seasons.length === 0) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Get images for this season
    const [images] = await pool.query(`
      SELECT * FROM season_images 
      WHERE season_id = ?
      ORDER BY created_at DESC
    `, [id]);

    // Format image URLs
    const formattedImages = images.map(image => ({
      ...image,
      image_url: image.image_url ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/${image.image_url.replace(/\\/g, '/')}` : null
    }));

    const season = {
      ...seasons[0],
      images: formattedImages
    };

    res.json(season);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch season', error: error.message });
  }
});

module.exports = router; 