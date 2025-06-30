const express = require('express');
const router = express.Router();
const db = require('../../db');

// Get all hotel categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM hotel_categories WHERE is_active = true');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotel categories' });
    }
});

// Get single hotel category
router.get('/:id', async (req, res) => {
    try {
        const [category] = await db.query('SELECT * FROM hotel_categories WHERE id = ?', [req.params.id]);
        if (category.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotel category' });
    }
});

// Create new hotel category
router.post('/', async (req, res) => {
    const { name, image, description } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO hotel_categories (name, image, description) VALUES (?, ?, ?)',
            [name, image, description]
        );
        res.status(201).json({ 
            id: result.insertId,
            name,
            image,
            description
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: 'Error creating hotel category' });
    }
});

// Update hotel category
router.put('/:id', async (req, res) => {
    const { name, image, description, is_active } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE hotel_categories SET name = ?, image = ?, description = ?, is_active = ? WHERE id = ?',
            [name, image, description, is_active, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ 
            id: parseInt(req.params.id),
            name,
            image,
            description,
            is_active
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: 'Error updating hotel category' });
    }
});

// Delete hotel category (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE hotel_categories SET is_active = false WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hotel category' });
    }
});

module.exports = router; 