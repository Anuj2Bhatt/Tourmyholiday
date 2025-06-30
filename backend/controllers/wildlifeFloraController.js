const db = require('../db');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

// Get all wildlife flora items
exports.getAllWildlifeFloraItems = async (req, res) => {
    try {
        const [items] = await db.query(`
            SELECT wfi.*, wfs.title as sanctuary_title
            FROM wildlife_flora_items wfi
            LEFT JOIN wildlife_sanctuaries wfs ON wfi.sanctuary_id = wfs.id
            ORDER BY wfi.sanctuary_id, wfi.category, wfi.sort_order, wfi.created_at DESC
        `);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wildlife flora items' });
    }
};

// Get wildlife flora items by sanctuary
exports.getWildlifeFloraBySanctuary = async (req, res) => {
    try {
        const { sanctuaryId } = req.params;
        
        const [items] = await db.query(`
            SELECT wfi.*, wfs.title as sanctuary_title
            FROM wildlife_flora_items wfi
            LEFT JOIN wildlife_sanctuaries wfs ON wfi.sanctuary_id = wfs.id
            WHERE wfi.sanctuary_id = ?
            ORDER BY wfi.category, wfi.sort_order, wfi.created_at DESC
        `, [sanctuaryId]);
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wildlife flora items' });
    }
};

// Get wildlife flora items by category
exports.getWildlifeFloraByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        const [items] = await db.query(`
            SELECT wfi.*, wfs.title as sanctuary_title
            FROM wildlife_flora_items wfi
            LEFT JOIN wildlife_sanctuaries wfs ON wfi.sanctuary_id = wfs.id
            WHERE wfi.category = ? AND wfi.is_active = 1
            ORDER BY wfi.sanctuary_id, wfi.sort_order, wfi.created_at DESC
        `, [category]);
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wildlife flora items' });
    }
};

