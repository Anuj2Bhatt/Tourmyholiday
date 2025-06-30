const db = require('../db');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

// Get all wildlife sanctuaries
exports.getAllSanctuaries = async (req, res) => {
    try {
        const [sanctuaries] = await db.query(`
            SELECT * FROM wildlife_sanctuaries 
            ORDER BY created_at DESC
        `);
        res.json(sanctuaries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wildlife sanctuaries' });
    }
};

// Get single sanctuary by ID
exports.getSanctuaryById = async (req, res) => {
    try {
        const [sanctuary] = await db.query(
            'SELECT * FROM wildlife_sanctuaries WHERE id = ?',
            [req.params.id]
        );

        if (sanctuary.length === 0) {
            return res.status(404).json({ message: 'Wildlife sanctuary not found' });
        }

        res.json(sanctuary[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wildlife sanctuary' });
    }
};

// Create new sanctuary
exports.createSanctuary = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            slug,
            description,
            location,
            metaTitle,
            metaDescription,
            metaKeywords
        } = req.body;

        // Check if slug already exists
        const [existingSlug] = await db.query(
            'SELECT id FROM wildlife_sanctuaries WHERE slug = ?',
            [slug]
        );

        if (existingSlug.length > 0) {
            return res.status(400).json({ message: 'Slug already exists' });
        }

        // Handle featured image
        let featuredImage = null;
        if (req.file) {
            featuredImage = req.file.filename;
        }

        // Insert into database
        const [result] = await db.query(`
            INSERT INTO wildlife_sanctuaries (
                title, slug, description, location, 
                featured_image, meta_title, meta_description, meta_keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, slug, description, location,
            featuredImage, metaTitle, metaDescription, metaKeywords
        ]);

        res.status(201).json({
            message: 'Wildlife sanctuary created successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating wildlife sanctuary' });
    }
};

// Update sanctuary
exports.updateSanctuary = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            slug,
            description,
            location,
            metaTitle,
            metaDescription,
            metaKeywords
        } = req.body;

        // Check if sanctuary exists
        const [existingSanctuary] = await db.query(
            'SELECT * FROM wildlife_sanctuaries WHERE id = ?',
            [req.params.id]
        );

        if (existingSanctuary.length === 0) {
            return res.status(404).json({ message: 'Wildlife sanctuary not found' });
        }

        // Check if new slug conflicts with other sanctuaries
        if (slug !== existingSanctuary[0].slug) {
            const [existingSlug] = await db.query(
                'SELECT id FROM wildlife_sanctuaries WHERE slug = ? AND id != ?',
                [slug, req.params.id]
            );

            if (existingSlug.length > 0) {
                return res.status(400).json({ message: 'Slug already exists' });
            }
        }

        // Handle featured image
        let featuredImage = existingSanctuary[0].featured_image;
        if (req.file) {
            // Delete old image if exists
            if (existingSanctuary[0].featured_image) {
                try {
                    await fs.unlink(path.join('uploads', existingSanctuary[0].featured_image));
                } catch (error) {
                    }
            }
            featuredImage = req.file.filename;
        }

        // Update database
        await db.query(`
            UPDATE wildlife_sanctuaries 
            SET title = ?, slug = ?, description = ?, location = ?,
                featured_image = ?, meta_title = ?, meta_description = ?, meta_keywords = ?
            WHERE id = ?
        `, [
            title, slug, description, location,
            featuredImage, metaTitle, metaDescription, metaKeywords,
            req.params.id
        ]);

        res.json({ message: 'Wildlife sanctuary updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating wildlife sanctuary' });
    }
};

// Delete sanctuary
exports.deleteSanctuary = async (req, res) => {
    try {
        // Get sanctuary details first
        const [sanctuary] = await db.query(
            'SELECT featured_image FROM wildlife_sanctuaries WHERE id = ?',
            [req.params.id]
        );

        if (sanctuary.length === 0) {
            return res.status(404).json({ message: 'Wildlife sanctuary not found' });
        }

        // Delete featured image if exists
        if (sanctuary[0].featured_image) {
            try {
                await fs.unlink(path.join('uploads', sanctuary[0].featured_image));
            } catch (error) {
                }
        }

        // Delete from database
        await db.query('DELETE FROM wildlife_sanctuaries WHERE id = ?', [req.params.id]);

        res.json({ message: 'Wildlife sanctuary deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting wildlife sanctuary' });
    }
}; 