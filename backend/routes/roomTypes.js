const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all room types
router.get('/', async (req, res) => {
    try {
        const [roomTypes] = await db.query('SELECT * FROM room_types ORDER BY name');
        res.json(roomTypes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room types' });
    }
});

// Get single room type
router.get('/:id', async (req, res) => {
    try {
        const [roomType] = await db.query('SELECT * FROM room_types WHERE id = ?', [req.params.id]);
        if (roomType.length === 0) {
            return res.status(404).json({ message: 'Room type not found' });
        }
        res.json(roomType[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room type' });
    }
});

// Create new room type
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO room_types (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.status(201).json({ 
            id: result.insertId,
            name,
            description
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating room type' });
    }
});

// Update room type
router.put('/:id', async (req, res) => {
    const { name, description } = req.body;
    try {
        await db.query(
            'UPDATE room_types SET name = ?, description = ? WHERE id = ?',
            [name, description, req.params.id]
        );
        res.json({ 
            id: req.params.id,
            name,
            description
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating room type' });
    }
});

// Delete room type
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM room_types WHERE id = ?', [req.params.id]);
        res.json({ message: 'Room type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting room type' });
    }
});

// Get hotel rooms by type
router.get('/hotel/:hotelId', async (req, res) => {
    try {
        const [rooms] = await db.query(`
            SELECT hr.*, rt.name as room_type_name, rt.description as room_type_description
            FROM hotel_rooms hr
            JOIN room_types rt ON hr.room_type_id = rt.id
            WHERE hr.hotel_id = ?
            ORDER BY rt.name, hr.room_number
        `, [req.params.hotelId]);
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotel rooms' });
    }
});

module.exports = router; 