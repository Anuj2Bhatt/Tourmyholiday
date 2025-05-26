const express = require('express');
const router = express.Router();
const pool = require('../../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save all files directly in uploads folder
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Keep original file extension
    const ext = path.extname(file.originalname);
    // Create a clean filename by removing spaces and special characters
    const cleanName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-.]/g, '')
      .toLowerCase();
    // Combine everything into final filename
    cb(null, uniqueSuffix + '-' + cleanName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`Only ${allowedExtensions.join(', ')} files are allowed`), false);
    }
    
    cb(null, true);
  }
});

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// GET all subdistricts for a territory district
router.get('/district/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    console.log('Fetching territory subdistricts for district:', districtId);

    // First check if territory district exists
    const [district] = await pool.query('SELECT id FROM territory_districts WHERE id = ?', [districtId]);
    if (district.length === 0) {
      return res.status(404).json({ error: 'Territory district not found' });
    }

    // Then fetch subdistricts
    const [subdistricts] = await pool.query(
      'SELECT * FROM territory_subdistricts WHERE territory_district_id = ? ORDER BY title ASC',
      [districtId]
    );
    
    console.log(`Found ${subdistricts.length} territory subdistricts`);
    
    // Format image paths
    const formattedSubdistricts = subdistricts.map(subdistrict => ({
      ...subdistrict,
      featured_image: subdistrict.featured_image ? 
        (subdistrict.featured_image.startsWith('http') ? 
          subdistrict.featured_image : 
          `http://localhost:5000/uploads/${path.basename(subdistrict.featured_image)}`) : 
        null
    }));
    
    res.json(formattedSubdistricts);
  } catch (error) {
    console.error('Error fetching territory subdistricts:', error);
    res.status(500).json({ error: 'Failed to fetch territory subdistricts', details: error.message });
  }
});

// GET single territory subdistrict
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [subdistricts] = await pool.query('SELECT * FROM territory_subdistricts WHERE id = ?', [id]);
    
    if (subdistricts.length === 0) {
      return res.status(404).json({ error: 'Territory subdistrict not found' });
    }
    
    // Format image path
    const subdistrict = subdistricts[0];
    if (subdistrict.featured_image) {
      subdistrict.featured_image = `http://localhost:5000/uploads/${path.basename(subdistrict.featured_image)}`;
    }
    
    res.json(subdistrict);
  } catch (error) {
    console.error('Error fetching territory subdistrict:', error);
    res.status(500).json({ error: 'Failed to fetch territory subdistrict', details: error.message });
  }
});

// GET territory subdistrict by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [subdistricts] = await pool.query('SELECT * FROM territory_subdistricts WHERE slug = ?', [slug]);
    
    if (subdistricts.length === 0) {
      return res.status(404).json({ error: 'Territory subdistrict not found' });
    }
    
    // Format image path
    const subdistrict = subdistricts[0];
    if (subdistrict.featured_image) {
      subdistrict.featured_image = `http://localhost:5000/uploads/${path.basename(subdistrict.featured_image)}`;
    }
    
    res.json(subdistrict);
  } catch (error) {
    console.error('Error fetching territory subdistrict by slug:', error);
    res.status(500).json({ error: 'Failed to fetch territory subdistrict by slug', details: error.message });
  }
});

// POST create new territory subdistrict
router.post('/', upload.single('featured_image'), async (req, res) => {
  try {
    const { 
      territory_district_id,
      title,
      description,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!territory_district_id || !title) {
      return res.status(400).json({ error: 'Territory district ID and title are required' });
    }

    // Check if territory district exists
    const [district] = await pool.query('SELECT id FROM territory_districts WHERE id = ?', [territory_district_id]);
    if (district.length === 0) {
      return res.status(404).json({ error: 'Territory district not found' });
    }

    const slug = generateSlug(title);
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO territory_subdistricts (
        territory_district_id, title, slug, description, featured_image, 
        status, meta_title, meta_description, meta_keywords,
        latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        territory_district_id, title, slug, description, imagePath,
        status || 'publish', meta_title, meta_description, meta_keywords,
        latitude || null, longitude || null
      ]
    );

    const newSubdistrict = {
      id: result.insertId,
      territory_district_id,
      title,
      slug,
      description,
      featured_image: imagePath ? `http://localhost:5000/${imagePath}` : null,
      status: status || 'publish',
      meta_title,
      meta_description,
      meta_keywords,
      latitude: latitude || null,
      longitude: longitude || null
    };

    res.status(201).json(newSubdistrict);
  } catch (error) {
    console.error('Error creating territory subdistrict:', error);
    res.status(500).json({ error: 'Failed to create territory subdistrict', details: error.message });
  }
});

