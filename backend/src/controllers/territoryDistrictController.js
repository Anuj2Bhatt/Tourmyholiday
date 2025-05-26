const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get all districts for a territory
const getTerritoryDistricts = async (req, res) => {
    try {
        const { territoryId } = req.params;
        const [districts] = await db.query(
            'SELECT * FROM territory_districts WHERE territory_id = ? ORDER BY name ASC',
            [territoryId]
        );
        res.json(districts);
    } catch (error) {
        console.error('Error fetching territory districts:', error);
        res.status(500).json({ error: 'Failed to fetch territory districts' });
    }
};

// Get a single district
const getTerritoryDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const [districts] = await db.query(
            'SELECT * FROM territory_districts WHERE id = ?',
            [id]
        );
        
        if (districts.length === 0) {
            return res.status(404).json({ error: 'District not found' });
        }
        
        res.json(districts[0]);
    } catch (error) {
        console.error('Error fetching district:', error);
        res.status(500).json({ error: 'Failed to fetch district' });
    }
};

// Create a new district
const createTerritoryDistrict = async (req, res) => {
    try {
        const { territory_id, name, slug, description, meta_title, meta_description, meta_keywords } = req.body;
        let featured_image = null;

        if (req.file) {
            featured_image = `/uploads/${req.file.filename}`;
        }

        const [result] = await db.query(
            `INSERT INTO territory_districts 
            (territory_id, name, slug, description, featured_image, meta_title, meta_description, meta_keywords) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [territory_id, name, slug, description, featured_image, meta_title, meta_description, meta_keywords]
        );

        const [newDistrict] = await db.query(
            'SELECT * FROM territory_districts WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newDistrict[0]);
    } catch (error) {
        console.error('Error creating district:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'A district with this slug already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create district' });
        }
    }
};

// Update a district
const updateTerritoryDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, meta_title, meta_description, meta_keywords } = req.body;
        
        // Get current district data
        const [currentDistrict] = await db.query(
            'SELECT featured_image FROM territory_districts WHERE id = ?',
            [id]
        );

        if (currentDistrict.length === 0) {
            return res.status(404).json({ error: 'District not found' });
        }

        let featured_image = currentDistrict[0].featured_image;

        // Handle new image upload
        if (req.file) {
            // Delete old image if exists
            if (featured_image) {
                const oldImagePath = path.join(__dirname, '../../', featured_image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            featured_image = `/uploads/${req.file.filename}`;
        }

        await db.query(
            `UPDATE territory_districts 
            SET name = ?, slug = ?, description = ?, featured_image = ?, 
                meta_title = ?, meta_description = ?, meta_keywords = ?
            WHERE id = ?`,
            [name, slug, description, featured_image, meta_title, meta_description, meta_keywords, id]
        );

        const [updatedDistrict] = await db.query(
            'SELECT * FROM territory_districts WHERE id = ?',
            [id]
        );

        res.json(updatedDistrict[0]);
    } catch (error) {
        console.error('Error updating district:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'A district with this slug already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update district' });
        }
    }
};

// Delete a district
const deleteTerritoryDistrict = async (req, res) => {
    try {
        const { id } = req.params;

        // Get district data to delete associated image
        const [district] = await db.query(
            'SELECT featured_image FROM territory_districts WHERE id = ?',
            [id]
        );

        if (district.length === 0) {
            return res.status(404).json({ error: 'District not found' });
        }

        // Delete the district
        await db.query('DELETE FROM territory_districts WHERE id = ?', [id]);

        // Delete associated image if exists
        if (district[0].featured_image) {
            const imagePath = path.join(__dirname, '../../', district[0].featured_image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'District deleted successfully' });
    } catch (error) {
        console.error('Error deleting district:', error);
        res.status(500).json({ error: 'Failed to delete district' });
    }
};

// Update territory district with proper data
const updateTerritoryDistrictData = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            name: 'Nicobar',
            slug: 'nicobar',
            description: 'Nicobar is a district in the Andaman and Nicobar Islands territory of India.',
            meta_title: 'Nicobar District - Andaman and Nicobar Islands',
            meta_description: 'Explore Nicobar district in Andaman and Nicobar Islands. Discover its culture, tourism, and attractions.',
            meta_keywords: 'nicobar, andaman nicobar, nicobar district, nicobar islands, tourism, culture, attractions'
        };

        const [result] = await db.query(
            `UPDATE territory_districts 
            SET name = ?, 
                slug = ?, 
                description = ?, 
                meta_title = ?, 
                meta_description = ?, 
                meta_keywords = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
                updateData.name,
                updateData.slug,
                updateData.description,
                updateData.meta_title,
                updateData.meta_description,
                updateData.meta_keywords,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'District not found' });
        }

        const [updatedDistrict] = await db.query(
            'SELECT * FROM territory_districts WHERE id = ?',
            [id]
        );

        res.json({
            message: 'District updated successfully',
            district: updatedDistrict[0]
        });
    } catch (error) {
        console.error('Error updating district data:', error);
        res.status(500).json({ error: 'Failed to update district data' });
    }
};

module.exports = {
    getTerritoryDistricts,
    getTerritoryDistrict,
    createTerritoryDistrict,
    updateTerritoryDistrict,
    deleteTerritoryDistrict,
    updateTerritoryDistrictData
}; 