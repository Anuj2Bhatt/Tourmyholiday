const express = require('express');
const router = express.Router();
const pool = require('../db');
const slugify = require('slugify');

// Get education info for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [education] = await pool.query(
      'SELECT * FROM subdistrict_education WHERE subdistrict_id = ?',
      [subdistrictId]
    );

    if (education.length === 0) {
      return res.status(404).json({ message: 'Education info not found' });
    }

    // Parse JSON fields
    education[0].schools = JSON.parse(education[0].schools);
    education[0].colleges = JSON.parse(education[0].colleges);
    education[0].universities = JSON.parse(education[0].universities);
    education[0].vocational_institutes = JSON.parse(education[0].vocational_institutes);

    res.json(education[0]);
  } catch (error) {
    console.error('Error fetching education info:', error);
    res.status(500).json({ message: 'Error fetching education info' });
  }
});

// Get education info by slug
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [education] = await pool.query(
      'SELECT * FROM subdistrict_education WHERE slug = ?',
      [slug]
    );

    if (education.length === 0) {
      return res.status(404).json({ message: 'Education info not found' });
    }

    // Parse JSON fields
    education[0].schools = JSON.parse(education[0].schools);
    education[0].colleges = JSON.parse(education[0].colleges);
    education[0].universities = JSON.parse(education[0].universities);
    education[0].vocational_institutes = JSON.parse(education[0].vocational_institutes);

    res.json(education[0]);
  } catch (error) {
    console.error('Error fetching education info:', error);
    res.status(500).json({ message: 'Error fetching education info' });
  }
});

// Add education info for a subdistrict
router.post('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      literacy_rate,
      schools,
      colleges,
      universities,
      vocational_institutes,
      education_policies,
      scholarships,
      special_programs
    } = req.body;

    // Generate slug from meta title
    const slug = slugify(meta_title || 'education', { lower: true, strict: true });

    const [result] = await pool.query(
      `INSERT INTO subdistrict_education (
        subdistrict_id, slug, description,
        meta_title, meta_description, meta_keywords,
        literacy_rate, schools, colleges,
        universities, vocational_institutes,
        education_policies, scholarships, special_programs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrictId, slug, description,
        meta_title, meta_description, meta_keywords,
        literacy_rate,
        JSON.stringify(schools),
        JSON.stringify(colleges),
        JSON.stringify(universities),
        JSON.stringify(vocational_institutes),
        education_policies,
        scholarships,
        special_programs
      ]
    );

    const [newEducation] = await pool.query(
      'SELECT * FROM subdistrict_education WHERE id = ?',
      [result.insertId]
    );

    // Parse JSON fields
    newEducation[0].schools = JSON.parse(newEducation[0].schools);
    newEducation[0].colleges = JSON.parse(newEducation[0].colleges);
    newEducation[0].universities = JSON.parse(newEducation[0].universities);
    newEducation[0].vocational_institutes = JSON.parse(newEducation[0].vocational_institutes);

    res.status(201).json(newEducation[0]);
  } catch (error) {
    console.error('Error adding education info:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Education info already exists for this subdistrict' });
    }
    res.status(500).json({ message: 'Error adding education info' });
  }
});

// Update education info
router.put('/:educationId', async (req, res) => {
  try {
    const { educationId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      literacy_rate,
      schools,
      colleges,
      universities,
      vocational_institutes,
      education_policies,
      scholarships,
      special_programs
    } = req.body;

    // Generate new slug if meta title is changed
    const slug = meta_title ? slugify(meta_title, { lower: true, strict: true }) : undefined;

    await pool.query(
      `UPDATE subdistrict_education SET 
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        literacy_rate = COALESCE(?, literacy_rate),
        schools = COALESCE(?, schools),
        colleges = COALESCE(?, colleges),
        universities = COALESCE(?, universities),
        vocational_institutes = COALESCE(?, vocational_institutes),
        education_policies = COALESCE(?, education_policies),
        scholarships = COALESCE(?, scholarships),
        special_programs = COALESCE(?, special_programs)
      WHERE id = ?`,
      [
        slug, description, meta_title, meta_description, meta_keywords,
        literacy_rate,
        schools ? JSON.stringify(schools) : undefined,
        colleges ? JSON.stringify(colleges) : undefined,
        universities ? JSON.stringify(universities) : undefined,
        vocational_institutes ? JSON.stringify(vocational_institutes) : undefined,
        education_policies,
        scholarships,
        special_programs,
        educationId
      ]
    );

    const [updatedEducation] = await pool.query(
      'SELECT * FROM subdistrict_education WHERE id = ?',
      [educationId]
    );

    if (updatedEducation.length === 0) {
      return res.status(404).json({ message: 'Education info not found' });
    }

    // Parse JSON fields
    updatedEducation[0].schools = JSON.parse(updatedEducation[0].schools);
    updatedEducation[0].colleges = JSON.parse(updatedEducation[0].colleges);
    updatedEducation[0].universities = JSON.parse(updatedEducation[0].universities);
    updatedEducation[0].vocational_institutes = JSON.parse(updatedEducation[0].vocational_institutes);

    res.json(updatedEducation[0]);
  } catch (error) {
    console.error('Error updating education info:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'An education info with this meta title already exists' });
    }
    res.status(500).json({ message: 'Error updating education info' });
  }
});

// Delete education info
router.delete('/:educationId', async (req, res) => {
  try {
    const { educationId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM subdistrict_education WHERE id = ?',
      [educationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Education info not found' });
    }

    res.json({ message: 'Education info deleted successfully' });
  } catch (error) {
    console.error('Error deleting education info:', error);
    res.status(500).json({ message: 'Error deleting education info' });
  }
});

module.exports = router; 