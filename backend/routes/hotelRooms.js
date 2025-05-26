const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all rooms for a hotel
router.get('/hotel/:hotelId', async (req, res) => {
    try {
        const [rooms] = await db.query(`
            SELECT hr.*, rt.name as room_type_name, rt.description as room_type_description
            FROM hotel_rooms hr
            JOIN room_types rt ON hr.room_type_id = rt.id
            WHERE hr.hotel_id = ?
            ORDER BY hr.room_number
        `, [req.params.hotelId]);
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching hotel rooms:', error);
        res.status(500).json({ message: 'Error fetching hotel rooms' });
    }
});

// Get single room
router.get('/:id', async (req, res) => {
    try {
        const [room] = await db.query(`
            SELECT hr.*, rt.name as room_type_name, rt.description as room_type_description
            FROM hotel_rooms hr
            JOIN room_types rt ON hr.room_type_id = rt.id
            WHERE hr.id = ?
        `, [req.params.id]);
        
        if (room.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Get room amenities
        const [amenities] = await db.query(`
            SELECT a.* 
            FROM amenities a
            JOIN room_amenities ra ON a.id = ra.amenity_id
            WHERE ra.room_id = ?
        `, [req.params.id]);

        res.json({
            ...room[0],
            amenities
        });
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ message: 'Error fetching room' });
    }
});

// Create new room
router.post('/', async (req, res) => {
    const {
        hotel_id,
        room_type_id,
        room_number,
        price_per_night,
        capacity,
        bed_type,
        room_size,
        amenities
    } = req.body;

    try {
        // Start transaction
        await db.beginTransaction();

        // Insert room
        const [result] = await db.query(`
            INSERT INTO hotel_rooms (
                hotel_id, room_type_id, room_number, price_per_night,
                capacity, bed_type, room_size, is_available
            ) VALUES (?, ?, ?, ?, ?, ?, ?, true)
        `, [
            hotel_id, room_type_id, room_number, price_per_night,
            capacity, bed_type, room_size
        ]);

        const roomId = result.insertId;

        // Insert room amenities if provided
        if (amenities && amenities.length > 0) {
            const amenityValues = amenities.map(amenityId => [roomId, amenityId]);
            await db.query(
                'INSERT INTO room_amenities (room_id, amenity_id) VALUES ?',
                [amenityValues]
            );
        }

        await db.commit();

        res.status(201).json({
            id: roomId,
            hotel_id,
            room_type_id,
            room_number,
            price_per_night,
            capacity,
            bed_type,
            room_size,
            amenities
        });
    } catch (error) {
        await db.rollback();
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Error creating room' });
    }
});

// Update room
router.put('/:id', async (req, res) => {
    const {
        room_type_id,
        room_number,
        price_per_night,
        capacity,
        bed_type,
        room_size,
        is_available,
        amenities
    } = req.body;

    try {
        await db.beginTransaction();

        // Update room details
        await db.query(`
            UPDATE hotel_rooms 
            SET room_type_id = ?, room_number = ?, price_per_night = ?,
                capacity = ?, bed_type = ?, room_size = ?, is_available = ?
            WHERE id = ?
        `, [
            room_type_id, room_number, price_per_night,
            capacity, bed_type, room_size, is_available,
            req.params.id
        ]);

        // Update amenities if provided
        if (amenities) {
            // Remove existing amenities
            await db.query('DELETE FROM room_amenities WHERE room_id = ?', [req.params.id]);
            
            // Add new amenities
            if (amenities.length > 0) {
                const amenityValues = amenities.map(amenityId => [req.params.id, amenityId]);
                await db.query(
                    'INSERT INTO room_amenities (room_id, amenity_id) VALUES ?',
                    [amenityValues]
                );
            }
        }

        await db.commit();

        res.json({
            id: req.params.id,
            room_type_id,
            room_number,
            price_per_night,
            capacity,
            bed_type,
            room_size,
            is_available,
            amenities
        });
    } catch (error) {
        await db.rollback();
        console.error('Error updating room:', error);
        res.status(500).json({ message: 'Error updating room' });
    }
});

// Delete room
router.delete('/:id', async (req, res) => {
    try {
        await db.beginTransaction();

        // Delete room amenities
        await db.query('DELETE FROM room_amenities WHERE room_id = ?', [req.params.id]);
        
        // Delete room
        await db.query('DELETE FROM hotel_rooms WHERE id = ?', [req.params.id]);

        await db.commit();
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        await db.rollback();
        console.error('Error deleting room:', error);
        res.status(500).json({ message: 'Error deleting room' });
    }
});

// Get room availability
router.get('/:id/availability', async (req, res) => {
    const { start_date, end_date } = req.query;
    
    try {
        const [bookings] = await db.query(`
            SELECT * FROM room_bookings
            WHERE room_id = ?
            AND (
                (check_in_date BETWEEN ? AND ?)
                OR (check_out_date BETWEEN ? AND ?)
                OR (? BETWEEN check_in_date AND check_out_date)
            )
            AND booking_status != 'cancelled'
        `, [req.params.id, start_date, end_date, start_date, end_date, start_date]);

        const isAvailable = bookings.length === 0;
        res.json({ isAvailable, bookings });
    } catch (error) {
        console.error('Error checking room availability:', error);
        res.status(500).json({ message: 'Error checking room availability' });
    }
});

module.exports = router; 