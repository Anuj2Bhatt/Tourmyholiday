const express = require('express');
const router = express.Router();
const db = require('../db'); // Your MySQL connection
const path = require('path');

// Get all history entries
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM state_history ORDER BY id DESC');
    
    // Format image URLs
    const formattedRows = rows.map(row => ({
      ...row,
      image: row.image ? (row.image.startsWith('http') ? row.image : `http://localhost:5000/uploads/${path.basename(row.image)}`) : null
    }));
    
    res.json(formattedRows);
  } catch (err) {
    console.error('Error fetching all history:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get history by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Fetching history for slug:', slug);
    
    const [historyResult] = await db.query(
      'SELECT * FROM state_history WHERE slug = ?',
      [slug]
    );
    console.log('Found history entry:', historyResult[0]);

    if (historyResult.length === 0) {
      return res.status(404).json({ error: 'History not found' });
    }

    // Format image URL
    const history = historyResult[0];
    if (history.image) {
      history.image = history.image.startsWith('http') 
        ? history.image 
        : `http://localhost:5000/uploads/${path.basename(history.image)}`;
    }

    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get history by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [historyResult] = await db.query('SELECT * FROM state_history WHERE id = ?', [id]);
    
    if (historyResult.length === 0) {
      return res.status(404).json({ error: 'History not found' });
    }

    // Format image URL
    const history = historyResult[0];
    if (history.image) {
      history.image = history.image.startsWith('http') 
        ? history.image 
        : `http://localhost:5000/uploads/${path.basename(history.image)}`;
    }

    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Create new history
router.post('/', async (req, res) => {
  try {
    const {
      state_id, title, content, image, slug, status, package_id, meta_title, meta_description, meta_keywords
    } = req.body;

    // Validate required fields
    if (!state_id || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if state exists
    const [stateResult] = await db.query('SELECT id FROM states WHERE id = ?', [state_id]);
    if (stateResult.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }

    const sql = `
      INSERT INTO state_history
      (state_id, title, content, image, slug, status, package_id, meta_title, meta_description, meta_keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      parseInt(state_id),
      title,
      content,
      image,
      slug,
      status,
      package_id,
      meta_title,
      meta_description,
      meta_keywords
    ];

    const [result] = await db.query(sql, values);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error inserting history:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update history
router.put('/:id', async (req, res) => {
  try {
    const {
      state_id, title, content, image, slug, status, package_id, meta_title, meta_description, meta_keywords
    } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!state_id || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if state exists
    const [stateResult] = await db.query('SELECT id FROM states WHERE id = ?', [state_id]);
    if (stateResult.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }

    // Check if history exists
    const [historyResult] = await db.query('SELECT id FROM state_history WHERE id = ?', [id]);
    if (historyResult.length === 0) {
      return res.status(404).json({ error: 'History not found' });
    }

    const sql = `
      UPDATE state_history SET
        state_id = ?, title = ?, content = ?, image = ?, slug = ?, status = ?, package_id = ?, meta_title = ?, meta_description = ?, meta_keywords = ?
      WHERE id = ?
    `;

    const [result] = await db.query(
      sql,
      [state_id, title, content, image, slug, status, package_id, meta_title, meta_description, meta_keywords, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating history:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete history
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM state_history WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting history:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
