const express = require('express');
const router = express.Router();
const pool = require('../db');
const path = require('path');

// Get web stories by state and district type
router.get('/', async (req, res) => {
  try {
    const { state, district_type } = req.query;
    console.log('Fetching web stories for state:', state, 'district_type:', district_type);

    let query = `
      SELECT w.*, d.name as district_name, d.state_name
      FROM district_web_stories w
      JOIN districts d ON w.district_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (state) {
      query += ' AND d.state_name = ?';
      params.push(state);
    }

    if (district_type === 'state') {
      query += ' AND w.district_id IS NOT NULL';
    }

    query += ' ORDER BY w.created_at DESC';

    const [stories] = await pool.query(query, params);

    // Format image URLs
    const formattedStories = stories.map(story => ({
      ...story,
      featured_image: story.featured_image ? `http://localhost:5000/${story.featured_image.replace(/\\/g, '/')}` : null
    }));

    console.log(`Found ${stories.length} web stories`);
    res.json(formattedStories);
  } catch (error) {
    console.error('Error fetching web stories:', error);
    res.status(500).json({ message: 'Failed to fetch web stories', error: error.message });
  }
});

// Get web story by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Fetching web story with slug:', slug);

    const [stories] = await pool.query(`
      SELECT w.*, d.name as district_name, d.state_name
      FROM district_web_stories w
      JOIN districts d ON w.district_id = d.id
      WHERE w.slug = ?
    `, [slug]);

    if (stories.length === 0) {
      return res.status(404).json({ message: 'Web story not found' });
    }

    // Format image URL
    const story = {
      ...stories[0],
      featured_image: stories[0].featured_image ? `http://localhost:5000/${stories[0].featured_image.replace(/\\/g, '/')}` : null
    };

    res.json(story);
  } catch (error) {
    console.error('Error fetching web story:', error);
    res.status(500).json({ message: 'Failed to fetch web story', error: error.message });
  }
});

module.exports = router; 