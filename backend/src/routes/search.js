const express = require('express');
const router = express.Router();
const pool = require('../../db');

// Search across all tables
router.get('/', async (req, res) => {
  try {
    const { query, q } = req.query;
    const searchQuery = query || q;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Sanitize search query
    const sanitizedQuery = searchQuery.trim().replace(/[%_]/g, '\\$&');
    const searchPattern = `%${sanitizedQuery}%`;

    const statesQuery = `
  SELECT 
    id,
    name,
    emoji,
    description,
    CASE 
      WHEN image LIKE 'http%' THEN image
      WHEN image IS NOT NULL AND image != '' THEN CONCAT(?, '/', REPLACE(image, '\\\\', '/'))
      ELSE NULL 
    END as image, 
    capital,
    activities,
    route as slug,
    meta_title,
    meta_description,
    meta_keywords,
    'state' as result_type
  FROM states 
  WHERE 
    name LIKE ? OR
    description LIKE ? OR
    capital LIKE ? OR
    activities LIKE ? OR
    meta_keywords LIKE ?
  LIMIT 5
`;

    const [states] = await pool.query(statesQuery, [
      process.env.API_BASE_URL || 'http://localhost:5000',
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    ]);

    // Search in territories
    const territoriesQuery = `
      SELECT 
        id,
        title as name,
        capital,
        famous_for as description,
        CASE 
          WHEN preview_image LIKE 'http%' THEN preview_image
          WHEN preview_image IS NOT NULL AND preview_image != '' THEN CONCAT(?, '/', REPLACE(preview_image, '\\\\', '/'))
          ELSE NULL 
        END as image,
        slug,
        meta_title,
        meta_description,
        meta_keywords,
        CHAR(116, 101, 114, 114, 105, 116, 111, 114, 121) AS result_type
      FROM territories 
      WHERE 
        title LIKE ? OR
        capital LIKE ? OR
        famous_for LIKE ? OR
        meta_keywords LIKE ?
      LIMIT 5`;

    const [territories] = await pool.query(territoriesQuery, [
      process.env.API_BASE_URL || 'http://localhost:5000',
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    ]);

    // Search in packages
    const packagesQuery = `
      SELECT 
        id,
        package_name as name,
        description,
        location,
        CASE 
          WHEN featured_image LIKE 'http%' THEN featured_image
          WHEN featured_image IS NOT NULL AND featured_image != '' THEN CONCAT(?, '/', REPLACE(featured_image, '\\\\', '/'))
          ELSE NULL 
        END as image,
        slug,
        meta_title,
        meta_description,
        meta_keywords,
        'packages' AS result_type
      FROM packages 
      WHERE 
        package_name LIKE ? OR
        description LIKE ? OR
        location LIKE ? OR
        meta_keywords LIKE ?
      LIMIT 5`;

    const [packages] = await pool.query(packagesQuery, [
      process.env.API_BASE_URL || 'http://localhost:5000',
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    ]);

    // Search in districts
    const districtsQuery = `
      SELECT 
        id,
        name,
        description,
        state_name,
        CASE 
          WHEN featured_image LIKE 'http%' THEN featured_image
          WHEN featured_image IS NOT NULL AND featured_image != '' THEN CONCAT(?, '/', REPLACE(featured_image, '\\\\', '/'))
          ELSE NULL 
        END as image,
        slug,
        meta_title,
        meta_description,
        meta_keywords,
        'districts' as result_type
      FROM districts 
      WHERE 
        name LIKE ? OR
        description LIKE ? OR
        state_name LIKE ? OR
        meta_keywords LIKE ?
      LIMIT 5`;

    const [districts] = await pool.query(districtsQuery, [
      process.env.API_BASE_URL || 'http://localhost:5000',
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    ]);

    // Search in subdistricts
    const subdistrictsQuery = `
      SELECT 
        id,
        title as name,
        description,
        CASE 
          WHEN featured_image LIKE 'http%' THEN featured_image
          WHEN featured_image IS NOT NULL AND featured_image != '' THEN CONCAT(?, '/', REPLACE(featured_image, '\\\\', '/'))
          ELSE NULL 
        END as image,
        slug,
        meta_title,
        meta_description,
        meta_keywords,
        'subdistricts' as result_type
      FROM subdistricts 
      WHERE 
        title LIKE ? OR
        description LIKE ? OR
        meta_keywords LIKE ?
      LIMIT 5`;

    const [subdistricts] = await pool.query(subdistrictsQuery, [
      process.env.API_BASE_URL || 'http://localhost:5000',
      searchPattern,
      searchPattern,
      searchPattern
    ]);

    // Combine results
    const results = {
      states: states.map(s => ({ ...s, type: s.result_type })),
      territories: territories.map(t => ({ ...t, type: t.result_type })),
      packages: packages.map(p => ({ ...p, type: p.result_type })),
      districts: districts.map(d => ({ ...d, type: d.result_type })),
      subdistricts: subdistricts.map(s => ({ ...s, type: s.result_type }))
    };

    // Calculate total results
    const totalResults =
      states.length +
      territories.length +
      packages.length +
      districts.length +
      subdistricts.length;

    res.json({
      success: true,
      query: searchQuery,
      totalResults,
      results
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