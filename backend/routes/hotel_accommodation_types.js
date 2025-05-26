const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all accommodation types for a hotel
router.get('/:hotel_id', async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const [rows] = await db.query('SELECT * FROM hotel_accommodation_types WHERE hotel_id = ?', [hotel_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch accommodation types', error: error.message });
  }
});

// Add accommodation type
router.post('/:hotel_id', async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const { type, peak_season_price, off_season_price } = req.body;
    const [result] = await db.query(
      `INSERT INTO hotel_accommodation_types (hotel_id, type, peak_season_price, off_season_price) VALUES (?, ?, ?, ?)`,
      [hotel_id, type, peak_season_price, off_season_price]
    );
    res.status(201).json({ id: result.insertId, type, peak_season_price, off_season_price });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add accommodation type', error: error.message });
  }
});

// Update accommodation type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, peak_season_price, off_season_price } = req.body;
    await db.query(
      `UPDATE hotel_accommodation_types SET type=?, peak_season_price=?, off_season_price=? WHERE id=?`,
      [type, peak_season_price, off_season_price, id]
    );
    res.json({ message: 'Accommodation type updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update accommodation type', error: error.message });
  }
});

// Delete accommodation type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM hotel_accommodation_types WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Accommodation type not found' });
    }
    res.json({ message: 'Accommodation type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete accommodation type', error: error.message });
  }
});

module.exports = router;
