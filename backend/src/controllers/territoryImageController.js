const TerritoryImage = require('../models/TerritoryImage');
const Territory = require('../models/Territory');
const { ApiResponse } = require('../utils/ApiResponse');
const pool = require('../../config/database');
const path = require('path');
const fs = require('fs').promises;

// Get all images for a territory
const getTerritoryImages = async (req, res) => {
  try {
    const { territory_id } = req.query;
    
    let query = `
      SELECT * FROM territory_images
      WHERE 1=1
    `;
    const params = [];

    if (territory_id) {
      query += ' AND territory_id = ?';
      params.push(territory_id);
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    const [images] = await pool.query(query, params);

    res.json({
      success: true,
      data: images
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching territory images'
    });
  }
};

// Upload territory image
const uploadTerritoryImage = async (req, res) => {
  let connection;
  try {
    if (!req.file) {
      throw new Error('No image file uploaded');
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const { territory_id, title, description, is_featured = false, display_order = 0 } = req.body;
    
    if (!territory_id) {
      throw new Error('Territory ID is required');
    }

    // Insert image data
    const [result] = await connection.query(
      `INSERT INTO territory_images (
        territory_id, image_path, title, description, 
        is_featured, display_order
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        territory_id,
        req.file.filename,
        title || null,
        description || null,
        is_featured ? 1 : 0,
        display_order
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Territory image uploaded successfully',
      data: {
        id: result.insertId,
        territory_id,
        image_path: req.file.filename,
        title,
        description,
        is_featured,
        display_order
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading territory image'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Delete territory image
const deleteTerritoryImage = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const imageId = req.params.id;

    // Get image info before deleting
    const [image] = await connection.query(
      'SELECT image_path FROM territory_images WHERE id = ?',
      [imageId]
    );

    if (!image[0]) {
      throw new Error('Image not found');
    }

    // Delete image file
    const imagePath = path.join(__dirname, '../../uploads', image[0].image_path);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      }

    // Delete from database
    await connection.query(
      'DELETE FROM territory_images WHERE id = ?',
      [imageId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Territory image deleted successfully'
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting territory image'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const image = await TerritoryImage.getById(imageId);
    if (!image) {
      return res.status(404).json(new ApiResponse(false, 'Image not found'));
    }

    const updatedImage = await TerritoryImage.toggleFeatured(imageId);
    return res.json(new ApiResponse(true, 'Featured status updated successfully', updatedImage));
  } catch (error) {
    return res.status(500).json(new ApiResponse(false, 'Error updating featured status'));
  }
};

// Update display order
const updateDisplayOrder = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { display_order } = req.body;
    
    if (!display_order && display_order !== 0) {
      return res.status(400).json(new ApiResponse(false, 'Display order is required'));
    }

    const image = await TerritoryImage.getById(imageId);
    if (!image) {
      return res.status(404).json(new ApiResponse(false, 'Image not found'));
    }

    const updatedImage = await TerritoryImage.updateDisplayOrder(imageId, display_order);
    return res.json(new ApiResponse(true, 'Display order updated successfully', updatedImage));
  } catch (error) {
    return res.status(500).json(new ApiResponse(false, 'Error updating display order'));
  }
};

module.exports = {
  getTerritoryImages,
  uploadTerritoryImage,
  deleteTerritoryImage,
  toggleFeatured,
  updateDisplayOrder
}; 