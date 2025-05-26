const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s/g, '-'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('File must be an image'), false);
    }
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`Only ${allowedExtensions.join(', ')} files are allowed`), false);
    }
    
    cb(null, true);
  }
});

// Get all hotel categories (with optional type filter)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM hotel_categories WHERE is_active = true';
        let params = [];
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        const [categories] = await pool.query(query, params);
        // Always return an array
        res.json(Array.isArray(categories) ? categories : []);
    } catch (error) {
        console.error('Error fetching hotel categories:', error);
        res.status(500).json({ message: 'Error fetching hotel categories' });
    }
});

// Get single hotel category
router.get('/:id', async (req, res) => {
    try {
        const [category] = await pool.query('SELECT * FROM hotel_categories WHERE id = ?', [req.params.id]);
        if (category.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Add full URL for image
        const mappedCategory = {
            ...category[0],
            image: category[0].image ? `http://localhost:5000/${category[0].image}` : null
        };
        res.json(mappedCategory);
    } catch (error) {
        console.error('Error fetching hotel category:', error);
        res.status(500).json({ message: 'Error fetching hotel category' });
    }
});

// Create new hotel category
router.post('/', async (req, res) => {
    console.log('POST /api/hotel-categories req.headers:', req.headers);
    console.log('POST /api/hotel-categories req.body:', req.body);
    const { name, is_active = true, image, type } = req.body;
    if (!image) {
        return res.status(400).json({ message: 'Image is required' });
    }
    if (!type) {
        return res.status(400).json({ message: 'Type is required' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO hotel_categories (name, image, is_active, type) VALUES (?, ?, ?, ?)',
            [name, image, is_active, type]
        );
        res.status(201).json({ 
            id: result.insertId,
            name,
            image: image.startsWith('http') ? image : `http://localhost:5000/${image}`,
            is_active,
            type,
            created_at: new Date(),
            updated_at: new Date()
        });
    } catch (error) {
        console.error('Error creating hotel category:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: 'Error creating hotel category' });
    }
});

// Update hotel category
router.put('/:id', async (req, res) => {
    console.log('PUT /api/hotel-categories req.headers:', req.headers);
    console.log('PUT /api/hotel-categories req.body:', req.body);
    const { name, is_active, image, type } = req.body;
    if (!type) {
        return res.status(400).json({ message: 'Type is required' });
    }
    try {
        const [result] = await pool.query(
            'UPDATE hotel_categories SET name = ?, image = ?, is_active = ?, type = ? WHERE id = ?',
            [name, image, is_active, type, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Fetch the updated record to get timestamps
        const [updatedCategory] = await pool.query(
            'SELECT * FROM hotel_categories WHERE id = ?',
            [req.params.id]
        );
        res.json({ 
            ...updatedCategory[0],
            image: image ? (image.startsWith('http') ? image : `http://localhost:5000/${image}`) : null
        });
    } catch (error) {
        console.error('Error updating hotel category:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: 'Error updating hotel category' });
    }
});

// Delete hotel category (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE hotel_categories SET is_active = false WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting hotel category:', error);
        res.status(500).json({ message: 'Error deleting hotel category' });
    }
});

module.exports = router; 