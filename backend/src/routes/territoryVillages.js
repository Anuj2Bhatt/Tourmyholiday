const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const slugify = require('slugify');

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

// Multer setup for uploading images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET all territory villages with optional filters
router.get('/', async (req, res) => {
  try {
    const { territory_id, district_id, subdistrict_id } = req.query;
    
    let query = `
      SELECT v.id, v.name, v.description, v.location, v.population, v.main_occupation,
             v.cultural_significance, v.attractions, v.how_to_reach, v.best_time_to_visit,
             v.images, v.featured_image, v.status, v.territory_id, v.territory_district_id, 
             v.territory_subdistrict_id, v.area, v.highlights, v.meta_title, v.meta_description, 
             v.meta_keywords,
             t.title as territory_name, d.name as district_name, sd.title as subdistrict_name
      FROM territory_villages v
      LEFT JOIN territories t ON v.territory_id = t.id
      LEFT JOIN territory_districts d ON v.territory_district_id = d.id
      LEFT JOIN territory_subdistricts sd ON v.territory_subdistrict_id = sd.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (territory_id) {
      query += ' AND v.territory_id = ?';
      params.push(territory_id);
    }
    
    if (district_id) {
      query += ' AND v.territory_district_id = ?';
      params.push(district_id);
    }
    
    if (subdistrict_id) {
      query += ' AND v.territory_subdistrict_id = ?';
      params.push(subdistrict_id);
    }
    
    query += ' ORDER BY v.name ASC';
    
    const [villages] = await pool.query(query, params);
    
    // Format image paths to include full URL
    const formattedVillages = villages.map(village => ({
      ...village,
      featured_image: village.featured_image ? `${process.env.SERVER_URL}/uploads/${village.featured_image}` : null,
      images: village.images ? JSON.parse(village.images).map(img => `${process.env.SERVER_URL}/uploads/${img}`) : []
    }));
    
    res.json({
      success: true,
      data: formattedVillages
    });
  } catch (error) {
    console.error('Error fetching territory villages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching territory villages',
      error: error.message
    });
  }
});

// GET territory village by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [village] = await pool.query(`
      SELECT v.*, 
             t.title as territory_name, 
             d.name as district_name, 
             sd.title as subdistrict_name
      FROM territory_villages v
      LEFT JOIN territories t ON v.territory_id = t.id
      LEFT JOIN territory_districts d ON v.territory_district_id = d.id
      LEFT JOIN territory_subdistricts sd ON v.territory_subdistrict_id = sd.id
      WHERE v.slug = ?
    `, [slug]);

    if (village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Territory village not found'
      });
    }

    // Format image paths
    const formattedVillage = {
      ...village[0],
      featured_image: village[0].featured_image ? `${process.env.SERVER_URL}/uploads/${village[0].featured_image}` : null,
      images: village[0].images ? JSON.parse(village[0].images).map(img => `${process.env.SERVER_URL}/uploads/${img}`) : []
    };

    res.json({
      success: true,
      data: formattedVillage
    });
  } catch (error) {
    console.error('Error fetching territory village by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching territory village',
      error: error.message
    });
  }
});

// POST new territory village
router.post('/', upload.array('images'), validateMetaFields, async (req, res) => {
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
      territory_id,
      territory_district_id,
      territory_subdistrict_id,
      area,
      highlights,
      meta_title,
      meta_description,
      meta_keywords,
      status
    } = req.body;

    // Generate and validate slug
    let slug = slugify(name, { lower: true, strict: true });
    let slugExists = true;
    let counter = 1;
    let originalSlug = slug;

    // Keep trying until we find a unique slug
    while (slugExists) {
      const [existing] = await pool.query(
        'SELECT id FROM territory_villages WHERE slug = ?',
        [slug]
      );
      
      if (existing.length === 0) {
        slugExists = false;
      } else {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const [result] = await pool.query(
      `INSERT INTO territory_villages (
        name, slug, description, location, population, main_occupation,
        cultural_significance, attractions, how_to_reach, best_time_to_visit,
        images, territory_id, territory_district_id, territory_subdistrict_id,
        area, highlights, meta_title, meta_description, meta_keywords, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, slug, description, location, population, main_occupation,
        cultural_significance, attractions, how_to_reach, best_time_to_visit,
        JSON.stringify(images), territory_id, territory_district_id, territory_subdistrict_id,
        area, highlights, meta_title, meta_description, meta_keywords, status || 'draft'
      ]
    );

    const [newVillage] = await pool.query(
      'SELECT * FROM territory_villages WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: {
        ...newVillage[0],
        images: JSON.parse(newVillage[0].images || '[]')
      }
    });
  } catch (error) {
    console.error('Error creating territory village:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating territory village',
      error: error.message
    });
  }
});

// PUT update territory village
router.put('/:id', upload.array('images'), validateMetaFields, async (req, res) => {
  try {
    const { id } = req.params;
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
      territory_id,
      territory_district_id,
      territory_subdistrict_id,
      area,
      highlights,
      meta_title,
      meta_description,
      meta_keywords,
      status
    } = req.body;

    const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Get existing village to merge images
    const [existingVillage] = await pool.query(
      'SELECT images FROM territory_villages WHERE id = ?',
      [id]
    );

    let finalImages = images;
    if (existingVillage.length > 0 && existingVillage[0].images) {
      const existingImages = JSON.parse(existingVillage[0].images);
      finalImages = [...existingImages, ...images];
    }

    await pool.query(
      `UPDATE territory_villages SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        population = COALESCE(?, population),
        main_occupation = COALESCE(?, main_occupation),
        cultural_significance = COALESCE(?, cultural_significance),
        attractions = COALESCE(?, attractions),
        how_to_reach = COALESCE(?, how_to_reach),
        best_time_to_visit = COALESCE(?, best_time_to_visit),
        images = COALESCE(?, images),
        territory_id = COALESCE(?, territory_id),
        territory_district_id = COALESCE(?, territory_district_id),
        territory_subdistrict_id = COALESCE(?, territory_subdistrict_id),
        area = COALESCE(?, area),
        highlights = COALESCE(?, highlights),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [
        name, slug, description, location, population, main_occupation,
        cultural_significance, attractions, how_to_reach, best_time_to_visit,
        finalImages.length > 0 ? JSON.stringify(finalImages) : null,
        territory_id, territory_district_id, territory_subdistrict_id,
        area, highlights, meta_title, meta_description, meta_keywords,
        status, id
      ]
    );

    const [updatedVillage] = await pool.query(
      'SELECT * FROM territory_villages WHERE id = ?',
      [id]
    );

    if (updatedVillage.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Territory village not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedVillage[0],
        images: JSON.parse(updatedVillage[0].images || '[]')
      }
    });
  } catch (error) {
    console.error('Error updating territory village:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating territory village',
      error: error.message
    });
  }
});

// DELETE territory village
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM territory_villages WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Territory village not found'
      });
    }

    res.json({
      success: true,
      message: 'Territory village deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting territory village:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting territory village',
      error: error.message
    });
  }
});

module.exports = router; 