const db = require('../db');
const { ApiResponse } = require('../src/utils/ApiResponse');

// Get all culture information
const getAllCultureInfo = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ci.*,
        c.title as culture_title,
        c.region as culture_region
      FROM india_culture_info ci
      LEFT JOIN india_cultures c ON ci.culture_id = c.id
      ORDER BY ci.created_at DESC
    `);
    
    return res.status(200).json(new ApiResponse(true, 'Culture information retrieved successfully', rows));
  } catch (error) {
    return res.status(500).json(new ApiResponse(false, 'Failed to fetch culture information', null));
  }
};

// Get culture information by ID
const getCultureInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.query(`
      SELECT 
        ci.*,
        c.title as culture_title,
        c.region as culture_region
      FROM india_culture_info ci
      LEFT JOIN india_cultures c ON ci.culture_id = c.id
      WHERE ci.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json(new ApiResponse(false, 'Culture information not found', null));
    }
    
    return res.status(200).json(new ApiResponse(true, 'Culture information retrieved successfully', rows[0]));
  } catch (error) {
    return res.status(500).json(new ApiResponse(false, 'Failed to fetch culture information', null));
  }
};

// Create new culture information
const createCultureInfo = async (req, res) => {
  try {
    const {
      culture_id,
      info_title,
      info_type,
      info_description,
      info_source,
      info_importance,
      info_tags
    } = req.body;

    // Validate required fields
    if (!culture_id || !info_title || !info_description) {
      return res.status(400).json(new ApiResponse(false, 'Culture ID, title and description are required', null));
    }

    // Check if culture exists
    const [cultureCheck] = await db.query('SELECT id FROM india_cultures WHERE id = ?', [culture_id]);
    if (cultureCheck.length === 0) {
      return res.status(400).json(new ApiResponse(false, 'Selected culture does not exist', null));
    }

    const [result] = await db.query(`
      INSERT INTO india_culture_info (
        culture_id, info_title, info_type, info_description, 
        info_source, info_importance, info_tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      culture_id, info_title, info_type, info_description,
      info_source, info_importance, info_tags
    ]);

    const [newInfo] = await db.query(`
      SELECT 
        ci.*,
        c.title as culture_title,
        c.region as culture_region
      FROM india_culture_info ci
      LEFT JOIN india_cultures c ON ci.culture_id = c.id
      WHERE ci.id = ?
    `, [result.insertId]);

    return res.status(201).json(new ApiResponse(true, 'Culture information created successfully', newInfo[0]));
  } catch (error) {
    return res.status(500).json(new ApiResponse(false, 'Failed to create culture information', null));
  }
};

// Update culture information
const updateCultureInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      culture_id,
      info_title,
      info_type,
      info_description,
      info_source,
      info_importance,
      info_tags
    } = req.body;

    // Validate required fields
    if (!culture_id || !info_title || !info_description) {
      return res.status(400).json(new ApiResponse(false, 'Culture ID, title and description are required', null));
    }

    // Check if culture information exists
    const [existingInfo] = await db.query('SELECT id FROM india_culture_info WHERE id = ?', [id]);
    if (existingInfo.length === 0) {
      return res.status(404).json(new ApiResponse(false, 'Culture information not found', null));
    }

    // Check if culture exists
    const [cultureCheck] = await db.query('SELECT id FROM india_cultures WHERE id = ?', [culture_id]);
    if (cultureCheck.length === 0) {
      return res.status(400).json(new ApiResponse(false, 'Selected culture does not exist', null));
    }

    await db.query(`
      UPDATE india_culture_info SET
        culture_id = ?, info_title = ?, info_type = ?, info_description = ?,
        info_source = ?, info_importance = ?, info_tags = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      culture_id, info_title, info_type, info_description,
      info_source, info_importance, info_tags, id
    ]);

    const [updatedInfo] = await db.query(`
      SELECT 
        ci.*,
        c.title as culture_title,
        c.region as culture_region
      FROM india_culture_info ci
      LEFT JOIN india_cultures c ON ci.culture_id = c.id
      WHERE ci.id = ?
    `, [id]);

    return res.status(200).json(new ApiResponse(true, 'Culture information updated successfully', updatedInfo[0]));
  } catch (error) {
    return res.status(500).json(new ApiResponse(false, 'Failed to update culture information', null));
  }
};

// Delete culture information
const deleteCultureInfo = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if culture information exists
    const [existingInfo] = await db.query('SELECT id FROM india_culture_info WHERE id = ?', [id]);
    if (existingInfo.length === 0) {
      return res.status(404).json(new ApiResponse(false, 'Culture information not found', null));
    }

    await db.query('DELETE FROM india_culture_info WHERE id = ?', [id]);

    return res.status(200).json(new ApiResponse(true, 'Culture information deleted successfully', null));
  } catch (error) {
    return res.status(500).json(new ApiResponse(false, 'Failed to delete culture information', null));
  }
};

// Get culture information by culture ID
const getCultureInfoByCultureId = async (req, res) => {
  try {
    const { cultureId } = req.params;
    
    const [rows] = await db.query(`
      SELECT 
        ci.*,
        c.title as culture_title,
        c.region as culture_region
      FROM india_culture_info ci
      LEFT JOIN india_cultures c ON ci.culture_id = c.id
      WHERE ci.culture_id = ?
      ORDER BY ci.created_at DESC
    `, [cultureId]);
    
    return res.status(200).json(new ApiResponse(true, 'Culture information retrieved successfully', rows));
  } catch (error) {
    return res.status(500).json(new ApiResponse(false, 'Failed to fetch culture information', null));
  }
};

module.exports = {
  getAllCultureInfo,
  getCultureInfoById,
  createCultureInfo,
  updateCultureInfo,
  deleteCultureInfo,
  getCultureInfoByCultureId
}; 