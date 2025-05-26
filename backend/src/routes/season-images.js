const express = require('express');
const router = express.Router();
const pool = require('../db');
const path = require('path');

// Get images by season ID
router.get('/season/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;
    console.log('Fetching images for season ID:', seasonId);

    // First check if season exists
    const [seasons] = await pool.query('SELECT id FROM seasons WHERE id = ?', [seasonId]);
    if (seasons.length === 0) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Get images for this season
    const [images] = await pool.query(`
      SELECT * FROM season_images 
      WHERE season_id = ?
      ORDER BY created_at DESC
    `, [seasonId]);

    // Format image URLs
    const formattedImages = images.map(image => ({
      ...image,
      image_url: image.image_url ? `http://localhost:5000/${image.image_url.replace(/\\/g, '/')}` : null
    }));

    console.log(`Found ${images.length} images for season ${seasonId}`);
    res.json(formattedImages);
  } catch (error) {
    console.error('Error fetching season images:', error);
    res.status(500).json({ message: 'Failed to fetch season images', error: error.message });
  }
});

module.exports = router; 