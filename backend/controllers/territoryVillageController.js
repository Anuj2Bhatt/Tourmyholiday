const db = require('../config/database');
const { validationResult } = require('express-validator');

// Get all territory villages with filters
exports.getTerritoryVillages = async (req, res) => {
  try {
    const { territory_id, district_id, subdistrict_id } = req.query;
    let query = `
      SELECT v.*, 
        t.title as territory_name,
        d.name as district_name,
        sd.title as subdistrict_name
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

    const [villages] = await db.query(query, params);

    // Get images for each village
    for (let village of villages) {
      const [images] = await db.query(
        'SELECT * FROM territory_village_images WHERE village_id = ? ORDER BY display_order ASC',
        [village.id]
      );
      village.images = images;
    }

    res.json({
      success: true,
      data: villages
    });

  } catch (error) {
    console.error('Error fetching territory villages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching villages',
      error: error.message
    });
  }
};

// Get single territory village with images
exports.getTerritoryVillage = async (req, res) => {
  try {
    const { id } = req.params;

    // Get village details
    const [villages] = await db.query(`
      SELECT v.*, 
        t.title as territory_name,
        d.name as district_name,
        sd.title as subdistrict_name
      FROM territory_villages v
      LEFT JOIN territories t ON v.territory_id = t.id
      LEFT JOIN territory_districts d ON v.territory_district_id = d.id
      LEFT JOIN territory_subdistricts sd ON v.territory_subdistrict_id = sd.id
      WHERE v.id = ?
    `, [id]);

    if (villages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    const village = villages[0];

    // Get village images
    const [images] = await db.query(
      'SELECT * FROM territory_village_images WHERE village_id = ? ORDER BY display_order ASC',
      [id]
    );
    village.images = images;

    res.json({
      success: true,
      data: village
    });

  } catch (error) {
    console.error('Error fetching territory village:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching village',
      error: error.message
    });
  }
};

// Create new territory village
exports.createTerritoryVillage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      slug,
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
      meta_title,
      meta_description,
      meta_keywords,
      highlights,
      territory_id,
      territory_district_id,
      territory_subdistrict_id
    } = req.body;

    const query = `
      INSERT INTO territory_villages (
        name, slug, description, location, population,
        main_occupation, cultural_significance, attractions,
        how_to_reach, best_time_to_visit, featured_image,
        status, meta_title, meta_description, meta_keywords,
        highlights, territory_id, territory_district_id, territory_subdistrict_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      name, slug, description, location, population,
      main_occupation, cultural_significance, attractions,
      how_to_reach, best_time_to_visit, featured_image,
      status, meta_title, meta_description, meta_keywords,
      highlights, territory_id, territory_district_id, territory_subdistrict_id
    ]);

    res.status(201).json({
      success: true,
      message: 'Village created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Error creating territory village:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating village',
      error: error.message
    });
  }
};

// Update territory village
exports.updateTerritoryVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      slug,
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
      meta_title,
      meta_description,
      meta_keywords,
      highlights,
      territory_id,
      territory_district_id,
      territory_subdistrict_id
    } = req.body;

    const query = `
      UPDATE territory_villages SET
        name = ?, slug = ?, description = ?, location = ?,
        population = ?, main_occupation = ?, cultural_significance = ?,
        attractions = ?, how_to_reach = ?, best_time_to_visit = ?,
        featured_image = ?, status = ?, meta_title = ?,
        meta_description = ?, meta_keywords = ?, highlights = ?,
        territory_id = ?, territory_district_id = ?, territory_subdistrict_id = ?
      WHERE id = ?
    `;

    await db.query(query, [
      name, slug, description, location, population,
      main_occupation, cultural_significance, attractions,
      how_to_reach, best_time_to_visit, featured_image,
      status, meta_title, meta_description, meta_keywords,
      highlights, territory_id, territory_district_id, territory_subdistrict_id, id
    ]);

    res.json({
      success: true,
      message: 'Village updated successfully'
    });

  } catch (error) {
    console.error('Error updating territory village:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating village',
      error: error.message
    });
  }
};

// Delete territory village
exports.deleteTerritoryVillage = async (req, res) => {
  try {
    const { id } = req.params;

    // First get all images
    const [images] = await db.query(
      'SELECT image_path FROM territory_village_images WHERE village_id = ?',
      [id]
    );

    // Delete village images from database
    await db.query('DELETE FROM territory_village_images WHERE village_id = ?', [id]);

    // Delete village
    await db.query('DELETE FROM territory_villages WHERE id = ?', [id]);

    // Delete image files
    const fs = require('fs');
    const path = require('path');
    for (const image of images) {
      const filePath = path.join(__dirname, '../../uploads', image.image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Village and associated images deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting territory village:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting village',
      error: error.message
    });
  }
}; 