// PUT update territory subdistrict
router.put('/:id', upload.single('featured_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title,
      description,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      latitude,
      longitude
    } = req.body;
    
    // Get current subdistrict data
    const [current] = await pool.query('SELECT featured_image FROM territory_subdistricts WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ error: 'Territory subdistrict not found' });
    }

    const slug = generateSlug(title);
    
    let imagePath = current[0].featured_image; // Keep existing image if no new file uploaded
    if (req.file) {
      // Delete old image if exists
      if (imagePath) {
        const oldImagePath = path.join(__dirname, '../../', imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `UPDATE territory_subdistricts SET 
        title = ?, slug = ?, description = ?, featured_image = ?, 
        status = ?, meta_title = ?, meta_description = ?, meta_keywords = ?,
        latitude = ?, longitude = ?
        WHERE id = ?`,
      [
        title, slug, description, imagePath,
        status, meta_title, meta_description, meta_keywords,
        latitude || null, longitude || null, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Territory subdistrict not found' });
    }

    const updatedSubdistrict = {
      id: parseInt(id),
      title,
      slug,
      description,
      featured_image: imagePath ? `http://localhost:5000/${imagePath}` : null,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      latitude: latitude || null,
      longitude: longitude || null
    };

    res.json(updatedSubdistrict);
  } catch (error) {
    console.error('Error updating territory subdistrict:', error);
    res.status(500).json({ error: 'Failed to update territory subdistrict', details: error.message });
  }
});

// DELETE territory subdistrict
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get subdistrict data to delete image
    const [subdistrict] = await pool.query('SELECT featured_image FROM territory_subdistricts WHERE id = ?', [id]);
    if (subdistrict.length === 0) {
      return res.status(404).json({ error: 'Territory subdistrict not found' });
    }

    // Delete image file if exists
    if (subdistrict[0].featured_image) {
      const imagePath = path.join(__dirname, '../../', subdistrict[0].featured_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete from database
    const [result] = await pool.query('DELETE FROM territory_subdistricts WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Territory subdistrict not found' });
    }

    res.json({ message: 'Territory subdistrict deleted successfully' });
  } catch (error) {
    console.error('Error deleting territory subdistrict:', error);
    res.status(500).json({ error: 'Failed to delete territory subdistrict', details: error.message });
  }
});

// Update subdistrict image path
router.patch('/:id/update-image', async (req, res) => {
  try {
    const { id } = req.params;
    const { newImagePath } = req.body;

    if (!newImagePath) {
      return res.status(400).json({ error: 'New image path is required' });
    }

    // Update the image path in the database
    const [result] = await pool.query(
      'UPDATE territory_subdistricts SET featured_image = ? WHERE id = ?',
      [newImagePath, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Territory subdistrict not found' });
    }

    // Get the updated subdistrict
    const [subdistricts] = await pool.query(
      'SELECT * FROM territory_subdistricts WHERE id = ?',
      [id]
    );

    const updatedSubdistrict = {
      ...subdistricts[0],
      featured_image: subdistricts[0].featured_image ? 
        `http://localhost:5000/${subdistricts[0].featured_image}` : 
        null
    };

    res.json(updatedSubdistrict);
  } catch (error) {
    console.error('Error updating subdistrict image path:', error);
    res.status(500).json({ error: 'Failed to update subdistrict image path', details: error.message });
  }
});

module.exports = router; 