// Get single wildlife flora item
exports.getWildlifeFloraItemById = async (req, res) => {
    try {
        const [item] = await db.query(`
            SELECT wfi.*, wfs.title as sanctuary_title
            FROM wildlife_flora_items wfi
            LEFT JOIN wildlife_sanctuaries wfs ON wfi.sanctuary_id = wfs.id
            WHERE wfi.id = ?
        `, [req.params.id]);

        if (item.length === 0) {
            return res.status(404).json({ message: 'Wildlife flora item not found' });
        }

        // Get additional images if any
        const [images] = await db.query(`
            SELECT * FROM wildlife_flora_images 
            WHERE wildlife_flora_item_id = ? AND is_active = 1
            ORDER BY sort_order, created_at
        `, [req.params.id]);

        const result = {
            ...item[0],
            additional_images: images
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wildlife flora item' });
    }
};

// Create new wildlife flora item
exports.createWildlifeFloraItem = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            sanctuary_id,
            category,
            name,
            description,
            sort_order = 0,
            is_active = true,
            best_time_for_wildlife,
            wildlife_behavior,
            conservation_status,
            research_programs,
            visitor_guidelines,
            photography_tips
        } = req.body;

        // Check if sanctuary exists and get its name
        const [sanctuary] = await db.query(
            'SELECT id, title FROM wildlife_sanctuaries WHERE id = ?',
            [sanctuary_id]
        );

        if (sanctuary.length === 0) {
            return res.status(400).json({ message: 'Wildlife sanctuary not found' });
        }

        const sanctuary_name = sanctuary[0].title || 'Unknown Sanctuary';

        // Handle main image
        let image_path = null;
        let image_name = null;
        if (req.file) {
            image_path = req.file.filename;
            image_name = req.file.originalname;
        }

        // Insert into database
        const [result] = await db.query(`
            INSERT INTO wildlife_flora_items (
                sanctuary_id, sanctuary_name, category, name, description, 
                image_path, image_name, sort_order, is_active,
                best_time_for_wildlife, wildlife_behavior, conservation_status,
                research_programs, visitor_guidelines, photography_tips
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            sanctuary_id, sanctuary_name, category, name, description,
            image_path, image_name, sort_order, is_active,
            best_time_for_wildlife, wildlife_behavior, conservation_status,
            research_programs, visitor_guidelines, photography_tips
        ]);

        res.status(201).json({
            message: 'Wildlife flora item created successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating wildlife flora item',
            error: error.message,
            details: error.sqlMessage || error.message
        });
    }
};

// Update wildlife flora item
exports.updateWildlifeFloraItem = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            sanctuary_id,
            category,
            name,
            description,
            sort_order,
            is_active,
            best_time_for_wildlife,
            wildlife_behavior,
            conservation_status,
            research_programs,
            visitor_guidelines,
            photography_tips
        } = req.body;

        // Check if item exists
        const [existingItem] = await db.query(
            'SELECT * FROM wildlife_flora_items WHERE id = ?',
            [req.params.id]
        );

        if (existingItem.length === 0) {
            return res.status(404).json({ message: 'Wildlife flora item not found' });
        }

        // Check if sanctuary exists and get its name
        const [sanctuary] = await db.query(
            'SELECT id, title FROM wildlife_sanctuaries WHERE id = ?',
            [sanctuary_id]
        );

        if (sanctuary.length === 0) {
            return res.status(400).json({ message: 'Wildlife sanctuary not found' });
        }

        const sanctuary_name = sanctuary[0].title || 'Unknown Sanctuary';

        // Handle main image
        let image_path = existingItem[0].image_path;
        let image_name = existingItem[0].image_name;
        if (req.file) {
            // Delete old image if exists
            if (existingItem[0].image_path) {
                try {
                    await fs.unlink(path.join('uploads', existingItem[0].image_path));
                } catch (error) {
                    }
            }
            image_path = req.file.filename;
            image_name = req.file.originalname;
        }

        // Update database
        await db.query(`
            UPDATE wildlife_flora_items 
            SET sanctuary_id = ?, sanctuary_name = ?, category = ?, name = ?, 
                description = ?, image_path = ?, image_name = ?, sort_order = ?, is_active = ?,
                best_time_for_wildlife = ?, wildlife_behavior = ?, conservation_status = ?,
                research_programs = ?, visitor_guidelines = ?, photography_tips = ?
            WHERE id = ?
        `, [
            sanctuary_id, sanctuary_name, category, name, description,
            image_path, image_name, sort_order, is_active,
            best_time_for_wildlife, wildlife_behavior, conservation_status,
            research_programs, visitor_guidelines, photography_tips, req.params.id
        ]);

        res.json({ message: 'Wildlife flora item updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating wildlife flora item' });
    }
};

// Delete wildlife flora item
exports.deleteWildlifeFloraItem = async (req, res) => {
    try {
        // Get item details first
        const [item] = await db.query(
            'SELECT image_path FROM wildlife_flora_items WHERE id = ?',
            [req.params.id]
        );

        if (item.length === 0) {
            return res.status(404).json({ message: 'Wildlife flora item not found' });
        }

        // Delete main image if exists
        if (item[0].image_path) {
            try {
                await fs.unlink(path.join('uploads', item[0].image_path));
            } catch (error) {
                }
        }

        // Delete additional images
        const [additionalImages] = await db.query(
            'SELECT image_path FROM wildlife_flora_images WHERE wildlife_flora_item_id = ?',
            [req.params.id]
        );

        for (const img of additionalImages) {
            if (img.image_path) {
                try {
                    await fs.unlink(path.join('uploads', img.image_path));
                } catch (error) {
                    }
            }
        }

        // Delete from database (cascade will handle wildlife_flora_images)
        await db.query('DELETE FROM wildlife_flora_items WHERE id = ?', [req.params.id]);

        res.json({ message: 'Wildlife flora item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting wildlife flora item' });
    }
};

// Upload additional images for wildlife flora item
exports.uploadAdditionalImages = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { alt_text, sort_order = 0 } = req.body;

        // Check if item exists
        const [item] = await db.query(
            'SELECT id FROM wildlife_flora_items WHERE id = ?',
            [itemId]
        );

        if (item.length === 0) {
            return res.status(404).json({ message: 'Wildlife flora item not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Insert image record
        const [result] = await db.query(`
            INSERT INTO wildlife_flora_images (
                wildlife_flora_item_id, image_path, image_name, alt_text, sort_order
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            itemId, req.file.filename, req.file.originalname, alt_text, sort_order
        ]);

        res.status(201).json({
            message: 'Additional image uploaded successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading additional image' });
    }
};

