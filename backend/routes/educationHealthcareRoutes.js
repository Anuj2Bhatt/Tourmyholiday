const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

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

// Create multer instance with specific field configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 10 * 1024 * 1024 // 10MB for other fields
  },
  fileFilter: (req, file, cb) => {
    // Accept any file that has an image mimetype
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
}).fields([
  { name: 'featured_image', maxCount: 1 },
  { name: 'subdistrict_id', maxCount: 1 },
  { name: 'territory_subdistrict_id', maxCount: 1 },
  { name: 'title', maxCount: 1 },
  { name: 'slug', maxCount: 1 },
  { name: 'type', maxCount: 1 },
  { name: 'category', maxCount: 1 },
  { name: 'description', maxCount: 1 },
  { name: 'address', maxCount: 1 },
  { name: 'phone', maxCount: 1 },
  { name: 'email', maxCount: 1 },
  { name: 'website', maxCount: 1 },
  { name: 'facilities', maxCount: 1 },
  { name: 'timings', maxCount: 1 },
  { name: 'admission_info', maxCount: 1 },
  { name: 'emergency_services', maxCount: 1 },
  { name: 'meta_title', maxCount: 1 },
  { name: 'meta_description', maxCount: 1 },
  { name: 'meta_keywords', maxCount: 1 }
]);

// Root GET route
router.get('/', async (req, res) => {
  try {
    const isTerritory = req.originalUrl.includes('territory-education-healthcare');
    const educationTable = isTerritory ? 'territory_education_institutions' : 'state_education_institutions';
    const healthcareTable = isTerritory ? 'territory_healthcare_institutions' : 'state_healthcare_institutions';

    const [education] = await pool.query(`SELECT * FROM ${educationTable}`);
    const [healthcare] = await pool.query(`SELECT * FROM ${healthcareTable}`);

    // Format the results
    const result = {
      education: education.map(inst => ({
        ...inst,
        facilities: JSON.parse(inst.facilities || '[]'),
        emergency_services: inst.emergency_services === 1
      })),
      healthcare: healthcare.map(inst => ({
        ...inst,
        facilities: JSON.parse(inst.facilities || '[]'),
        emergency_services: inst.emergency_services === 1
      }))
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching all institutions:', error);
    res.status(500).json({ message: 'Error fetching institutions' });
  }
});

// Get all education & healthcare institutions for a subdistrict
router.get('/subdistrict/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const isTerritory = req.originalUrl.includes('territory-education-healthcare');
    const idField = isTerritory ? 'territory_subdistrict_id' : 'subdistrict_id';
    const educationTable = isTerritory ? 'territory_subdistrict_education' : 'education_institutions';
    const healthcareTable = isTerritory ? 'territory_subdistrict_healthcare' : 'healthcare_institutions';

    const [education] = await pool.query(
      `SELECT * FROM ${educationTable} WHERE ${idField} = ?`,
      [subdistrictId]
    );
    const [healthcare] = await pool.query(
      `SELECT * FROM ${healthcareTable} WHERE ${idField} = ?`,
      [subdistrictId]
    );

    // Format the results
    const result = {
      education: education.map(inst => ({
        ...inst,
        facilities: JSON.parse(inst.facilities || '[]'),
        emergency_services: inst.emergency_services === 1
      })),
      healthcare: healthcare.map(inst => ({
        ...inst,
        facilities: JSON.parse(inst.facilities || '[]'),
        emergency_services: inst.emergency_services === 1
      }))
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ message: 'Error fetching institutions' });
  }
});

