const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT rb.*, hr.id as room_id, rt.name as room_type_name,
                   h.name as hotel_name
            FROM room_bookings rb
            JOIN hotel_rooms hr ON rb.room_id = hr.id
            JOIN room_types rt ON hr.type_id = rt.id
            JOIN hotels h ON hr.hotel_id = h.id
            ORDER BY rb.created_at DESC
        `);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// Get single booking
router.get('/:id', async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT rb.*, hr.id as room_id, rt.name as room_type_name,
                   h.name as hotel_name
            FROM room_bookings rb
            JOIN hotel_rooms hr ON rb.room_id = hr.id
            JOIN room_types rt ON hr.type_id = rt.id
            JOIN hotels h ON hr.hotel_id = h.id
            WHERE rb.id = ?
        `, [req.params.id]);

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(bookings[0]);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Error fetching booking' });
    }
});

// Create new booking
router.post('/', async (req, res) => {
    const {
        room_id,
        customer_name,
        customer_email,
        customer_phone,
        check_in_date,
        check_out_date,
        total_price,
        booking_status = 'pending',
        payment_status = 'pending'
    } = req.body;

    try {
        // Check if room is available for the given dates
        const [existingBookings] = await pool.query(`
            SELECT * FROM room_bookings 
            WHERE room_id = ? 
            AND booking_status != 'cancelled'
            AND (
                (check_in_date <= ? AND check_out_date >= ?) OR
                (check_in_date <= ? AND check_out_date >= ?) OR
                (check_in_date >= ? AND check_out_date <= ?)
            )
        `, [room_id, check_out_date, check_out_date, check_in_date, check_in_date, check_in_date, check_out_date]);

        if (existingBookings.length > 0) {
            return res.status(400).json({ message: 'Room is not available for the selected dates' });
        }

        const [result] = await pool.query(`
            INSERT INTO room_bookings (
                room_id, customer_name, customer_email, customer_phone,
                check_in_date, check_out_date, total_price,
                booking_status, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            room_id, customer_name, customer_email, customer_phone,
            check_in_date, check_out_date, total_price,
            booking_status, payment_status
        ]);

        res.status(201).json({
            id: result.insertId,
            message: 'Booking created successfully'
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Error creating booking' });
    }
});

// Update booking status
router.put('/:id/status', async (req, res) => {
    const { booking_status, payment_status } = req.body;

    try {
        const [result] = await pool.query(`
            UPDATE room_bookings 
            SET booking_status = ?, payment_status = ?
            WHERE id = ?
        `, [booking_status, payment_status, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Error updating booking status' });
    }
});

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
    try {
        const [result] = await pool.query(`
            UPDATE room_bookings 
            SET booking_status = 'cancelled'
            WHERE id = ?
        `, [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Error cancelling booking' });
    }
});

// Get bookings by date range
router.get('/date-range', async (req, res) => {
    const { start_date, end_date } = req.query;

    try {
        const [bookings] = await pool.query(`
            SELECT rb.*, hr.id as room_id, rt.name as room_type_name,
                   h.name as hotel_name
            FROM room_bookings rb
            JOIN hotel_rooms hr ON rb.room_id = hr.id
            JOIN room_types rt ON hr.type_id = rt.id
            JOIN hotels h ON hr.hotel_id = h.id
            WHERE rb.check_in_date >= ? AND rb.check_out_date <= ?
            ORDER BY rb.check_in_date ASC
        `, [start_date, end_date]);

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings by date range:', error);
        res.status(500).json({ message: 'Error fetching bookings by date range' });
    }
});

// Get bookings by hotel
router.get('/hotel/:hotelId', async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT rb.*, hr.id as room_id, rt.name as room_type_name,
                   h.name as hotel_name
            FROM room_bookings rb
            JOIN hotel_rooms hr ON rb.room_id = hr.id
            JOIN room_types rt ON hr.type_id = rt.id
            JOIN hotels h ON hr.hotel_id = h.id
            WHERE h.id = ?
            ORDER BY rb.created_at DESC
        `, [req.params.hotelId]);

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching hotel bookings:', error);
        res.status(500).json({ message: 'Error fetching hotel bookings' });
    }
});

module.exports = router; 