const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get state history
router.get('/', async (req, res) => {
  try {
    const { state_id, sort = 'desc' } = req.query;

    if (!state_id) {
      return res.status(400).json({ error: 'State ID is required' });
    }

    // Validate sort parameter
    if (sort !== 'asc' && sort !== 'desc') {
      return res.status(400).json({ error: 'Invalid sort parameter. Use "asc" or "desc"' });
    }

    // First check if state exists
    const [states] = await pool.query('SELECT id FROM states WHERE id = ?', [state_id]);
    if (states.length === 0) {
      return res.status(404).json({ message: 'State not found' });
    }

    // Get state history with correct column names
    const [history] = await pool.query(`
      SELECT 
        sh.id,
        sh.state_id,
        sh.title,
        sh.content,
        sh.image,
        sh.slug,
        sh.status,
        sh.package_id,
        sh.meta_title,
        sh.meta_description,
        sh.meta_keywords,
        s.name as state_name
      FROM state_history sh
      JOIN states s ON sh.state_id = s.id
      WHERE sh.state_id = ?
      ORDER BY sh.id ${sort === 'desc' ? 'DESC' : 'ASC'}
    `, [state_id]);

    // Format image URLs - ensure they are only in uploads folder
    const formattedHistory = history.map(item => {
      if (!item.image) return { ...item, image: null };

      let imageUrl = item.image;
      
      // Remove any leading slashes
      if (imageUrl.startsWith('/')) {
        imageUrl = imageUrl.substring(1);
      }
      
      // Remove 'uploads/' prefix if it exists
      if (imageUrl.startsWith('uploads/')) {
        imageUrl = imageUrl.substring(8);
      }
      
      // If it's already a full URL, return as is
      if (imageUrl.startsWith('http')) {
        return { ...item, image: imageUrl };
      }
      
      // Otherwise, construct the full URL
      return { 
        ...item, 
        image: `http://localhost:5000/uploads/${imageUrl}`
      };
    });

    console.log(`Found ${history.length} history entries for state ${state_id}`);
    console.log('Formatted image URLs:', formattedHistory.map(item => item.image));
    res.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching state history:', error);
    res.status(500).json({ message: 'Failed to fetch state history', error: error.message });
  }
});

// Update state history by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      image,
      slug,
      status,
      package_id,
      meta_title,
      meta_description,
      meta_keywords,
      state_id
    } = req.body;

    // Check if entry exists
    const [rows] = await pool.query('SELECT * FROM state_history WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'State history not found' });
    }

    // Update entry
    await pool.query(
      `UPDATE state_history SET
        title = ?,
        content = ?,
        image = ?,
        slug = ?,
        status = ?,
        package_id = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        state_id = ?
      WHERE id = ?`,
      [
        title,
        content,
        image,
        slug,
        status,
        package_id,
        meta_title,
        meta_description,
        meta_keywords,
        state_id,
        id
      ]
    );

    // Return updated row with formatted image URL
    const [updated] = await pool.query('SELECT * FROM state_history WHERE id = ?', [id]);
    let imgUrl = updated[0].image;
    if (imgUrl) {
      if (!imgUrl.startsWith('http')) {
        // Remove any leading slashes or 'uploads/' prefix
        imgUrl = imgUrl.replace(/^uploads[\\/]/, '').replace(/^\//, '');
        imgUrl = `http://localhost:5000/uploads/${imgUrl}`;
      }
    } else {
      imgUrl = null;
    }
    const formatted = {
      ...updated[0],
      image: imgUrl
    };
    res.json(formatted);
  } catch (error) {
    console.error('Error updating state history:', error);
    res.status(500).json({ error: 'Failed to update state history' });
  }
});

module.exports = router; 