// Create new education/healthcare institution
router.post('/', upload, async (req, res) => {
  try {
    // Debug: Log request body and files
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const {
      subdistrict_id,
      territory_subdistrict_id,
      title,
      type,
      category,
      description,
      address,
      phone,
      email,
      website,
      established_year,
      accreditation,
      facilities,
      courses_offered,
      admission_process,
      fee_structure,
      timings,
      admission_info,
      emergency_services,
      meta_title,
      meta_description,
      meta_keywords,
      status
    } = req.body;

    // Determine if this is a territory subdistrict based on the request path
    const isTerritory = req.originalUrl.includes('territory-education-healthcare');
    const idField = isTerritory ? 'territory_subdistrict_id' : 'subdistrict_id';
    const idValue = isTerritory ? territory_subdistrict_id : subdistrict_id;

    if (!idValue) {
      return res.status(400).json({ message: `${isTerritory ? 'Territory subdistrict' : 'Subdistrict'} ID is required` });
    }

    // Get state_name through districts table for state institutions
    let stateName = null;
    let districtId = null;
    if (!isTerritory) {
      const [subdistrict] = await pool.query(
        `SELECT d.id as district_id, d.state_name, d.district_type 
         FROM subdistricts s 
         JOIN districts d ON s.district_id = d.id 
         WHERE s.id = ?`,
        [subdistrict_id]
      );
      
      if (subdistrict.length === 0) {
        return res.status(400).json({ 
          message: 'Invalid subdistrict ID',
          field: 'subdistrict_id'
        });
      }

      // Only proceed if it's a state district
      if (subdistrict[0].district_type !== 'state') {
        return res.status(400).json({ 
          message: 'This subdistrict does not belong to a state district',
          field: 'subdistrict_id'
        });
      }
      
      stateName = subdistrict[0].state_name;
      districtId = subdistrict[0].district_id;

      // Verify state exists
      const [state] = await pool.query(
        'SELECT name FROM states WHERE name = ?',
        [stateName]
      );

      if (state.length === 0) {
        return res.status(400).json({ 
          message: 'Invalid state name',
          field: 'state_name'
        });
      }
    }

    // Validate title field
    if (!title) {
      return res.status(400).json({ 
        message: 'Title is required',
        field: 'title'
      });
    }

    const table = type === 'education' ? 
      (isTerritory ? 'territory_subdistrict_education' : 'education_institutions') : 
      (isTerritory ? 'territory_subdistrict_healthcare' : 'healthcare_institutions');

    // Use title as name for both cases
    const nameField = 'name';
    const nameValue = title;

    // Define all possible fields
    const allFields = [
      idField,
      ...(isTerritory ? [] : ['district_id', 'state_name']), // Add district_id and state_name for state institutions
      nameField,
      'slug',
      'type',
      'category',
      'description',
      'address',
      'phone',
      'email',
      'website',
      'established_year',
      'accreditation',
      'facilities',
      'courses_offered',
      'admission_process',
      'fee_structure',
      'timings',
      'admission_info',
      'emergency_services',
      'featured_image',
      'meta_title',
      'meta_description',
      'meta_keywords',
      'status'
    ];

    // Filter out fields that don't exist in territory table
    const fields = isTerritory ? 
      allFields.filter(field => !['established_year', 'accreditation', 'courses_offered', 'admission_process', 'fee_structure'].includes(field)) :
      allFields;

    // Generate slug from title
    const slugValue = req.body.slug || generateSlug(title);

    // Prepare values array with all fields
    const values = [
      idValue,
      ...(isTerritory ? [] : [districtId, stateName]), // Use districtId and stateName from districts table
      nameValue,
      slugValue,
      type || 'school',
      category,
      description,
      address,
      phone,
      email,
      website,
      established_year,
      accreditation,
      JSON.stringify(facilities || []),
      courses_offered,
      admission_process,
      fee_structure,
      timings,
      admission_info,
      emergency_services === 'true',
      req.files?.featured_image?.[0]?.filename || null,
      meta_title,
      meta_description,
      meta_keywords,
      status || 'active'
    ].filter((_, index) => fields.includes(allFields[index]));

    const placeholders = values.map(() => '?').join(', ');

    const [result] = await pool.query(
      `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.status(201).json({
      id: result.insertId,
      message: `${type === 'education' ? 'Education' : 'Healthcare'} institution created successfully`,
      data: {
        name: nameValue,
        slug: slugValue,
        type: type || 'school',
        state_name: !isTerritory ? stateName : undefined,
        district_type: !isTerritory ? 'state' : 'territory'
      }
    });
  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.files?.featured_image?.[0]) {
      fs.unlinkSync(path.join(__dirname, '..', 'uploads', req.files.featured_image[0].filename));
    }
    console.error('Error creating institution:', error);
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
    const isTerritory = req.originalUrl.includes('territory-education-healthcare');
    const {
      subdistrict_id, // Add subdistrict_id for state institutions
      title,
      slug,
      type,
      category,
      description,
      address,
      phone,
      email,
      website,
      established_year,
      accreditation,
      facilities,
      courses_offered,
      admission_process,
      fee_structure,
      timings,
      admission_info,
      emergency_services,
      meta_title,
      meta_description,
      meta_keywords,
      status
    } = req.body;

    // Get state_name through districts table for state institutions
    let stateName = null;
    if (!isTerritory && subdistrict_id) {
      const [subdistrict] = await pool.query(
        `SELECT d.state_name, d.district_type 
         FROM subdistricts s 
         JOIN districts d ON s.district_id = d.id 
         WHERE s.id = ?`,
        [subdistrict_id]
      );
      
      if (subdistrict.length === 0) {
        return res.status(400).json({ 
          message: 'Invalid subdistrict ID',
          field: 'subdistrict_id'
        });
      }
      
      stateName = subdistrict[0].state_name;

      // Verify state exists
      const [state] = await pool.query(
        'SELECT name FROM states WHERE name = ?',
        [stateName]
      );

      if (state.length === 0) {
        return res.status(400).json({ 
          message: 'Invalid state name',
          field: 'state_name'
        });
      }
    }

    // Validate title field
    if (!title) {
      return res.status(400).json({ 
        message: 'Title is required',
        field: 'title'
      });
    }

    const table = type === 'education' ? 
      (isTerritory ? 'territory_subdistrict_education' : 'education_institutions') : 
      (isTerritory ? 'territory_subdistrict_healthcare' : 'healthcare_institutions');

    // Use title as name for both cases
    const nameField = 'name';
    const nameValue = title;

    // Generate slug from title if not provided
    const slugValue = slug || generateSlug(title);

    // Define all possible fields
    const allFields = [
      ...(isTerritory ? [] : ['state_name']), // Add state_name only for state institutions
      'name',
      'slug',
      'type',
      'category',
      'description',
      'address',
      'phone',
      'email',
      'website',
      'established_year',
      'accreditation',
      'facilities',
      'courses_offered',
      'admission_process',
      'fee_structure',
      'timings',
      'admission_info',
      'emergency_services',
      'featured_image',
      'meta_title',
      'meta_description',
      'meta_keywords',
      'status'
    ];

    // Filter out fields that don't exist in territory table
    const fields = isTerritory ? 
      allFields.filter(field => !['established_year', 'accreditation', 'courses_offered', 'admission_process', 'fee_structure'].includes(field)) :
      allFields;

    // Prepare values array with all fields
    const values = [
      ...(isTerritory ? [] : [stateName]), // Use stateName from districts table
      nameValue,
      slugValue,
      type || 'school',
      category,
      description,
      address,
      phone,
      email,
      website,
      established_year,
      accreditation,
      JSON.stringify(facilities || []),
      courses_offered,
      admission_process,
      fee_structure,
      timings,
      admission_info,
      emergency_services === 'true',
      req.files?.featured_image?.[0]?.filename || req.body.existing_featured_image || null, // Use existing image if no new one uploaded
      meta_title,
      meta_description,
      meta_keywords,
      status || 'active'
    ].filter((_, index) => fields.includes(allFields[index]));

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

    // Construct the SET clause properly
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const updateQuery = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    
    // Add the id to the values array for the WHERE clause
    values.push(id);

    console.log('Update query:', updateQuery);
    console.log('Values:', values);

    await pool.query(updateQuery, values);

    res.json({ 
      message: 'Institution updated successfully',
      data: {
        name: nameValue,
        slug: slugValue,
        type: type || 'school',
        state_name: !isTerritory ? stateName : undefined
      }
    });
  } catch (error) {
    if (req.files?.featured_image?.[0]) {
      fs.unlinkSync(path.join(__dirname, '..', 'uploads', req.files.featured_image[0].filename));
    }
    console.error('Error updating institution:', error);
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
    const isTerritory = req.originalUrl.includes('territory-education-healthcare');

    if (!type || !['education', 'healthcare'].includes(type)) {
      return res.status(400).json({ message: 'Invalid institution type' });
    }

    const table = type === 'education' ? 
      (isTerritory ? 'territory_education_institutions' : 'state_education_institutions') : 
      (isTerritory ? 'territory_healthcare_institutions' : 'state_healthcare_institutions');

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
    console.error('Error deleting institution:', error);
    res.status(500).json({ message: 'Error deleting institution' });
  }
});

module.exports = router; 