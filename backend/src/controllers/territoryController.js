const Territory = require('../../models/Territory');
const { validationResult } = require('express-validator');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// Create database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tourmyholiday',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Add this at the top with other constants
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Add this helper function to handle image paths
const getImagePath = (imageFile) => {
    if (!imageFile) return null;
    // Return exact same path format as existing images
    return `/uploads/${imageFile}`; // This will create path like /uploads/preview_image-1747562303143-565192879.jpeg
};

// Add this helper function to get full image URL
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Return full URL with API_URL prefix
    return `${API_URL}${imagePath}`;
};

// Get all territories
exports.getAllTerritories = async (req, res) => {
    try {
        const [territories] = await pool.query('SELECT * FROM territories');
        
        // Return full URLs for images
        const territoriesWithPaths = territories.map(territory => ({
            ...territory,
            preview_image: getFullImageUrl(territory.preview_image)
        }));

        res.json({
            success: true,
            data: territoriesWithPaths
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching territories',
            error: error.message
        });
    }
};

// Get single territory
exports.getTerritory = async (req, res) => {
    try {
        const [territories] = await pool.query('SELECT * FROM territories WHERE id = ?', [req.params.id]);
        if (territories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Territory not found'
            });
        }

        // Return full URL for image
        const territory = {
            ...territories[0],
            preview_image: getFullImageUrl(territories[0].preview_image)
        };

        res.json({
            success: true,
            data: territory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching territory',
            error: error.message
        });
    }
};