// Delete additional image
exports.deleteAdditionalImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        // Get image details first
        const [image] = await db.query(
            'SELECT image_path FROM wildlife_flora_images WHERE id = ?',
            [imageId]
        );

        if (image.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete image file
        if (image[0].image_path) {
            try {
                await fs.unlink(path.join('uploads', image[0].image_path));
            } catch (error) {
                }
        }

        // Delete from database
        await db.query('DELETE FROM wildlife_flora_images WHERE id = ?', [imageId]);

        res.json({ message: 'Additional image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting additional image' });
    }
};

// Get all wildlife flora items grouped by sanctuary
exports.getAllWildlifeFloraBySanctuary = async (req, res) => {
    try {
        // First get all sanctuaries that have wildlife flora data (including inactive items)
        const [sanctuaries] = await db.query(`
            SELECT DISTINCT wfs.id, wfs.title as sanctuary_name, wfs.location
            FROM wildlife_sanctuaries wfs
            INNER JOIN wildlife_flora_items wfi ON wfs.id = wfi.sanctuary_id
            ORDER BY wfs.title
        `);

        // For each sanctuary, get the count of items by category (including inactive items)
        const result = [];
        for (const sanctuary of sanctuaries) {
            const [categoryCounts] = await db.query(`
                SELECT 
                    category,
                    COUNT(*) as count
                FROM wildlife_flora_items 
                WHERE sanctuary_id = ?
                GROUP BY category
            `, [sanctuary.id]);

            // Create summary object
            const summary = {
                id: sanctuary.id,
                sanctuary_name: sanctuary.sanctuary_name,
                location: sanctuary.location,
                total_items: categoryCounts.reduce((sum, cat) => sum + cat.count, 0),
                categories: categoryCounts.reduce((acc, cat) => {
                    acc[cat.category] = cat.count;
                    return acc;
                }, {}),
                mammals_count: categoryCounts.find(c => c.category === 'mammals')?.count || 0,
                birds_count: categoryCounts.find(c => c.category === 'birds')?.count || 0,
                reptiles_count: categoryCounts.find(c => c.category === 'reptiles')?.count || 0,
                flora_count: categoryCounts.find(c => c.category === 'flora')?.count || 0,
                endangered_species_count: categoryCounts.find(c => c.category === 'endangered_species')?.count || 0
            };

            result.push(summary);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wildlife flora data' });
    }
};

// Delete all wildlife flora items for a sanctuary
exports.deleteAllWildlifeFloraBySanctuary = async (req, res) => {
    try {
        const { sanctuaryId } = req.params;
        
        // Get all items for this sanctuary to delete their images
        const [items] = await db.query(
            'SELECT image_path FROM wildlife_flora_items WHERE sanctuary_id = ?',
            [sanctuaryId]
        );

        // Delete all image files
        for (const item of items) {
            if (item.image_path) {
                try {
                    await fs.unlink(path.join('uploads', item.image_path));
                } catch (error) {
                    }
            }
        }

        // Delete all additional images for this sanctuary
        const [additionalImages] = await db.query(`
            SELECT wfi.image_path 
            FROM wildlife_flora_images wfi
            INNER JOIN wildlife_flora_items wf ON wfi.wildlife_flora_item_id = wf.id
            WHERE wf.sanctuary_id = ?
        `, [sanctuaryId]);

        for (const img of additionalImages) {
            if (img.image_path) {
                try {
                    await fs.unlink(path.join('uploads', img.image_path));
                } catch (error) {
                    }
            }
        }

        // Delete all wildlife flora items for this sanctuary
        await db.query('DELETE FROM wildlife_flora_items WHERE sanctuary_id = ?', [sanctuaryId]);

        res.json({ message: 'All wildlife flora items for sanctuary deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting wildlife flora items' });
    }
}; 