const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjusted to match your project structure

// Get all team members
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM team ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching team members' });
  }
});

// Add new team member
router.post('/', async (req, res) => {
  try {
    const { name, role, description, image, linkedin } = req.body;
    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required' });
    }

    const [result] = await db.query(
      'INSERT INTO team (name, role, description, image, linkedin) VALUES (?, ?, ?, ?, ?)',
      [name, role, description, image, linkedin]
    );

    const newMember = { 
      id: result.insertId, 
      name, 
      role, 
      description, 
      image, 
      linkedin 
    };

    res.json(newMember);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error adding team member',
      error: err.message 
    });
  }
});

// Update team member
router.put('/:id', async (req, res) => {
  try {
    const { name, role, description, image, linkedin } = req.body;
    const { id } = req.params;
    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required' });
    }
    await db.query(
      'UPDATE team SET name=?, role=?, description=?, image=?, linkedin=? WHERE id=?',
      [name, role, description, image, linkedin, id]
    );
    res.json({ id, name, role, description, image, linkedin });
  } catch (err) {
    res.status(500).json({ message: 'Error updating team member' });
  }
});

// Delete team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM team WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting team member' });
  }
});

module.exports = router; 