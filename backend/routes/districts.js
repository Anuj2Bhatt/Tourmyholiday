const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s/g, '-'));
  }
});

const upload = multer({ storage: storage });

// Helper function to check if state exists
const checkStateExists = async (stateName) => {
  const [states] = await pool.query('SELECT id FROM states WHERE name = ?', [stateName]);
  return states.length > 0;
};

// GET all districts
router.get('/', async (req, res) => {
  try {
    const [districts] = await pool.query('SELECT * FROM districts ORDER BY name ASC');
    
    // Format image paths
    const formattedDistricts = districts.map(district => ({
      ...district,
      featured_image: district.featured_image ? `http://localhost:5000/uploads/${path.basename(district.featured_image)}` : null
    }));
    
    res.json(formattedDistricts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
  }
});

// GET districts by state
router.get('/state/:stateName', async (req, res) => {
  try {
    const { stateName } = req.params;
    const [districts] = await pool.query('SELECT * FROM districts WHERE state_name = ? ORDER BY name ASC', [stateName]);
    
    // Format image paths
    const formattedDistricts = districts.map(district => ({
      ...district,
      featured_image: district.featured_image ? `http://localhost:5000/uploads/${path.basename(district.featured_image)}` : null
    }));
    
    res.json(formattedDistricts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
  }
});

// GET single district
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [districts] = await pool.query('SELECT * FROM districts WHERE id = ?', [id]);
    
    if (districts.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }
    
    // Format image path
    const district = districts[0];
    if (district.featured_image) {
      district.featured_image = `http://localhost:5000/uploads/${path.basename(district.featured_image)}`;
    }
    
    res.json(district);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch district', details: error.message });
  }
});

// GET single district by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [districts] = await pool.query('SELECT * FROM districts WHERE slug = ?', [slug]);
    if (districts.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }
    // Format image path
    const district = districts[0];
    if (district.featured_image) {
      district.featured_image = `http://localhost:5000/uploads/${path.basename(district.featured_image)}`;
    }
    res.json(district);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch district by slug', details: error.message });
  }
});

// POST create new district
router.post('/', upload.single('featured_image'), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      state_name,
      meta_title,
      meta_description,
      meta_keywords,
      slug 
    } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    // Check if state exists
    const stateExists = await checkStateExists(state_name);
    if (!stateExists) {
      return res.status(400).json({ error: 'State does not exist' });
    }

    const [result] = await pool.query(
      'INSERT INTO districts (name, description, state_name, featured_image, meta_title, meta_description, meta_keywords, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, state_name, imagePath, meta_title, meta_description, meta_keywords, slug]
    );

    const newDistrict = {
      id: result.insertId,
      name,
      description,
      state_name,
      featured_image: imagePath ? `http://localhost:5000/${imagePath}` : null,
      meta_title,
      meta_description,
      meta_keywords,
      slug
    };

    res.status(201).json(newDistrict);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create district', details: error.message });
  }
});

// PUT update district
router.put('/:id', upload.single('featured_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      state_name,
      meta_title,
      meta_description,
      meta_keywords,
      slug 
    } = req.body;
    
    // Check if state exists
    const stateExists = await checkStateExists(state_name);
    if (!stateExists) {
      return res.status(400).json({ error: 'State does not exist' });
    }
    
    let imagePath = req.body.featured_image; // Keep existing image if no new file uploaded
    if (req.file) {
      imagePath = `uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      'UPDATE districts SET name = ?, description = ?, state_name = ?, featured_image = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, slug = ? WHERE id = ?',
      [name, description, state_name, imagePath, meta_title, meta_description, meta_keywords, slug, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    const updatedDistrict = {
      id: parseInt(id),
      name,
      description,
      state_name,
      featured_image: imagePath ? `http://localhost:5000/${imagePath}` : null,
      meta_title,
      meta_description,
      meta_keywords,
      slug
    };

    res.json(updatedDistrict);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update district', details: error.message });
  }
});

// DELETE district
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM districts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    res.json({ message: 'District deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete district', details: error.message });
  }
});

// ================= District Image Gallery Endpoints =================

// GET all images for a district
router.get('/:districtId/images', async (req, res) => {
  try {
    const { districtId } = req.params;
    const [images] = await pool.query('SELECT * FROM district_images WHERE district_id = ? ORDER BY id DESC', [districtId]);
    // Add full URL for image_url
    const formatted = images.map(img => ({
      ...img,
      image_url: img.image_url ? `http://localhost:5000/uploads/${path.basename(img.image_url)}` : null,
      alt_text: img.alt_text || ''
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch district images', details: error.message });
  }
});

// POST upload new image for a district
router.post('/:districtId/images', upload.single('image'), async (req, res) => {
  try {
    const { districtId } = req.params;
    const { caption, alt_text } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const imagePath = `uploads/${req.file.filename}`;
    const [result] = await pool.query(
      'INSERT INTO district_images (district_id, image_url, caption, alt_text) VALUES (?, ?, ?, ?)',
      [districtId, imagePath, caption || null, alt_text || null]
    );
    res.status(201).json({
      id: result.insertId,
      district_id: districtId,
      image_url: `http://localhost:5000/${imagePath}`,
      caption: caption || null,
      alt_text: alt_text || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload district image', details: error.message });
  }
});

// DELETE an image by imageId
router.delete('/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    // Get image path to delete file
    const [rows] = await pool.query('SELECT image_url FROM district_images WHERE id = ?', [imageId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const imagePath = rows[0].image_url;
    // Delete from DB
    await pool.query('DELETE FROM district_images WHERE id = ?', [imageId]);
    // Delete file from uploads
    if (imagePath) {
      const fullPath = path.join(__dirname, '../', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete district image', details: error.message });
  }
});

// PUT update image caption and alt_text
router.put('/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { caption, alt_text } = req.body;
    const [result] = await pool.query('UPDATE district_images SET caption = ?, alt_text = ? WHERE id = ?', [caption, alt_text, imageId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ message: 'Caption and alt text updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update image caption/alt text', details: error.message });
  }
});

// ================= District Stats Endpoints =================

// GET stats for a district
router.get('/:districtId/stats', async (req, res) => {
  try {
    const { districtId } = req.params;
    const [rows] = await pool.query('SELECT * FROM district_stats WHERE district_id = ?', [districtId]);
    if (rows.length === 0) {
      return res.json(null);
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch district stats', details: error.message });
  }
});

// POST/PUT stats for a district (upsert)
router.post('/:districtId/stats', async (req, res) => {
  try {
    const { districtId } = req.params;
    const { population, males, females, literacy, households, adults, children, old } = req.body;
    // Check if stats already exist
    const [rows] = await pool.query('SELECT id FROM district_stats WHERE district_id = ?', [districtId]);
    if (rows.length === 0) {
      // Insert new
      await pool.query(
        'INSERT INTO district_stats (district_id, population, males, females, literacy, households, adults, children, old) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [districtId, population, males, females, literacy, households, adults, children, old]
      );
    } else {
      // Update existing
      await pool.query(
        'UPDATE district_stats SET population=?, males=?, females=?, literacy=?, households=?, adults=?, children=?, old=? WHERE district_id=?',
        [population, males, females, literacy, households, adults, children, old, districtId]
      );
    }
    // Return updated stats
    const [result] = await pool.query('SELECT * FROM district_stats WHERE district_id = ?', [districtId]);
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save district stats', details: error.message });
  }
});

module.exports = router; 