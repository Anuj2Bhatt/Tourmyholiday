const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Get all team members
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, role, description, image, linkedin FROM team');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team members' });
  }
});

// Get a single team member by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, role, description, image, linkedin FROM team WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team member' });
  }
});

// Create a new team member
router.post('/', async (req, res) => {
  const { name, role, description, image, linkedin } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO team (name, role, description, image, linkedin) VALUES (?, ?, ?, ?, ?)',
      [name, role, description, image, linkedin]
    );
    res.status(201).json({ id: result.insertId, message: 'Team member created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating team member' });
  }
});

// Update a team member
router.put('/:id', async (req, res) => {
  const { name, role, description, image, linkedin } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE team SET name = ?, role = ?, description = ?, image = ?, linkedin = ? WHERE id = ?',
      [name, role, description, image, linkedin, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating team member' });
  }
});

// Delete a team member
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM team WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team member' });
  }
});

module.exports = router; 