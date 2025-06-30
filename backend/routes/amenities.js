const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all amenities
router.get('/', async (req, res) => {
    try {
        const [amenities] = await db.query('SELECT * FROM amenities ORDER BY name');
        res.json(amenities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching amenities' });
    }
});

// Get single amenity
router.get('/:id', async (req, res) => {
    try {
        const [amenity] = await db.query('SELECT * FROM amenities WHERE id = ?', [req.params.id]);
        if (amenity.length === 0) {
            return res.status(404).json({ message: 'Amenity not found' });
        }
        res.json(amenity[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching amenity' });
    }
});

// Create new amenity
router.post('/', async (req, res) => {
    const { name, icon, description } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO amenities (name, icon, description) VALUES (?, ?, ?)',
            [name, icon, description]
        );
        res.status(201).json({ 
            id: result.insertId,
            name,
            icon,
            description
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating amenity' });
    }
});

// Update amenity
router.put('/:id', async (req, res) => {
    const { name, icon, description } = req.body;
    try {
        await db.query(
            'UPDATE amenities SET name = ?, icon = ?, description = ? WHERE id = ?',
            [name, icon, description, req.params.id]
        );
        res.json({ 
            id: req.params.id,
            name,
            icon,
            description
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating amenity' });
    }
});

// Delete amenity
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM amenities WHERE id = ?', [req.params.id]);
        res.json({ message: 'Amenity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting amenity' });
    }
});

// Get hotel amenities
router.get('/hotel/:hotelId', async (req, res) => {
    try {
        const [amenities] = await db.query(`
            SELECT a.* 
            FROM amenities a
            JOIN hotel_amenities ha ON a.id = ha.amenity_id
            WHERE ha.hotel_id = ?
            ORDER BY a.name
        `, [req.params.hotelId]);
        res.json(amenities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotel amenities' });
    }
});

// Add amenity to hotel
router.post('/hotel/:hotelId', async (req, res) => {
    const { amenity_id } = req.body;
    try {
        await db.query(
            'INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES (?, ?)',
            [req.params.hotelId, amenity_id]
        );
        res.status(201).json({ message: 'Amenity added to hotel successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding amenity to hotel' });
    }
});

// Remove amenity from hotel
router.delete('/hotel/:hotelId/:amenityId', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM hotel_amenities WHERE hotel_id = ? AND amenity_id = ?',
            [req.params.hotelId, req.params.amenityId]
        );
        res.json({ message: 'Amenity removed from hotel successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing amenity from hotel' });
    }
});

// Add cottage amenities
router.post('/cottage', async (req, res) => {
    try {
        const cottageAmenities = [
            { name: 'DJ Night', description: 'DJ Night entertainment available' },
            { name: 'Bonfire', description: 'Bonfire facility available' },
            { name: 'Hot Water', description: '24/7 hot water supply' }
        ];

        // Insert each amenity
        for (const amenity of cottageAmenities) {
            await db.query(
                'INSERT INTO accommodation_amenities (accommodation_type, name, description) VALUES (?, ?, ?)',
                ['cottage', amenity.name, amenity.description]
            );
        }

        res.status(201).json({ message: 'Cottage amenities added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding cottage amenities' });
    }
});

module.exports = router; 