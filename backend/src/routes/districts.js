const express = require('express');
const router = express.Router();
const pool = require('../../db');
const path = require('path');
const multer = require('multer');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get districts by state name
router.get('/state/:stateName', async (req, res) => {
  try {
    const { stateName } = req.params;
    const [districts] = await pool.query(`
      SELECT d.*, s.name as state_name 
      FROM districts d
      JOIN states s ON d.state_name = s.name
      WHERE s.name = ?
      ORDER BY d.name ASC
    `, [stateName]);
    
    // Format image URLs
    const formattedDistricts = districts.map(district => ({
      ...district,
      featured_image: district.featured_image ? `http://localhost:5000/uploads/${path.basename(district.featured_image)}` : null,
      banner_image: district.banner_image ? `http://localhost:5000/uploads/${path.basename(district.banner_image)}` : null
    }));
    
    res.json(formattedDistricts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch districts', error: error.message });
  }
});

// Get district images
router.get('/:districtId/images', async (req, res) => {
  try {
    const { districtId } = req.params;
    // First check if district exists
    const [districts] = await pool.query('SELECT id FROM districts WHERE id = ?', [districtId]);
    if (districts.length === 0) {
      return res.status(404).json({ message: 'District not found' });
    }

    // Get all images for this district
    const [images] = await pool.query(`
      SELECT id, district_id,image_url, caption, created_at, alt_text
      FROM district_images 
      WHERE district_id = ? 
      ORDER BY created_at DESC
    `, [districtId]);

    // Format image URLs
    const formattedImages = images.map(image => ({
      ...image,
      image_url: image.image_url.startsWith('http') ? 
        image.image_url : 
        `http://localhost:5000/${image.image_url.replace(/^\/+/, '')}`
    }));

    res.json(formattedImages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch district images', error: error.message });
  }
});

// Upload district image
router.post('/:districtId/images', upload.single('image'), async (req, res) => {
  try {
    const { districtId } = req.params;
    const { alt_text, caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Check if district exists
    const [districts] = await pool.query('SELECT id FROM districts WHERE id = ?', [districtId]);
    if (districts.length === 0) {
      return res.status(404).json({ message: 'District not found' });
    }

    // Insert image record
    const [result] = await pool.query(`
      INSERT INTO district_images (district_id, image_url, alt_text, caption)
      VALUES (?, ?, ?, ?)
    `, [districtId, req.file.path, alt_text || null, caption || null]);

    const imageUrl = `http://localhost:5000/uploads/${path.basename(req.file.path)}`;
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        id: result.insertId,
        district_id: districtId,
        image_path: imageUrl,
        alt_text,
        caption
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
});

// Delete district image
router.delete('/:districtId/images/:imageId', async (req, res) => {
  try {
    const { districtId, imageId } = req.params;
    // Check if district exists
    const [districts] = await pool.query('SELECT id FROM districts WHERE id = ?', [districtId]);
    if (districts.length === 0) {
      return res.status(404).
      json({ message: 'District not found' });
    }

    // Get image path before deleting
    const [images] = await pool.query(
      'SELECT image_url FROM district_images WHERE id = ? AND district_id = ?',
      [imageId, districtId]
    );

    if (images.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete image record
    const [result] = await pool.query(
      'DELETE FROM district_images WHERE id = ? AND district_id = ?',
      [imageId, districtId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Image not found or could not be deleted' });
    }

    // Delete physical file
    const imagePath = images[0].image_path;
    const fs = require('fs');
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

// Delete district by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // First check if district exists
    const [districts] = await pool.query('SELECT * FROM districts WHERE id = ?', [id]);
    
    if (districts.length === 0) {
      return res.status(404).json({ message: 'District not found' });
    }

    // Delete the district (subdistricts will be deleted automatically due to ON DELETE CASCADE)
    const [result] = await pool.query('DELETE FROM districts WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'District not found or could not be deleted' });
    }

    res.json({ message: 'District deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete district', 
      error: error.message,
      sqlMessage: error.sqlMessage // Include SQL error message for debugging
    });
  }
});

// Get district by ID with stats
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Get district details
    const [districts] = await pool.query(`
      SELECT d.*, s.name as state_name 
      FROM districts d
      JOIN states s ON d.state_name = s.name
      WHERE d.id = ?
    `, [id]);

    if (districts.length === 0) {
      return res.status(404).json({ message: 'District not found' });
    }

    // Get district stats
    const [stats] = await pool.query(`
      SELECT * FROM district_stats 
      WHERE district_id = ?
    `, [id]);

    // Format district data
    const district = {
      ...districts[0],
      featured_image: districts[0].featured_image ? `http://localhost:5000/uploads/${path.basename(districts[0].featured_image)}` : null,
      banner_image: districts[0].banner_image ? `http://localhost:5000/uploads/${path.basename(districts[0].banner_image)}` : null,
      stats: stats[0] || null
    };

    res.json(district);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch district', error: error.message });
  }
});

// Get district stats
router.get('/:districtId/stats', async (req, res) => {
  try {
    const { districtId } = req.params;
    // First check if district exists
    const [districts] = await pool.query('SELECT id FROM districts WHERE id = ?', [districtId]);
    if (districts.length === 0) {
      return res.status(404).json({ message: 'District not found' });
    }

    // Get district stats
    const [stats] = await pool.query(`
      SELECT * FROM district_stats 
      WHERE district_id = ?
    `, [districtId]);

    if (stats.length === 0) {
      return res.status(404).json({ message: 'No statistics found for this district' });
    }

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch district statistics', error: error.message });
  }
});

// Get district by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    // Get district details
    const [districts] = await pool.query(`
      SELECT d.*, s.name as state_name 
      FROM districts d
      JOIN states s ON d.state_name = s.name
      WHERE d.slug = ?
    `, [slug]);

    if (districts.length === 0) {
      return res.status(404).json({ message: 'District not found' });
    }

    // Get district stats
    const [stats] = await pool.query(`
      SELECT * FROM district_stats 
      WHERE district_id = ?
    `, [districts[0].id]);

    // Format district data
    const district = {
      ...districts[0],
      featured_image: districts[0].featured_image ? `http://localhost:5000/uploads/${path.basename(districts[0].featured_image)}` : null,
      banner_image: districts[0].banner_image ? `http://localhost:5000/uploads/${path.basename(districts[0].banner_image)}` : null,
      stats: stats[0] || null
    };

    res.json(district);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch district', error: error.message });
  }
});

// Create a new district
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      state_name,
      description,
      meta_title,
      meta_description,
      meta_keywords
    } = req.body;

    // Check if state exists
    const [states] = await pool.query('SELECT id FROM states WHERE name = ?', [state_name]);
    if (states.length === 0) {
      return res.status(400).json({ message: 'State not found' });
    }

    // Insert district
    const [result] = await pool.query(`
      INSERT INTO districts (
        name, slug, state_name, description,
        meta_title, meta_description, meta_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      slug,
      state_name,
      description,
      meta_title,
      meta_description,
      meta_keywords
    ]);

    // Get the newly created district
    const [newDistrict] = await pool.query(`
      SELECT d.*, s.name as state_name 
      FROM districts d
      JOIN states s ON d.state_name = s.name
      WHERE d.id = ?
    `, [result.insertId]);

    res.status(201).json(newDistrict[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'A district with this slug already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create district', error: error.message });
    }
  }
});

module.exports = router; 