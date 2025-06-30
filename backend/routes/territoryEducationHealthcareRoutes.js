const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to generate slug from title
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 60);
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 10 * 1024 * 1024 // 10MB for other fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
}).fields([
  { name: 'featured_image', maxCount: 1 }
]);

// Get all education & healthcare institutions for a territory subdistrict
router.get('/subdistrict/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    // Check if tables exist
    const [tables] = await pool.query('SHOW TABLES LIKE "territory_subdistrict_education"');
    const [healthcareTables] = await pool.query('SHOW TABLES LIKE "territory_subdistrict_healthcare"');
    // Fetch both education and healthcare institutions
    const [educationInstitutions] = await pool.query(
      `SELECT * FROM territory_subdistrict_education WHERE territory_subdistrict_id = ?`,
      [subdistrictId]
    );
    const [healthcareInstitutions] = await pool.query(
      `SELECT * FROM territory_subdistrict_healthcare WHERE territory_subdistrict_id = ?`,
      [subdistrictId]
    );
    // Format the results
    const education = educationInstitutions.map(inst => ({
      ...inst,
      facilities: JSON.parse(inst.facilities || '[]'),
      emergency_services: inst.emergency_services === 1
    }));

    const healthcare = healthcareInstitutions.map(inst => ({
      ...inst,
      facilities: JSON.parse(inst.facilities || '[]'),
      emergency_services: inst.emergency_services === 1
    }));

    res.json({ education, healthcare });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institutions' });
  }
});

// Create new education/healthcare institution
router.post('/', upload, async (req, res) => {
  try {
    const {
      territory_subdistrict_id,
      title,
      type,
      category,
      description,
      address,
      phone,
      email,
      website,
      facilities,
      timings,
      admission_info,
      emergency_services,
      meta_title,
      meta_description,
      meta_keywords,
      status
    } = req.body;

    if (!territory_subdistrict_id) {
      return res.status(400).json({ message: 'Territory subdistrict ID is required' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const table = type === 'education' ? 'territory_subdistrict_education' : 'territory_subdistrict_healthcare';
    const slug = generateSlug(title);

    const [result] = await pool.query(
      `INSERT INTO ${table} (
        territory_subdistrict_id,
        title,
        slug,
        type,
        category,
        description,
        address,
        phone,
        email,
        website,
        facilities,
        timings,
        admission_info,
        emergency_services,
        featured_image,
        meta_title,
        meta_description,
        meta_keywords,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        territory_subdistrict_id,
        title,
        slug,
        type || 'school',
        category,
        description,
        address,
        phone,
        email,
        website,
        JSON.stringify(facilities || []),
        timings,
        admission_info,
        emergency_services === 'true',
        req.files?.featured_image?.[0]?.filename || null,
        meta_title,
        meta_description,
        meta_keywords,
        status || 'active'
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: `${type === 'education' ? 'Education' : 'Healthcare'} institution created successfully`,
      data: {
        title,
        slug,
        type: type || 'school'
      }
    });
  } catch (error) {
    if (req.files?.featured_image?.[0]) {
      fs.unlinkSync(path.join(__dirname, '..', 'uploads', req.files.featured_image[0].filename));
    }
    res.status(500).json({ 
      message: 'Error creating institution', 
      error: error.message,
      details: error.sqlMessage 
    });
  }
});

// Update institution
router.put('/:id', upload, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      category,
      description,
      address,
      phone,
      email,
      website,
      facilities,
      timings,
      admission_info,
      emergency_services,
      meta_title,
      meta_description,
      meta_keywords,
      status
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const table = type === 'education' ? 'territory_subdistrict_education' : 'territory_subdistrict_healthcare';
    const slug = generateSlug(title);

    // Get current institution to check for existing image
    const [current] = await pool.query(
      `SELECT featured_image FROM ${table} WHERE id = ?`,
      [id]
    );

    if (current.length === 0) {
      if (req.files?.featured_image?.[0]) {
        fs.unlinkSync(path.join(__dirname, '..', 'uploads', req.files.featured_image[0].filename));
      }
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Only delete old image if a new one is uploaded
    if (req.files?.featured_image?.[0] && current[0].featured_image && current[0].featured_image !== req.body.existing_featured_image) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', current[0].featured_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await pool.query(
      `UPDATE ${table} SET 
        title = ?,
        slug = ?,
        type = ?,
        category = ?,
        description = ?,
        address = ?,
        phone = ?,
        email = ?,
        website = ?,
        facilities = ?,
        timings = ?,
        admission_info = ?,
        emergency_services = ?,
        featured_image = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        status = ?
      WHERE id = ?`,
      [
        title,
        slug,
        type || 'school',
        category,
        description,
        address,
        phone,
        email,
        website,
        JSON.stringify(facilities || []),
        timings,
        admission_info,
        emergency_services === 'true',
        req.files?.featured_image?.[0]?.filename || req.body.existing_featured_image || null,
        meta_title,
        meta_description,
        meta_keywords,
        status || 'active',
        id
      ]
    );

    res.json({ 
      message: 'Institution updated successfully',
      data: {
        title,
        slug,
        type: type || 'school'
      }
    });
  } catch (error) {
    if (req.files?.featured_image?.[0]) {
      fs.unlinkSync(path.join(__dirname, '..', 'uploads', req.files.featured_image[0].filename));
    }
    res.status(500).json({ 
      message: 'Error updating institution', 
      error: error.message,
      details: error.sqlMessage 
    });
  }
});

// Delete institution
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!type || !['education', 'healthcare'].includes(type)) {
      return res.status(400).json({ message: 'Invalid institution type' });
    }

    const table = type === 'education' ? 'territory_subdistrict_education' : 'territory_subdistrict_healthcare';

    // Get institution to delete its image
    const [institution] = await pool.query(
      `SELECT featured_image FROM ${table} WHERE id = ?`,
      [id]
    );

    if (institution.length === 0) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Delete the image file if it exists
    if (institution[0].featured_image) {
      const imagePath = path.join(__dirname, '..', 'uploads', institution[0].featured_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting institution' });
  }
});

module.exports = router; 