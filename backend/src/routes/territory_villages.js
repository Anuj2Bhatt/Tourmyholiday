const express = require('express');
const router = express.Router();
const pool = require('../../db');
const multer = require('multer');
const path = require('path');
const slugify = require('slugify');
const fs = require('fs');

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

// GET all territory villages with optional filters
router.get('/', async (req, res) => {
  try {
    const { territory_id, territory_district_id, territory_subdistrict_id } = req.query;
    
    let query = `
      SELECT v.id, v.name, v.description, v.location, v.population, v.main_occupation,
             v.cultural_significance, v.attractions, v.how_to_reach, v.best_time_to_visit,
             v.featured_image, v.status, v.territory_id, v.territory_district_id, v.territory_subdistrict_id,
             v.area, v.highlights, v.meta_title, v.meta_description, v.meta_keywords,
             t.title as territory_name, td.name as district_name, tsd.title as subdistrict_name
      FROM villages v
      LEFT JOIN territories t ON v.territory_id = t.id
      LEFT JOIN territory_districts td ON v.territory_district_id = td.id
      LEFT JOIN territory_subdistricts tsd ON v.territory_subdistrict_id = tsd.id
      WHERE v.village_type = 'territory'
    `;
    
    const params = [];
    
    if (territory_id) {
      query += ' AND v.territory_id = ?';
      params.push(territory_id);
    }
    
    if (territory_district_id) {
      query += ' AND v.territory_district_id = ?';
      params.push(territory_district_id);
    }
    
    if (territory_subdistrict_id) {
      query += ' AND v.territory_subdistrict_id = ?';
      params.push(territory_subdistrict_id);
    }
    
    query += ' ORDER BY v.name ASC';
    
    const [villages] = await pool.query(query, params);
    
    // Format image path to include full URL
    const formattedVillages = villages.map(village => ({
      ...village,
      featured_image: village.featured_image ? `${process.env.SERVER_URL}/uploads/${village.featured_image}` : null
    }));
      
    res.json({
      success: true,
      data: formattedVillages
    });
  } catch (error) {
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
             td.name as district_name, 
             tsd.title as subdistrict_name
      FROM villages v
      LEFT JOIN territories t ON v.territory_id = t.id
      LEFT JOIN territory_districts td ON v.territory_district_id = td.id
      LEFT JOIN territory_subdistricts tsd ON v.territory_subdistrict_id = tsd.id
      WHERE v.slug = ? AND v.village_type = 'territory'
    `, [slug]);

    if (village.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Territory village not found'
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
      message: 'Error fetching territory village',
      error: error.message
    });
  }
});

// POST new territory village
router.post('/', upload.single('featured_image'), validateMetaFields, async (req, res) => {
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

    while (slugExists) {
      const [existing] = await pool.query(
        'SELECT id FROM villages WHERE slug = ? AND village_type = "territory"',
        [slug]
      );
      
      if (existing.length === 0) {
        slugExists = false;
      } else {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    // Handle featured image upload
    let featuredImagePath = null;
    if (req.file) {
      featuredImagePath = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO villages (
        name, slug, description, location, population, main_occupation,
        cultural_significance, attractions, how_to_reach, best_time_to_visit,
        featured_image, territory_id, territory_district_id, territory_subdistrict_id,
        area, highlights, meta_title, meta_description, meta_keywords, 
        status, village_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'territory')`,
      [
        name, slug, description, location, population, main_occupation,
        cultural_significance, attractions, how_to_reach, best_time_to_visit,
        featuredImagePath, territory_id, territory_district_id, territory_subdistrict_id,
        area, highlights, meta_title, meta_description, meta_keywords, 
        status || 'draft'
      ]
    );

    const [newVillage] = await pool.query(
      'SELECT * FROM villages WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: {
        ...newVillage[0],
        featured_image: newVillage[0].featured_image ? `${process.env.SERVER_URL}${newVillage[0].featured_image}` : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating territory village',
      error: error.message
    });
  }
});

// PUT update territory village
router.put('/:id', upload.single('featured_image'), validateMetaFields, async (req, res) => {
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

    // Handle featured image upload
    let featuredImagePath = undefined;
    if (req.file) {
      featuredImagePath = `/uploads/${req.file.filename}`;
      
      // Get old image path to delete it
      const [oldVillage] = await pool.query(
        'SELECT featured_image FROM villages WHERE id = ? AND village_type = "territory"',
        [id]
      );

      if (oldVillage.length > 0 && oldVillage[0].featured_image) {
        const oldImagePath = path.join(__dirname, '../../', oldVillage[0].featured_image);
        try {
          await fs.promises.unlink(oldImagePath);
        } catch (err) {
          }
      }
    }

    await pool.query(
      `UPDATE villages SET
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
        featured_image = COALESCE(?, featured_image),
        territory_id = COALESCE(?, territory_id),
        territory_district_id = COALESCE(?, territory_district_id),
        territory_subdistrict_id = COALESCE(?, territory_subdistrict_id),
        area = COALESCE(?, area),
        highlights = COALESCE(?, highlights),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        status = COALESCE(?, status)
      WHERE id = ? AND village_type = 'territory'`,
      [
        name, slug, description, location, population, main_occupation,
        cultural_significance, attractions, how_to_reach, best_time_to_visit,
        featuredImagePath, territory_id, territory_district_id, territory_subdistrict_id,
        area, highlights, meta_title, meta_description, meta_keywords,
        status, id
      ]
    );

    const [updatedVillage] = await pool.query(
      'SELECT * FROM villages WHERE id = ? AND village_type = "territory"',
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
        featured_image: updatedVillage[0].featured_image ? `${process.env.SERVER_URL}${updatedVillage[0].featured_image}` : null
      }
    });
  } catch (error) {
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
    
    // Get the village to delete its featured image
    const [village] = await pool.query(
      'SELECT featured_image FROM villages WHERE id = ? AND village_type = "territory"',
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
      'DELETE FROM villages WHERE id = ? AND village_type = "territory"',
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
    res.status(500).json({
      success: false,
      message: 'Error deleting territory village',
      error: error.message
    });
  }
});

module.exports = router; 