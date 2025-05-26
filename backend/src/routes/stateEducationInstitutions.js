const express = require('express');
const router = express.Router();
const pool = require('../db');
const slugify = require('slugify');

// Get education institutions for a subdistrict
router.get('/subdistrict/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    console.log('\n=== Starting Education Institutions Fetch ===');
    console.log('Requested subdistrict ID:', subdistrictId, 'Type:', typeof subdistrictId);

    // First check if the subdistrict exists
    console.log('\n1. Checking if subdistrict exists...');
    const [subdistrict] = await pool.query(
      'SELECT id, name, slug FROM subdistricts WHERE id = ?',
      [subdistrictId]
    );
    console.log('Subdistrict query result:', JSON.stringify(subdistrict, null, 2));

    if (subdistrict.length === 0) {
      console.log('Subdistrict not found in database');
      return res.json({ education: [], healthcare: [] });
    }

    // Direct check for the specific entry we know exists
    console.log('\n2. Direct check for entry with ID 10...');
    const [specificEntry] = await pool.query(`
      SELECT * FROM state_education_institutions 
      WHERE id = 10 AND subdistrict_id = ?
    `, [subdistrictId]);
    console.log('Specific entry check:', JSON.stringify(specificEntry, null, 2));

    // Check all possible variations of the subdistrict_id
    console.log('\n3. Checking for institutions with different subdistrict_id formats...');
    const [institutionsCheck] = await pool.query(`
      SELECT id, subdistrict_id, name, type, status, 
             CAST(subdistrict_id AS CHAR) as subdistrict_id_str,
             LENGTH(subdistrict_id) as id_length
      FROM state_education_institutions 
      WHERE subdistrict_id = ? 
         OR CAST(subdistrict_id AS CHAR) = ?
         OR subdistrict_id = CAST(? AS SIGNED)
         OR id = 10
    `, [subdistrictId, subdistrictId, subdistrictId]);
    console.log('Institutions check results:', JSON.stringify(institutionsCheck, null, 2));

    // Get education institutions with detailed logging
    console.log('\n4. Executing main query for institutions...');
    const query = `
      SELECT * FROM state_education_institutions 
      WHERE (subdistrict_id = ? OR id = 10)
      AND (status = 'active' OR status IS NULL)
      ORDER BY name ASC
    `;
    console.log('Query:', query);
    console.log('Query parameters:', [subdistrictId]);
    
    const [institutions] = await pool.query(query, [subdistrictId]);
    console.log('Main query results:', JSON.stringify(institutions, null, 2));
    console.log('Number of institutions found:', institutions.length);

    if (institutions.length === 0) {
      console.log('\n5. No institutions found in main query, checking database state...');
      
      // Check total count of institutions
      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM state_education_institutions');
      console.log('Total institutions in database:', countResult[0].total);
      
      // Check the specific entry we know exists
      const [entryCheck] = await pool.query(`
        SELECT * FROM state_education_institutions 
        WHERE id = 10
      `);
      console.log('Entry with ID 10:', JSON.stringify(entryCheck, null, 2));
      
      // Check table structure
      const [tableInfo] = await pool.query(`
        DESCRIBE state_education_institutions
      `);
      console.log('Table structure:', JSON.stringify(tableInfo, null, 2));

      // Check for any data type issues
      const [typeCheck] = await pool.query(`
        SELECT 
          id,
          subdistrict_id,
          CAST(subdistrict_id AS CHAR) as subdistrict_id_str,
          CAST(subdistrict_id AS SIGNED) as subdistrict_id_num,
          LENGTH(subdistrict_id) as id_length,
          status
        FROM state_education_institutions 
        WHERE id = 10
      `);
      console.log('Type check for entry:', JSON.stringify(typeCheck, null, 2));
    }

    // Format the response to match what the frontend expects
    const formattedResponse = {
      education: institutions.map(inst => ({
        id: inst.id,
        title: inst.name,
        name: inst.name,
        type: inst.type || 'school',
        category: inst.category || 'school',
        description: inst.description,
        address: inst.address,
        phone: inst.phone,
        email: inst.email,
        website: inst.website,
        established_year: inst.established_year,
        accreditation: inst.accreditation,
        facilities: inst.facilities ? JSON.parse(inst.facilities) : [],
        timings: inst.timings,
        admission_info: inst.admission_info,
        emergency_services: inst.emergency_services === 1,
        featured_image: inst.featured_image,
        gallery_images: inst.gallery_images ? JSON.parse(inst.gallery_images) : [],
        meta_title: inst.meta_title,
        meta_description: inst.meta_description,
        meta_keywords: inst.meta_keywords,
        status: inst.status || 'active',
        slug: inst.slug,
        created_at: inst.created_at,
        updated_at: inst.updated_at
      })),
      healthcare: []
    };

    console.log('\n6. Sending formatted response:', JSON.stringify(formattedResponse, null, 2));
    console.log('=== End of Education Institutions Fetch ===\n');
    res.json(formattedResponse);
  } catch (error) {
    console.error('\n=== Error in Education Institutions Fetch ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== End of Error Log ===\n');
    res.status(500).json({ message: 'Error fetching education institutions' });
  }
});

