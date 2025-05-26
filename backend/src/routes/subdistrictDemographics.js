const express = require('express');
const router = express.Router();
const pool = require('../db');
const slugify = require('slugify');

// Get demographics for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [demographics] = await pool.query(
      'SELECT * FROM subdistrict_demographics WHERE subdistrict_id = ?',
      [subdistrictId]
    );

    if (demographics.length === 0) {
      return res.status(404).json({ message: 'Demographics not found' });
    }

    res.json(demographics[0]);
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({ message: 'Error fetching demographics' });
  }
});

// Get demographics by slug
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [demographics] = await pool.query(
      'SELECT * FROM subdistrict_demographics WHERE slug = ?',
      [slug]
    );

    if (demographics.length === 0) {
      return res.status(404).json({ message: 'Demographics not found' });
    }

    res.json(demographics[0]);
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({ message: 'Error fetching demographics' });
  }
});

// Add demographics for a subdistrict
router.post('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      total_population,
      male_population,
      female_population,
      literacy_rate,
      languages,
      religions
    } = req.body;

    // Generate slug from meta title
    const slug = slugify(meta_title || 'demographics', { lower: true, strict: true });

    const [result] = await pool.query(
      `INSERT INTO subdistrict_demographics (
        subdistrict_id, slug, description,
        meta_title, meta_description, meta_keywords,
        total_population, male_population, female_population,
        literacy_rate, languages, religions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrictId, slug, description,
        meta_title, meta_description, meta_keywords,
        total_population, male_population, female_population,
        literacy_rate, JSON.stringify(languages), JSON.stringify(religions)
      ]
    );

    const [newDemographics] = await pool.query(
      'SELECT * FROM subdistrict_demographics WHERE id = ?',
      [result.insertId]
    );

    // Parse JSON fields
    newDemographics[0].languages = JSON.parse(newDemographics[0].languages);
    newDemographics[0].religions = JSON.parse(newDemographics[0].religions);

    res.status(201).json(newDemographics[0]);
  } catch (error) {
    console.error('Error adding demographics:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Demographics already exists for this subdistrict' });
    }
    res.status(500).json({ message: 'Error adding demographics' });
  }
});

// Update demographics
router.put('/:demographicsId', async (req, res) => {
  try {
    const { demographicsId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      total_population,
      male_population,
      female_population,
      literacy_rate,
      languages,
      religions
    } = req.body;

    // Generate new slug if meta title is changed
    const slug = meta_title ? slugify(meta_title, { lower: true, strict: true }) : undefined;

    await pool.query(
      `UPDATE subdistrict_demographics SET 
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        total_population = COALESCE(?, total_population),
        male_population = COALESCE(?, male_population),
        female_population = COALESCE(?, female_population),
        literacy_rate = COALESCE(?, literacy_rate),
        languages = COALESCE(?, languages),
        religions = COALESCE(?, religions)
      WHERE id = ?`,
      [
        slug, description, meta_title, meta_description, meta_keywords,
        total_population, male_population, female_population, literacy_rate,
        languages ? JSON.stringify(languages) : undefined,
        religions ? JSON.stringify(religions) : undefined,
        demographicsId
      ]
    );

    const [updatedDemographics] = await pool.query(
      'SELECT * FROM subdistrict_demographics WHERE id = ?',
      [demographicsId]
    );

    if (updatedDemographics.length === 0) {
      return res.status(404).json({ message: 'Demographics not found' });
    }

    // Parse JSON fields
    updatedDemographics[0].languages = JSON.parse(updatedDemographics[0].languages);
    updatedDemographics[0].religions = JSON.parse(updatedDemographics[0].religions);

    res.json(updatedDemographics[0]);
  } catch (error) {
    console.error('Error updating demographics:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A demographics with this meta title already exists' });
    }
    res.status(500).json({ message: 'Error updating demographics' });
  }
});

// Delete demographics
router.delete('/:demographicsId', async (req, res) => {
  try {
    const { demographicsId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM subdistrict_demographics WHERE id = ?',
      [demographicsId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Demographics not found' });
    }

    res.json({ message: 'Demographics deleted successfully' });
  } catch (error) {
    console.error('Error deleting demographics:', error);
    res.status(500).json({ message: 'Error deleting demographics' });
  }
});

module.exports = router; 