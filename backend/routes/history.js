const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all history entries
router.get('/', async (req, res) => {
  try {
    const [history] = await pool.query('SELECT * FROM history ORDER BY created_at DESC');
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET single history entry
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [history] = await pool.query('SELECT * FROM history WHERE id = ?', [id]);
    
    if (history.length === 0) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    
    res.json(history[0]);
  } catch (error) {
    console.error('Error fetching history entry:', error);
    res.status(500).json({ error: 'Failed to fetch history entry' });
  }
});

// POST create new history entry
router.post('/', async (req, res) => {
  try {
    const { title, content, state } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO history (title, content, state) VALUES (?, ?, ?)',
      [title, content, state]
    );

    const newHistory = {
      id: result.insertId,
      title,
      content,
      state
    };

    res.status(201).json(newHistory);
  } catch (error) {
    console.error('Error creating history entry:', error);
    res.status(500).json({ error: 'Failed to create history entry' });
  }
});

// PUT update history entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, state } = req.body;

    const [result] = await pool.query(
      'UPDATE history SET title = ?, content = ?, state = ? WHERE id = ?',
      [title, content, state, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    const updatedHistory = {
      id: parseInt(id),
      title,
      content,
      state
    };

    res.json(updatedHistory);
  } catch (error) {
    console.error('Error updating history entry:', error);
    res.status(500).json({ error: 'Failed to update history entry' });
  }
});

// DELETE history entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM history WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

module.exports = router; 