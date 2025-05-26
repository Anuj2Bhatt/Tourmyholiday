const db = require('../config/database');
const { validationResult } = require('express-validator');

// Get all state villages with filters
exports.getStateVillages = async (req, res) => {
  try {
    const { state_id, district_id, subdistrict_id } = req.query;
    let query = `
      SELECT v.*, 
        s.name as state_name,
        d.name as district_name,
        sd.name as subdistrict_name
      FROM villages v
      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN subdistricts sd ON v.subdistrict_id = sd.id
      WHERE 1=1
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

    const [villages] = await db.query(query, params);

    // Get images for each village
    for (let village of villages) {
      const [images] = await db.query(
        'SELECT * FROM state_village_images WHERE village_id = ? ORDER BY display_order ASC',
        [village.id]
      );
      village.images = images;
    }

    res.json({
      success: true,
      data: villages
    });

  } catch (error) {
    console.error('Error fetching state villages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching villages',
      error: error.message
    });
  }
};

// Get single state village with images
exports.getStateVillage = async (req, res) => {
  try {
    const { id } = req.params;

    // Get village details
    const [villages] = await db.query(`
      SELECT v.*, 
        s.name as state_name,
        d.name as district_name,
        sd.name as subdistrict_name
      FROM villages v
      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN subdistricts sd ON v.subdistrict_id = sd.id
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
      'SELECT * FROM state_village_images WHERE village_id = ? ORDER BY display_order ASC',
      [id]
    );
    village.images = images;

    res.json({
      success: true,
      data: village
    });

  } catch (error) {
    console.error('Error fetching state village:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching village',
      error: error.message
    });
  }
};

// Create new state village
exports.createStateVillage = async (req, res) => {
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
      state_id,
      district_id,
      subdistrict_id
    } = req.body;

    const query = `
      INSERT INTO villages (
        name, slug, description, location, population,
        main_occupation, cultural_significance, attractions,
        how_to_reach, best_time_to_visit, featured_image,
        status, meta_title, meta_description, meta_keywords,
        highlights, state_id, district_id, subdistrict_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      name, slug, description, location, population,
      main_occupation, cultural_significance, attractions,
      how_to_reach, best_time_to_visit, featured_image,
      status, meta_title, meta_description, meta_keywords,
      highlights, state_id, district_id, subdistrict_id
    ]);

    res.status(201).json({
      success: true,
      message: 'Village created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Error creating state village:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating village',
      error: error.message
    });
  }
};

// Update state village
exports.updateStateVillage = async (req, res) => {
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
      state_id,
      district_id,
      subdistrict_id
    } = req.body;

    const query = `
      UPDATE villages SET
        name = ?, slug = ?, description = ?, location = ?,
        population = ?, main_occupation = ?, cultural_significance = ?,
        attractions = ?, how_to_reach = ?, best_time_to_visit = ?,
        featured_image = ?, status = ?, meta_title = ?,
        meta_description = ?, meta_keywords = ?, highlights = ?,
        state_id = ?, district_id = ?, subdistrict_id = ?
      WHERE id = ?
    `;

    await db.query(query, [
      name, slug, description, location, population,
      main_occupation, cultural_significance, attractions,
      how_to_reach, best_time_to_visit, featured_image,
      status, meta_title, meta_description, meta_keywords,
      highlights, state_id, district_id, subdistrict_id, id
    ]);

    res.json({
      success: true,
      message: 'Village updated successfully'
    });

  } catch (error) {
    console.error('Error updating state village:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating village',
      error: error.message
    });
  }
};

// Delete state village
exports.deleteStateVillage = async (req, res) => {
  try {
    const { id } = req.params;

    // First get all images
    const [images] = await db.query(
      'SELECT image_path FROM state_village_images WHERE village_id = ?',
      [id]
    );

    // Delete village images from database
    await db.query('DELETE FROM state_village_images WHERE village_id = ?', [id]);

    // Delete village
    await db.query('DELETE FROM villages WHERE id = ?', [id]);

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
    console.error('Error deleting state village:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting village',
      error: error.message
    });
  }
}; 