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

// GET all subdistricts for a district
router.get('/district/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    // First check if district exists
    const [district] = await pool.query('SELECT id FROM districts WHERE id = ?', [districtId]);
    if (district.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    // Then fetch subdistricts
    const [subdistricts] = await pool.query(
      'SELECT * FROM subdistricts WHERE district_id = ? ORDER BY title ASC',
      [districtId]
    );
    
    // Format image paths
    const formattedSubdistricts = subdistricts.map(subdistrict => ({
      ...subdistrict,
      featured_image: subdistrict.featured_image ? 
        `${process.env.API_BASE_URL || 'http://localhost:5000'}/${subdistrict.featured_image}` : 
        null
    }));
    
    res.json(formattedSubdistricts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subdistricts' });
  }
});

// GET single subdistrict
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [subdistricts] = await pool.query('SELECT * FROM subdistricts WHERE id = ?', [id]);
    
    if (subdistricts.length === 0) {
      return res.status(404).json({ error: 'Subdistrict not found' });
    }
    
    // Format image path
    const subdistrict = subdistricts[0];
    if (subdistrict.featured_image) {
      subdistrict.featured_image = `${process.env.API_BASE_URL || 'http://localhost:5000'}/${subdistrict.featured_image}`;
    }
    
    res.json(subdistrict);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subdistrict', details: error.message });
  }
});

// GET subdistrict by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [subdistricts] = await pool.query('SELECT * FROM subdistricts WHERE slug = ?', [slug]);
    
    if (subdistricts.length === 0) {
      return res.status(404).json({ error: 'Subdistrict not found' });
    }
    
    // Format image path
    const subdistrict = subdistricts[0];
    if (subdistrict.featured_image) {
      subdistrict.featured_image = `${process.env.API_BASE_URL || 'http://localhost:5000'}/${subdistrict.featured_image}`;
    }
    
    res.json(subdistrict);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subdistrict', details: error.message });
  }
});

// POST create new subdistrict
router.post('/', upload.single('featured_image'), async (req, res) => {
  try {
    const { 
      district_id,
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
    if (!district_id || !title) {
      return res.status(400).json({ error: 'District ID and title are required' });
    }

    // Check if district exists
    const [district] = await pool.query('SELECT id FROM districts WHERE id = ?', [district_id]);
    if (district.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    const slug = generateSlug(title);
    const imagePath = req.file ? `uploads/${path.basename(req.file.filename)}` : null;

    const [result] = await pool.query(
      `INSERT INTO subdistricts (
        district_id, title, slug, description, featured_image, 
        status, meta_title, meta_description, meta_keywords,
        latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        district_id, title, slug, description, imagePath,
        status || 'publish', meta_title, meta_description, meta_keywords,
        latitude || null, longitude || null
      ]
    );

    const newSubdistrict = {
      id: result.insertId,
      district_id,
      title,
      slug,
      description,
      featured_image: imagePath ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/${imagePath}` : null,
      status: status || 'publish',
      meta_title,
      meta_description,
      meta_keywords,
      latitude: latitude || null,
      longitude: longitude || null
    };

    res.status(201).json(newSubdistrict);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subdistrict' });
  }
});

// PUT update subdistrict
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
    
    // Log request body
    
    // Get current subdistrict data
    const [current] = await pool.query('SELECT featured_image FROM subdistricts WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ error: 'Subdistrict not found' });
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
      imagePath = `uploads/${path.basename(req.file.filename)}`;
    }

    // Log the values before query
    const [result] = await pool.query(
      `UPDATE subdistricts SET 
        title = ?, slug = ?, description = ?, featured_image = ?, 
        status = ?, meta_title = ?, meta_description = ?, meta_keywords = ?,
        latitude = ?, longitude = ?
        WHERE id = ?`,
      [
        title, slug, description, imagePath,
        status, meta_title, meta_description, meta_keywords,
        latitude ? parseFloat(latitude) : null, 
        longitude ? parseFloat(longitude) : null, 
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subdistrict not found' });
    }

    const updatedSubdistrict = {
      id: parseInt(id),
      title,
      slug,
      description,
      featured_image: imagePath ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/${imagePath}` : null,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null
    };

    res.json(updatedSubdistrict);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update subdistrict',
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

// DELETE subdistrict
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get subdistrict data to delete image
    const [subdistrict] = await pool.query('SELECT featured_image FROM subdistricts WHERE id = ?', [id]);
    if (subdistrict.length === 0) {
      return res.status(404).json({ error: 'Subdistrict not found' });
    }

    // Delete image file if exists
    if (subdistrict[0].featured_image) {
      const imagePath = path.join(__dirname, '../../', subdistrict[0].featured_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete from database
    const [result] = await pool.query('DELETE FROM subdistricts WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subdistrict not found' });
    }

    res.json({ message: 'Subdistrict deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subdistrict', details: error.message });
  }
});

module.exports = router; 