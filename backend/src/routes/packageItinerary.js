const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Get all itinerary days for a package
router.get('/:packageId', async (req, res) => {
    try {
        const { packageId } = req.params;
        
        // First check if package exists
        const [package] = await pool.query('SELECT id FROM packages WHERE id = ?', [packageId]);
        if (package.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Get all itinerary days
        const [days] = await pool.query(
            'SELECT * FROM package_itinerary WHERE package_id = ? ORDER BY day_number ASC',
            [packageId]
        );

        res.json(days);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching itinerary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add a new day to itinerary
router.post('/:packageId', async (req, res) => {
    try {
        const { packageId } = req.params;
        const { day_number, title, description, activities, meals, accommodation, transport } = req.body;

        // Validate required fields - allow day_number to be 0
        if (day_number === undefined || day_number === null || !title) {
            return res.status(400).json({ 
                message: 'Day number and title are required' 
            });
        }

        // Ensure day_number is a number
        const dayNumber = parseInt(day_number);
        if (isNaN(dayNumber)) {
            return res.status(400).json({ 
                message: 'Day number must be a valid number' 
            });
        }

        // Check if package exists
        const [package] = await pool.query('SELECT id FROM packages WHERE id = ?', [packageId]);
        if (package.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Check if day number already exists
        const [existingDay] = await pool.query(
            'SELECT id FROM package_itinerary WHERE package_id = ? AND day_number = ?',
            [packageId, dayNumber]
        );
        if (existingDay.length > 0) {
            return res.status(400).json({ 
                message: 'Day number already exists for this package' 
            });
        }

        // Insert new day
        const [result] = await pool.query(
            `INSERT INTO package_itinerary 
            (package_id, day_number, title, description, activities, meals, accommodation, transport) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [packageId, dayNumber, title, description, activities, meals, accommodation, transport]
        );

        // Get the inserted day
        const [newDay] = await pool.query(
            'SELECT * FROM package_itinerary WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newDay[0]);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error adding itinerary day',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update a specific day
router.put('/:packageId/:dayNumber', async (req, res) => {
    try {
        const { packageId, dayNumber } = req.params;
        const { title, description, activities, meals, accommodation, transport } = req.body;

        // Validate required fields
        if (!title) {
            return res.status(400).json({ 
                message: 'Title is required' 
            });
        }

        // Check if day exists
        const [existingDay] = await pool.query(
            'SELECT id FROM package_itinerary WHERE package_id = ? AND day_number = ?',
            [packageId, dayNumber]
        );
        if (existingDay.length === 0) {
            return res.status(404).json({ 
                message: 'Itinerary day not found' 
            });
        }

        // Update the day
        await pool.query(
            `UPDATE package_itinerary 
            SET title = ?, description = ?, activities = ?, meals = ?, 
                accommodation = ?, transport = ?, updated_at = CURRENT_TIMESTAMP
            WHERE package_id = ? AND day_number = ?`,
            [title, description, activities, meals, accommodation, transport, packageId, dayNumber]
        );

        // Get updated day
        const [updatedDay] = await pool.query(
            'SELECT * FROM package_itinerary WHERE package_id = ? AND day_number = ?',
            [packageId, dayNumber]
        );

        res.json(updatedDay[0]);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating itinerary day',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete a specific day
router.delete('/:packageId/:dayNumber', async (req, res) => {
    try {
        const { packageId, dayNumber } = req.params;

        // Check if day exists
        const [existingDay] = await pool.query(
            'SELECT id FROM package_itinerary WHERE package_id = ? AND day_number = ?',
            [packageId, dayNumber]
        );
        if (existingDay.length === 0) {
            return res.status(404).json({ 
                message: 'Itinerary day not found' 
            });
        }

        // Delete the day
        await pool.query(
            'DELETE FROM package_itinerary WHERE package_id = ? AND day_number = ?',
            [packageId, dayNumber]
        );

        // Renumber remaining days
        await pool.query(
            `UPDATE package_itinerary 
            SET day_number = day_number - 1 
            WHERE package_id = ? AND day_number > ?`,
            [packageId, dayNumber]
        );

        res.json({ message: 'Itinerary day deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting itinerary day',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Reorder days (optional endpoint for future use)
router.post('/:packageId/reorder', async (req, res) => {
    try {
        const { packageId } = req.params;
        const { dayOrders } = req.body; // Array of { id, newDayNumber }

        // Validate input
        if (!Array.isArray(dayOrders)) {
            return res.status(400).json({ 
                message: 'Invalid input format' 
            });
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update each day's number
            for (const { id, newDayNumber } of dayOrders) {
                await connection.query(
                    'UPDATE package_itinerary SET day_number = ? WHERE id = ? AND package_id = ?',
                    [newDayNumber, id, packageId]
                );
            }

            await connection.commit();
            res.json({ message: 'Days reordered successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Error reordering days',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 