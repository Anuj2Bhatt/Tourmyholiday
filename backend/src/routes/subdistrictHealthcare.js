const express = require('express');
const router = express.Router();
const pool = require('../db');
const slugify = require('slugify');

// Get healthcare info for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [healthcare] = await pool.query(
      'SELECT * FROM subdistrict_healthcare WHERE subdistrict_id = ?',
      [subdistrictId]
    );

    if (healthcare.length === 0) {
      return res.status(404).json({ message: 'Healthcare info not found' });
    }

    // Parse JSON fields
    healthcare[0].hospitals = JSON.parse(healthcare[0].hospitals);
    healthcare[0].clinics = JSON.parse(healthcare[0].clinics);
    healthcare[0].pharmacies = JSON.parse(healthcare[0].pharmacies);
    healthcare[0].specialists = JSON.parse(healthcare[0].specialists);

    res.json(healthcare[0]);
  } catch (error) {
    console.error('Error fetching healthcare info:', error);
    res.status(500).json({ message: 'Error fetching healthcare info' });
  }
});

// Get healthcare info by slug
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [healthcare] = await pool.query(
      'SELECT * FROM subdistrict_healthcare WHERE slug = ?',
      [slug]
    );

    if (healthcare.length === 0) {
      return res.status(404).json({ message: 'Healthcare info not found' });
    }

    // Parse JSON fields
    healthcare[0].hospitals = JSON.parse(healthcare[0].hospitals);
    healthcare[0].clinics = JSON.parse(healthcare[0].clinics);
    healthcare[0].pharmacies = JSON.parse(healthcare[0].pharmacies);
    healthcare[0].specialists = JSON.parse(healthcare[0].specialists);

    res.json(healthcare[0]);
  } catch (error) {
    console.error('Error fetching healthcare info:', error);
    res.status(500).json({ message: 'Error fetching healthcare info' });
  }
});

// Add healthcare info for a subdistrict
router.post('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      hospitals,
      clinics,
      pharmacies,
      specialists,
      health_insurance,
      emergency_services,
      public_health_programs,
      medical_tourism
    } = req.body;

    // Generate slug from meta title
    const slug = slugify(meta_title || 'healthcare', { lower: true, strict: true });

    const [result] = await pool.query(
      `INSERT INTO subdistrict_healthcare (
        subdistrict_id, slug, description,
        meta_title, meta_description, meta_keywords,
        hospitals, clinics, pharmacies, specialists,
        health_insurance, emergency_services,
        public_health_programs, medical_tourism
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrictId, slug, description,
        meta_title, meta_description, meta_keywords,
        JSON.stringify(hospitals),
        JSON.stringify(clinics),
        JSON.stringify(pharmacies),
        JSON.stringify(specialists),
        health_insurance,
        emergency_services,
        public_health_programs,
        medical_tourism
      ]
    );

    const [newHealthcare] = await pool.query(
      'SELECT * FROM subdistrict_healthcare WHERE id = ?',
      [result.insertId]
    );

    // Parse JSON fields
    newHealthcare[0].hospitals = JSON.parse(newHealthcare[0].hospitals);
    newHealthcare[0].clinics = JSON.parse(newHealthcare[0].clinics);
    newHealthcare[0].pharmacies = JSON.parse(newHealthcare[0].pharmacies);
    newHealthcare[0].specialists = JSON.parse(newHealthcare[0].specialists);

    res.status(201).json(newHealthcare[0]);
  } catch (error) {
    console.error('Error adding healthcare info:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Healthcare info already exists for this subdistrict' });
    }
    res.status(500).json({ message: 'Error adding healthcare info' });
  }
});

// Update healthcare info
router.put('/:healthcareId', async (req, res) => {
  try {
    const { healthcareId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      hospitals,
      clinics,
      pharmacies,
      specialists,
      health_insurance,
      emergency_services,
      public_health_programs,
      medical_tourism
    } = req.body;

    // Generate new slug if meta title is changed
    const slug = meta_title ? slugify(meta_title, { lower: true, strict: true }) : undefined;

    await pool.query(
      `UPDATE subdistrict_healthcare SET 
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        hospitals = COALESCE(?, hospitals),
        clinics = COALESCE(?, clinics),
        pharmacies = COALESCE(?, pharmacies),
        specialists = COALESCE(?, specialists),
        health_insurance = COALESCE(?, health_insurance),
        emergency_services = COALESCE(?, emergency_services),
        public_health_programs = COALESCE(?, public_health_programs),
        medical_tourism = COALESCE(?, medical_tourism)
      WHERE id = ?`,
      [
        slug, description, meta_title, meta_description, meta_keywords,
        hospitals ? JSON.stringify(hospitals) : undefined,
        clinics ? JSON.stringify(clinics) : undefined,
        pharmacies ? JSON.stringify(pharmacies) : undefined,
        specialists ? JSON.stringify(specialists) : undefined,
        health_insurance,
        emergency_services,
        public_health_programs,
        medical_tourism,
        healthcareId
      ]
    );

    const [updatedHealthcare] = await pool.query(
      'SELECT * FROM subdistrict_healthcare WHERE id = ?',
      [healthcareId]
    );

    if (updatedHealthcare.length === 0) {
      return res.status(404).json({ message: 'Healthcare info not found' });
    }

    // Parse JSON fields
    updatedHealthcare[0].hospitals = JSON.parse(updatedHealthcare[0].hospitals);
    updatedHealthcare[0].clinics = JSON.parse(updatedHealthcare[0].clinics);
    updatedHealthcare[0].pharmacies = JSON.parse(updatedHealthcare[0].pharmacies);
    updatedHealthcare[0].specialists = JSON.parse(updatedHealthcare[0].specialists);

    res.json(updatedHealthcare[0]);
  } catch (error) {
    console.error('Error updating healthcare info:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A healthcare info with this meta title already exists' });
    }
    res.status(500).json({ message: 'Error updating healthcare info' });
  }
});

// Delete healthcare info
router.delete('/:healthcareId', async (req, res) => {
  try {
    const { healthcareId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM subdistrict_healthcare WHERE id = ?',
      [healthcareId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Healthcare info not found' });
    }

    res.json({ message: 'Healthcare info deleted successfully' });
  } catch (error) {
    console.error('Error deleting healthcare info:', error);
    res.status(500).json({ message: 'Error deleting healthcare info' });
  }
});

module.exports = router; 