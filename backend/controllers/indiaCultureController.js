const db = require('../db');
const path = require('path');
const fs = require('fs').promises;

// Helper function to handle image upload
const handleImageUpload = async (file) => {
  if (!file) return null;
  
  // Generate unique filename
  const timestamp = Date.now();
  const originalName = file.originalname;
  const extension = path.extname(originalName);
  const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${extension}`;
  
  // Save to uploads folder
  const uploadPath = path.join(__dirname, '../uploads', filename);
  await fs.writeFile(uploadPath, file.buffer);
  
  return filename;
};

// Helper function to delete old image
const deleteOldImage = async (imagePath) => {
  if (!imagePath) return;
  
  try {
    const fullPath = path.join(__dirname, '../uploads', imagePath);
    await fs.unlink(fullPath);
  } catch (error) {
    }
};

// Get all India Cultures
exports.getAllIndiaCultures = async (req, res) => {
  try {
    const query = 'SELECT * FROM india_cultures ORDER BY created_at DESC';
    const [cultures] = await db.query(query);
    
    res.json(cultures);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching India cultures',
      error: error.message 
    });
  }
};

// Get India Culture by ID
exports.getIndiaCultureById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM india_cultures WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'India Culture not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching India culture' });
  }
};

// Create new India Culture
exports.createIndiaCulture = async (req, res) => {
  try {
    const { 
      title, 
      slug, 
      description, 
      state_name,
      region,
      category,
      population,
      language,
      meta_title, 
      meta_description, 
      meta_keywords 
    } = req.body;
  
    
    // Check if slug exists
    const slugCheckQuery = 'SELECT COUNT(*) as count FROM india_cultures WHERE slug = ?';
    const [slugResult] = await db.query(slugCheckQuery, [slug]);
    
    if (slugResult[0].count > 0) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    
    // Handle image upload
    let featured_image = null;
    if (req.file) {
      featured_image = await handleImageUpload(req.file);
    }
    
    const insertQuery = `
      INSERT INTO india_cultures (
        title, slug, description, state_name, region, category,
        population, language, featured_image, meta_title, meta_description, meta_keywords, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
      title, slug, description, state_name, region, category,
      population, language, featured_image, meta_title, meta_description, meta_keywords
    ];
    
    const [result] = await db.query(insertQuery, values);
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'India Culture created successfully',
      culture: {
        id: result.insertId,
        title,
        slug,
        description,
        state_name,
        region,
        category,
        population,
        language,
        featured_image,
        meta_title,
        meta_description,
        meta_keywords
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating India culture',
      error: error.message 
    });
  }
};

// Update India Culture
exports.updateIndiaCulture = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      slug, 
      description, 
      state_name,
      region,
      category,
      population,
      language,
      meta_title, 
      meta_description, 
      meta_keywords 
    } = req.body;
    
    // Check if slug exists (excluding current record)
    const slugCheckQuery = 'SELECT COUNT(*) as count FROM india_cultures WHERE slug = ? AND id != ?';
    const [slugResult] = await db.query(slugCheckQuery, [slug, id]);
    
    if (slugResult[0].count > 0) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    
    // Get current culture to check for image
    const getQuery = 'SELECT featured_image FROM india_cultures WHERE id = ?';
    const [currentCulture] = await db.query(getQuery, [id]);
    
    if (currentCulture.length === 0) {
      return res.status(404).json({ message: 'India Culture not found' });
    }
    
    // Handle image upload
    let featured_image = currentCulture[0].featured_image;
    if (req.file) {
      // Delete old image if exists
      if (featured_image) {
        await deleteOldImage(featured_image);
      }
      featured_image = await handleImageUpload(req.file);
    }
    
    const updateQuery = `
      UPDATE india_cultures 
      SET title = ?, slug = ?, description = ?, 
          state_name = ?, region = ?, category = ?, population = ?, language = ?, featured_image = ?,
          meta_title = ?, meta_description = ?, meta_keywords = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const values = [
      title, slug, description, state_name, region, category,
      population, language, featured_image, meta_title, meta_description, meta_keywords, id
    ];
    
    const [result] = await db.query(updateQuery, values);
    
    if (result.affectedRows > 0) {
      res.json({ message: 'India Culture updated successfully' });
    } else {
      res.status(404).json({ message: 'India Culture not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating India culture' });
  }
};

// Delete India Culture
exports.deleteIndiaCulture = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get culture to delete image
    const getQuery = 'SELECT featured_image FROM india_cultures WHERE id = ?';
    const [culture] = await db.query(getQuery, [id]);
    
    if (culture.length > 0 && culture[0].featured_image) {
      await deleteOldImage(culture[0].featured_image);
    }
    
    const deleteQuery = 'DELETE FROM india_cultures WHERE id = ?';
    const [result] = await db.query(deleteQuery, [id]);
    
    if (result.affectedRows > 0) {
      res.json({ message: 'India Culture deleted successfully' });
    } else {
      res.status(404).json({ message: 'India Culture not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting India culture' });
  }
};

// Get India Cultures by category
exports.getIndiaCulturesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const query = 'SELECT * FROM india_cultures WHERE category = ? ORDER BY created_at DESC';
    const [cultures] = await db.query(query, [category]);
    
    res.json(cultures);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching India cultures by category' });
  }
};

// Get India Cultures by state
exports.getIndiaCulturesByState = async (req, res) => {
  try {
    const { state } = req.params;
    const query = 'SELECT * FROM india_cultures WHERE state_name = ? ORDER BY created_at DESC';
    const [cultures] = await db.query(query, [state]);
    
    res.json(cultures);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching India cultures by state' });
  }
};

// Get India Cultures by region
exports.getIndiaCulturesByRegion = async (req, res) => {
  try {
    const { region } = req.params;
    const query = 'SELECT * FROM india_cultures WHERE region = ? ORDER BY created_at DESC';
    const [cultures] = await db.query(query, [region]);
    
    res.json(cultures);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching India cultures by region' });
  }
}; 