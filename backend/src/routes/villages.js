const express = require('express');
const router = express.Router();
const pool = require('../../db');
const multer = require('multer');
const path = require('path');
const slugify = require('slugify');
const fs = require('fs');

// Validation middleware for meta fields
const validateMetaFields = (req, res, next) => {
  const { meta_title, meta_description, meta_keywords } = req.body;
  const errors = [];

  // Validate meta title (50-60 characters)
  if (meta_title) {
    if (meta_title.length < 50 || meta_title.length > 60) {
      errors.push('Meta title must be between 50 and 60 characters long');
    }
  }

  // Validate meta description (150-160 characters)
  if (meta_description) {
    if (meta_description.length < 150 || meta_description.length > 160) {
      errors.push('Meta description must be between 150 and 160 characters long');
    }
  }

  // Validate meta keywords (minimum 8 keywords)
  if (meta_keywords) {
    const keywords = meta_keywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywords.length < 8) {
      errors.push('Meta keywords must have at least 8 keywords (comma-separated)');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Multer setup for uploading single image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET all state villages with optional filters
router.get('/', async (req, res) => {
  try {
    const { state_id, district_id, subdistrict_id } = req.query;
    let query = `
      SELECT v.id, v.name, v.slug, v.description, v.location, v.population, v.main_occupation,
             v.cultural_significance, v.attractions, v.how_to_reach, v.best_time_to_visit,
             v.featured_image, v.status, v.state_id, v.district_id, v.subdistrict_id,
             v.area, v.highlights, v.meta_title, v.meta_description, v.meta_keywords,
             s.name as state_name, d.name as district_name, sd.title as subdistrict_name
      FROM villages v
      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN subdistricts sd ON v.subdistrict_id = sd.id
      WHERE v.village_type = 'state'
    `;
    
    const params = [];
    
    if (state_id) {
      query += ' AND v.state_id = ?';
      params.push(state_id);
    }
    
    if (district_id) {
      query += ' AND v.district_id = ?';
      params.push(district_id);
    }
    
    if (subdistrict_id) {
      query += ' AND v.subdistrict_id = ?';
      params.push(subdistrict_id);
    }
    
    query += ' ORDER BY v.name ASC';
    
    const [villages] = await pool.query(query, params);
    // Format image path to include full URL and ensure consistent format
    const formattedVillages = villages.map(village => {
      const formatted = {
        ...village,
        featured_image: village.featured_image 
          ? (village.featured_image.startsWith('http') 
            ? village.featured_image 
            : `${process.env.SERVER_URL}/uploads/${village.featured_image}`)
          : null,
        status: village.status || 'draft',
        type: 'state'
      };
      return formatted;
    });
    
    res.json({
      success: true,
      data: formattedVillages || [] // Ensure we always send an array
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching state villages',
      error: error.message
    });
  }
});

// GET village by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [village] = await pool.query(`
      SELECT v.*, 
             s.name as state_name, 
             d.name as district_name, 
             sd.title as subdistrict_name
      FROM villages v
      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN subdistricts sd ON v.subdistrict_id = sd.id
      WHERE v.slug = ? AND v.village_type = 'state'
    `, [slug]);

    if (village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'State village not found'
      });
    }

    // Format image path
    const formattedVillage = {
      ...village[0],
      featured_image: village[0].featured_image ? `${process.env.SERVER_URL}/uploads/${village[0].featured_image}` : null
    };

    res.json({
      success: true,
      data: formattedVillage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching state village',
      error: error.message
    });
  }
});

// POST route to create a new village
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      population,
      main_occupation,
      cultural_significance,
      attractions,
      how_to_reach,
      best_time_to_visit,
      featured_image,
      status,
      state_id,
      district_id,
      subdistrict_id,
      area,
      highlights,
      meta_title,
      meta_description,
      meta_keywords,
      village_type
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Village name is required'
      });
    }

    // Create the village
    const [result] = await pool.query(
      `INSERT INTO villages (
        name, description, location, population, main_occupation,
        cultural_significance, attractions, how_to_reach, best_time_to_visit,
        featured_image, status, state_id, district_id, subdistrict_id,
        area, highlights, meta_title, meta_description, meta_keywords,
        village_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        location,
        population,
        main_occupation,
        cultural_significance,
        attractions,
        how_to_reach,
        best_time_to_visit,
        featured_image || null,
        status || 'draft',
        state_id || null,
        district_id || null,
        subdistrict_id || null,
        area || null,
        highlights,
        meta_title,
        meta_description,
        meta_keywords,
        village_type || 'state'
      ]
    );

    // Get the created village
    const [newVillage] = await pool.query(
      'SELECT * FROM villages WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Village created successfully',
      data: newVillage[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating village',
      error: error.message
    });
  }
});

// PUT route to update a village
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      population,
      main_occupation,
      cultural_significance,
      attractions,
      how_to_reach,
      best_time_to_visit,
      featured_image,
      status,
      state_id,
      district_id,
      subdistrict_id,
      area,
      highlights,
      meta_title,
      meta_description,
      meta_keywords,
      village_type
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Village name is required'
      });
    }

    // Update the village
    await pool.query(
      `UPDATE villages SET
        name = ?,
        description = ?,
        location = ?,
        population = ?,
        main_occupation = ?,
        cultural_significance = ?,
        attractions = ?,
        how_to_reach = ?,
        best_time_to_visit = ?,
        featured_image = ?,
        status = ?,
        state_id = ?,
        district_id = ?,
        subdistrict_id = ?,
        area = ?,
        highlights = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        village_type = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        description,
        location,
        population,
        main_occupation,
        cultural_significance,
        attractions,
        how_to_reach,
        best_time_to_visit,
        featured_image || null,
        status || 'draft',
        state_id || null,
        district_id || null,
        subdistrict_id || null,
        area || null,
        highlights,
        meta_title,
        meta_description,
        meta_keywords,
        village_type || 'state',
        req.params.id
      ]
    );

    // Get the updated village
    const [updatedVillage] = await pool.query(
      'SELECT * FROM villages WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Village updated successfully',
      data: updatedVillage[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating village',
      error: error.message
    });
  }
});

// DELETE state village
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the village to delete its featured image
    const [village] = await pool.query(
      'SELECT featured_image FROM villages WHERE id = ? AND village_type = "state"',
      [id]
    );

    if (village.length > 0 && village[0].featured_image) {
      const imagePath = path.join(__dirname, '../../', village[0].featured_image);
      try {
        await fs.promises.unlink(imagePath);
      } catch (err) {
        }
    }

    const [result] = await pool.query(
      'DELETE FROM villages WHERE id = ? AND village_type = "state"',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'State village not found'
      });
    }

    res.json({
      success: true,
      message: 'State village deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting state village',
      error: error.message
    });
  }
});

module.exports = router; 