const express = require('express');
const router = express.Router();
const pool = require('../src/db');
const path = require('path');

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

// Helper function to parse activities
const parseActivities = (activities) => {
    if (!activities) return [];
    try {
        // If it's already a JSON string, parse it
        if (typeof activities === 'string' && activities.startsWith('[')) {
            return JSON.parse(activities);
        }
        // If it's a comma-separated string, split and trim
        if (typeof activities === 'string') {
            return activities.split(',').map(a => a.trim()).filter(a => a);
        }
        // If it's already an array, return as is
        if (Array.isArray(activities)) {
            return activities;
        }
        return [];
    } catch (error) {
        return [];
    }
};

// Search endpoint that searches across multiple tables
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json({ results: [] });
        }

        const searchTerm = `%${q.toLowerCase()}%`;

        // Search in states table
        const statesQuery = `
            SELECT 
                'state' as type,
                id,
                name as title,
                TRIM(BOTH '/' FROM route) as slug,
                description,
                CASE 
                    WHEN image LIKE 'http%' THEN image
                    WHEN image IS NOT NULL THEN CONCAT('http://localhost:5000', image)
                    ELSE NULL 
                END as image,
                'State' as category,
                capital,
                activities,
                emoji
            FROM states 
            WHERE LOWER(name) LIKE ? 
                OR LOWER(description) LIKE ? 
                OR LOWER(capital) LIKE ?
                OR LOWER(activities) LIKE ?
        `;

        // Search in territories table
        const territoriesQuery = `
            SELECT 
                'territory' as type,
                id,
                title,
                slug,
                famous_for as description,
                CASE 
                    WHEN preview_image LIKE 'http%' THEN preview_image
                    WHEN preview_image IS NOT NULL THEN CONCAT('http://localhost:5000', preview_image)
                    ELSE NULL 
                END as image_url,
                'Territory' as category,
                capital
            FROM territories 
            WHERE LOWER(title) LIKE ? 
                OR LOWER(famous_for) LIKE ? 
                OR LOWER(capital) LIKE ?
        `;

        // Search in packages table
        const packagesQuery = `
            SELECT 
                'package' as type,
                id,
                package_name as title,
                slug,
                description,
                CASE 
                    WHEN featured_image LIKE 'http%' THEN featured_image
                    WHEN featured_image IS NOT NULL THEN CONCAT('http://localhost:5000/uploads/', featured_image)
                    ELSE NULL 
                END as image,
                category,
                price,
                duration,
                location,
                state_id
            FROM packages 
            WHERE LOWER(package_name) LIKE ? 
                OR LOWER(description) LIKE ? 
                OR LOWER(location) LIKE ?
                OR LOWER(category) LIKE ?
                AND status = 'Public'
        `;

        // Search in hotels table with state information
        const hotelsQuery = `
            SELECT 
                'hotel' as type,
                h.id,
                h.name as title,
                h.slug,
                h.description,
                CASE 
                    WHEN h.featured_image LIKE 'http%' THEN h.featured_image
                    WHEN h.featured_image IS NOT NULL THEN CONCAT('http://localhost:5000/uploads/', h.featured_image)
                    ELSE NULL 
                END as image,
                h.accommodation_type as category,
                h.price_per_night,
                h.star_rating,
                h.location,
                h.state_id,
                s.name as state_name,
                h.amenities,
                h.resort_features,
                h.homestay_features,
                h.hostel_features,
                h.guesthouse_features,
                h.tent_capacity,
                h.tent_type,
                h.resort_category
            FROM hotels h
            LEFT JOIN states s ON h.state_id = s.id
            WHERE LOWER(h.name) LIKE ? 
                OR LOWER(h.description) LIKE ? 
                OR LOWER(h.location) LIKE ?
                OR LOWER(h.accommodation_type) LIKE ?
                OR LOWER(s.name) LIKE ?
        `;

        // Search in attractions table
        const attractionsQuery = `
            SELECT 
                'attraction' as type,
                id,
                title,
                slug,
                description,
                CASE 
                    WHEN featured_image LIKE 'http%' THEN featured_image
                    WHEN featured_image IS NOT NULL THEN CONCAT('http://localhost:5000', featured_image)
                    ELSE NULL 
                END as image,
                'Attraction' as category
            FROM attractions 
            WHERE LOWER(title) LIKE ? 
                OR LOWER(description) LIKE ?
        `;

        // Execute all queries
        const [states, territories, packages, hotels, attractions] = await Promise.all([
            pool.query(statesQuery, [searchTerm, searchTerm, searchTerm, searchTerm]),
            pool.query(territoriesQuery, [searchTerm, searchTerm, searchTerm]),
            pool.query(packagesQuery, [searchTerm, searchTerm, searchTerm, searchTerm]),
            pool.query(hotelsQuery, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]),
            pool.query(attractionsQuery, [searchTerm, searchTerm])
        ]);

        // Get state names for packages
        const packageStateIds = packages[0].map(pkg => pkg.state_id).filter(id => id);
        let stateNames = {};
        if (packageStateIds.length > 0) {
            const [states] = await pool.query(
                'SELECT id, name FROM states WHERE id IN (?)',
                [packageStateIds]
            );
            stateNames = states.reduce((acc, state) => {
                acc[state.id] = state.name;
                return acc;
            }, {});
        }

        // Combine and format results
        const results = [
            ...states[0].map(item => ({ 
                ...item, 
                type: 'state',
                activities: parseActivities(item.activities)
            })),
            ...territories[0].map(item => ({ 
                ...item, 
                type: 'territory'
            })),
            ...packages[0].map(item => ({ 
                ...item, 
                type: 'package',
                state_name: item.state_id ? stateNames[item.state_id] : null,
                price: parseFloat(item.price),
                formatted_price: `₹${parseFloat(item.price).toLocaleString('en-IN')}`
            })),
            ...hotels[0].map(item => ({ 
                ...item, 
                type: 'hotel',
                amenities: typeof item.amenities === 'string' ? JSON.parse(item.amenities) : item.amenities,
                resort_features: typeof item.resort_features === 'string' ? JSON.parse(item.resort_features) : item.resort_features,
                homestay_features: typeof item.homestay_features === 'string' ? JSON.parse(item.homestay_features) : item.homestay_features,
                hostel_features: typeof item.hostel_features === 'string' ? JSON.parse(item.hostel_features) : item.hostel_features,
                guesthouse_features: typeof item.guesthouse_features === 'string' ? JSON.parse(item.guesthouse_features) : item.guesthouse_features,
                formatted_price: item.price_per_night ? `₹${parseFloat(item.price_per_night).toLocaleString('en-IN')} per night` : null,
                star_rating_display: item.star_rating ? '★'.repeat(Math.floor(item.star_rating)) : null
            })),
            ...attractions[0].map(item => ({ ...item, type: 'attraction' }))
        ].filter(item => item.image !== null);

        res.json({
            success: true,
            results: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
});

module.exports = router; 