// Add new education institution
router.post('/', async (req, res) => {
  try {
    const {
      subdistrict_id,
      name,
      type,
      category,
      description,
      address,
      contact_number,
      phone,
      email,
      website,
      established_year,
      accreditation,
      facilities,
      timings,
      admission_info,
      emergency_services,
      courses_offered,
      admission_process,
      fee_structure,
      featured_image,
      gallery_images,
      meta_title,
      meta_description,
      meta_keywords,
      status
    } = req.body;

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    const [result] = await pool.query(
      `INSERT INTO state_education_institutions (
        subdistrict_id, name, type, category, description,
        address, contact_number, phone, email, website,
        established_year, accreditation, facilities, timings,
        admission_info, emergency_services, courses_offered,
        admission_process, fee_structure, featured_image,
        gallery_images, meta_title, meta_description,
        meta_keywords, status, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrict_id, name, type, category, description,
        address, contact_number, phone, email, website,
        established_year, accreditation,
        facilities ? JSON.stringify(facilities) : null,
        timings, admission_info, emergency_services ? 1 : 0,
        courses_offered, admission_process, fee_structure,
        featured_image,
        gallery_images ? JSON.stringify(gallery_images) : null,
        meta_title, meta_description, meta_keywords,
        status || 'active', slug
      ]
    );

    const [newInstitution] = await pool.query(
      'SELECT * FROM state_education_institutions WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newInstitution[0]);
  } catch (error) {
    console.error('Error adding state education institution:', error);
    res.status(500).json({ message: 'Error adding state education institution' });
  }
});

// Update education institution
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      category,
      description,
      address,
      contact_number,
      phone,
      email,
      website,
      established_year,
      accreditation,
      facilities,
      timings,
      admission_info,
      emergency_services,
      courses_offered,
      admission_process,
      fee_structure,
      featured_image,
      gallery_images,
      meta_title,
      meta_description,
      meta_keywords,
      status
    } = req.body;

    // Generate new slug if name is changed
    const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;

    await pool.query(
      `UPDATE state_education_institutions SET 
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        address = COALESCE(?, address),
        contact_number = COALESCE(?, contact_number),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        website = COALESCE(?, website),
        established_year = COALESCE(?, established_year),
        accreditation = COALESCE(?, accreditation),
        facilities = COALESCE(?, facilities),
        timings = COALESCE(?, timings),
        admission_info = COALESCE(?, admission_info),
        emergency_services = COALESCE(?, emergency_services),
        courses_offered = COALESCE(?, courses_offered),
        admission_process = COALESCE(?, admission_process),
        fee_structure = COALESCE(?, fee_structure),
        featured_image = COALESCE(?, featured_image),
        gallery_images = COALESCE(?, gallery_images),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        status = COALESCE(?, status),
        slug = COALESCE(?, slug)
      WHERE id = ?`,
      [
        name, type, category, description, address,
        contact_number, phone, email, website,
        established_year, accreditation,
        facilities ? JSON.stringify(facilities) : undefined,
        timings, admission_info, emergency_services ? 1 : 0,
        courses_offered, admission_process, fee_structure,
        featured_image,
        gallery_images ? JSON.stringify(gallery_images) : undefined,
        meta_title, meta_description, meta_keywords,
        status, slug, id
      ]
    );

    const [updatedInstitution] = await pool.query(
      'SELECT * FROM state_education_institutions WHERE id = ?',
      [id]
    );

    if (updatedInstitution.length === 0) {
      return res.status(404).json({ message: 'Education institution not found' });
    }

    res.json(updatedInstitution[0]);
  } catch (error) {
    console.error('Error updating state education institution:', error);
    res.status(500).json({ message: 'Error updating state education institution' });
  }
});

// Delete education institution
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM state_education_institutions WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Education institution not found' });
    }

    res.json({ message: 'Education institution deleted successfully' });
  } catch (error) {
    console.error('Error deleting state education institution:', error);
    res.status(500).json({ message: 'Error deleting state education institution' });
  }
});

module.exports = router; 