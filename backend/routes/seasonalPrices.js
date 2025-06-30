const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all seasonal prices for a room
router.get('/room/:roomId', async (req, res) => {
    try {
        const [prices] = await db.query(`
            SELECT * FROM seasonal_prices
            WHERE room_id = ?
            ORDER BY start_date
        `, [req.params.roomId]);
        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching seasonal prices' });
    }
});

// Get single seasonal price
router.get('/:id', async (req, res) => {
    try {
        const [price] = await db.query('SELECT * FROM seasonal_prices WHERE id = ?', [req.params.id]);
        if (price.length === 0) {
            return res.status(404).json({ message: 'Seasonal price not found' });
        }
        res.json(price[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching seasonal price' });
    }
});

// Create new seasonal price
router.post('/', async (req, res) => {
    const { room_id, start_date, end_date, price_per_night } = req.body;
    try {
        // Check for overlapping dates
        const [overlapping] = await db.query(`
            SELECT * FROM seasonal_prices
            WHERE room_id = ?
            AND (
                (start_date BETWEEN ? AND ?)
                OR (end_date BETWEEN ? AND ?)
                OR (? BETWEEN start_date AND end_date)
            )
        `, [room_id, start_date, end_date, start_date, end_date, start_date]);

        if (overlapping.length > 0) {
            return res.status(400).json({ 
                message: 'Dates overlap with existing seasonal price' 
            });
        }

        const [result] = await db.query(`
            INSERT INTO seasonal_prices (room_id, start_date, end_date, price_per_night)
            VALUES (?, ?, ?, ?)
        `, [room_id, start_date, end_date, price_per_night]);

        res.status(201).json({
            id: result.insertId,
            room_id,
            start_date,
            end_date,
            price_per_night
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating seasonal price' });
    }
});

// Update seasonal price
router.put('/:id', async (req, res) => {
    const { start_date, end_date, price_per_night } = req.body;
    try {
        // Get room_id for the current price
        const [currentPrice] = await db.query(
            'SELECT room_id FROM seasonal_prices WHERE id = ?',
            [req.params.id]
        );

        if (currentPrice.length === 0) {
            return res.status(404).json({ message: 'Seasonal price not found' });
        }

        // Check for overlapping dates (excluding current price)
        const [overlapping] = await db.query(`
            SELECT * FROM seasonal_prices
            WHERE room_id = ?
            AND id != ?
            AND (
                (start_date BETWEEN ? AND ?)
                OR (end_date BETWEEN ? AND ?)
                OR (? BETWEEN start_date AND end_date)
            )
        `, [currentPrice[0].room_id, req.params.id, start_date, end_date, start_date, end_date, start_date]);

        if (overlapping.length > 0) {
            return res.status(400).json({ 
                message: 'Dates overlap with existing seasonal price' 
            });
        }

        await db.query(`
            UPDATE seasonal_prices
            SET start_date = ?, end_date = ?, price_per_night = ?
            WHERE id = ?
        `, [start_date, end_date, price_per_night, req.params.id]);

        res.json({
            id: req.params.id,
            room_id: currentPrice[0].room_id,
            start_date,
            end_date,
            price_per_night
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating seasonal price' });
    }
});

// Delete seasonal price
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM seasonal_prices WHERE id = ?', [req.params.id]);
        res.json({ message: 'Seasonal price deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting seasonal price' });
    }
});

module.exports = router; 