// Create new territory
exports.createTerritory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, slug, capital, famous_for, meta_title, meta_description, meta_keywords } = req.body;
        
        // Get image path if file was uploaded
        const preview_image = req.files && req.files.preview_image ? 
            getImagePath(req.files.preview_image[0].filename) : null;

        // Create territory with exact image path
        const [result] = await pool.query(
            `INSERT INTO territories (
                title, slug, capital, famous_for, 
                preview_image, meta_title, meta_description, meta_keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, slug, capital, famous_for, preview_image, meta_title, meta_description, meta_keywords]
        );

        // Get created territory with full image URL
        const [territory] = await pool.query(
            'SELECT * FROM territories WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: {
                ...territory[0],
                preview_image: getFullImageUrl(territory[0].preview_image)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update territory
exports.updateTerritory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { title, slug, capital, famous_for, meta_title, meta_description, meta_keywords } = req.body;

        // Get current territory
        const [currentTerritory] = await pool.query(
            'SELECT * FROM territories WHERE id = ?',
            [id]
        );

        if (currentTerritory.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Territory not found'
            });
        }

        // Get image path if new file was uploaded
        let preview_image = currentTerritory[0].preview_image;
        if (req.files && req.files.preview_image) {
            // Delete old image if exists
            if (currentTerritory[0].preview_image) {
                const oldImagePath = path.join(__dirname, '../../uploads', path.basename(currentTerritory[0].preview_image));
                try {
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    }
            }
            // Set new image path
            preview_image = getImagePath(req.files.preview_image[0].filename);
        }

        // Update territory with exact image path
        await pool.query(
            `UPDATE territories SET 
                title = ?, slug = ?, capital = ?, famous_for = ?,
                preview_image = ?, meta_title = ?, meta_description = ?, meta_keywords = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [title, slug, capital, famous_for, preview_image, meta_title, meta_description, meta_keywords, id]
        );

        // Get updated territory with full image URL
        const [updatedTerritory] = await pool.query(
            'SELECT * FROM territories WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...updatedTerritory[0],
                preview_image: getFullImageUrl(updatedTerritory[0].preview_image)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Delete territory
exports.deleteTerritory = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const territoryId = req.params.id;

        // Check if territory exists and get image paths
        const [territory] = await connection.query(
            'SELECT id, preview_image FROM territories WHERE id = ?', 
            [territoryId]
        );
        
        if (territory.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Territory not found'
            });
        }

        // Delete image files if they exist
        const imagePaths = [
            territory[0].preview_image
        ].filter(path => path && path !== 'NULL');

        for (const imagePath of imagePaths) {
            try {
                const fullPath = path.resolve(__dirname, '../../', decodeURIComponent(imagePath));
                if (await fs.access(fullPath).then(() => true).catch(() => false)) {
                    await fs.unlink(fullPath);
                }
            } catch (err) {
                }
        }

        // First get all district IDs for this territory
        const [districts] = await connection.query(
            'SELECT id FROM territory_districts WHERE territory_id = ?',
            [territoryId]
        );
        
        const districtIds = districts.map(d => d.id);

        if (districtIds.length > 0) {
            // Get all subdistrict IDs for these districts
            const [subdistricts] = await connection.query(
                'SELECT id FROM territory_subdistricts WHERE territory_district_id IN (?)',
                [districtIds]
            );
            
            const subdistrictIds = subdistricts.map(sd => sd.id);

            if (subdistrictIds.length > 0) {
                // Get and delete subdistrict images
                const [subdistrictImages] = await connection.query(
                    'SELECT image_url FROM territory_subdistrict_gallery WHERE territory_subdistrict_id IN (?)',
                    [subdistrictIds]
                );

                // Delete subdistrict image files
                for (const image of subdistrictImages) {
                    if (image.image_url) {
                        try {
                            const fullPath = path.resolve(__dirname, '../../', decodeURIComponent(image.image_url));
                            if (await fs.access(fullPath).then(() => true).catch(() => false)) {
                                await fs.unlink(fullPath);
                            }
                        } catch (err) {
                            }
                    }
                }

                // Delete territory subdistrict education records
                await connection.query(
                    'DELETE FROM territory_subdistrict_education WHERE territory_subdistrict_id IN (?)',
                    [subdistrictIds]
                );

                // Delete territory subdistrict travel info
                await connection.query(
                    'DELETE FROM territory_subdistrict_travel_info WHERE territory_subdistrict_id IN (?)',
                    [subdistrictIds]
                );

                // Delete territory subdistrict images
                await connection.query(
                    'DELETE FROM territory_subdistrict_gallery WHERE territory_subdistrict_id IN (?)',
                    [subdistrictIds]
                );

                // Delete territory subdistricts
                await connection.query(
                    'DELETE FROM territory_subdistricts WHERE territory_district_id IN (?)',
                    [districtIds]
                );
            }

            // Delete district images
            for (const district of districts) {
                if (district.featured_image) {
                    try {
                        const fullPath = path.resolve(__dirname, '../../', decodeURIComponent(district.featured_image));
                        if (await fs.access(fullPath).then(() => true).catch(() => false)) {
                            await fs.unlink(fullPath);
                        }
                    } catch (err) {
                        }
                }
            }

            // Get and delete district images
            const [districtImages] = await connection.query(
                'SELECT image_url FROM territory_district_images WHERE territory_district_id IN (?)',
                [districtIds]
            );

            // Delete district image files
            for (const image of districtImages) {
                if (image.image_url) {
                    try {
                        const fullPath = path.resolve(__dirname, '../../', decodeURIComponent(image.image_url));
                        if (await fs.access(fullPath).then(() => true).catch(() => false)) {
                            await fs.unlink(fullPath);
                        }
                    } catch (err) {
                        }
                }
            }

            // Delete territory district images
            await connection.query(
                'DELETE FROM territory_district_images WHERE territory_district_id IN (?)',
                [districtIds]
            );
        }

        // Delete territory districts
        await connection.query('DELETE FROM territory_districts WHERE territory_id = ?', [territoryId]);

        // Get and delete territory images
        const [territoryImages] = await connection.query(
            'SELECT image_url FROM territory_images WHERE territory_id = ?',
            [territoryId]
        );

        // Delete territory image files
        for (const image of territoryImages) {
            if (image.image_url) {
                try {
                    const fullPath = path.resolve(__dirname, '../../', decodeURIComponent(image.image_url));
                    if (await fs.access(fullPath).then(() => true).catch(() => false)) {
                        await fs.unlink(fullPath);
                    }
                } catch (err) {
                    }
            }
        }

        // Delete territory images
        await connection.query('DELETE FROM territory_images WHERE territory_id = ?', [territoryId]);

        // Delete territory history
        await connection.query('DELETE FROM territory_history WHERE territory_id = ?', [territoryId]);

        // Finally delete the territory
        await connection.query('DELETE FROM territories WHERE id = ?', [territoryId]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Territory and all related records deleted successfully'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error deleting territory',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get territory by slug
exports.getTerritoryBySlug = async (req, res) => {
    try {
        const [territories] = await pool.query('SELECT * FROM territories WHERE slug = ?', [req.params.slug]);
        if (territories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Territory not found'
            });
        }
        res.json({
            success: true,
            data: {
                ...territories[0],
                preview_image: getFullImageUrl(territories[0].preview_image)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching territory',
            error: error.message
        });
    }
}; 