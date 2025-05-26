const express = require('express');
const router = express.Router();
const pool = require('../db');
const slugify = require('slugify');

// Get all villages for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [villages] = await pool.query(
      'SELECT * FROM villages WHERE subdistrict_id = ?',
      [subdistrictId]
    );
    res.json(villages);
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ message: 'Error fetching villages' });
  }
});

// Get village by slug
router.get('/village/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [village] = await pool.query(
      'SELECT * FROM villages WHERE slug = ?',
      [slug]
    );

    if (village.length === 0) {
      return res.status(404).json({ message: 'Village not found' });
    }

    res.json(village[0]);
  } catch (error) {
    console.error('Error fetching village:', error);
    res.status(500).json({ message: 'Error fetching village' });
  }
});

// Add a new village
router.post('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const { name, description, meta_title, meta_description, meta_keywords, population } = req.body;

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    const [result] = await pool.query(
      `INSERT INTO villages (
        subdistrict_id, name, slug, description, 
        meta_title, meta_description, meta_keywords, 
        population
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [subdistrictId, name, slug, description, meta_title, meta_description, meta_keywords, population]
    );

    const [newVillage] = await pool.query(
      'SELECT * FROM villages WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newVillage[0]);
  } catch (error) {
    console.error('Error adding village:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A village with this name already exists' });
    }
    res.status(500).json({ message: 'Error adding village' });
  }
});

// Update a village
router.put('/:villageId', async (req, res) => {
  try {
    const { villageId } = req.params;
    const { name, description, meta_title, meta_description, meta_keywords, population } = req.body;

    // Generate new slug if name is changed
    const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;

    await pool.query(
      `UPDATE villages SET 
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        population = COALESCE(?, population)
      WHERE id = ?`,
      [name, slug, description, meta_title, meta_description, meta_keywords, population, villageId]
    );

    const [updatedVillage] = await pool.query(
      'SELECT * FROM villages WHERE id = ?',
      [villageId]
    );

    if (updatedVillage.length === 0) {
      return res.status(404).json({ message: 'Village not found' });
    }

    res.json(updatedVillage[0]);
  } catch (error) {
    console.error('Error updating village:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A village with this name already exists' });
    }
    res.status(500).json({ message: 'Error updating village' });
  }
});

// Delete a village
router.delete('/:villageId', async (req, res) => {
  try {
    const { villageId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM villages WHERE id = ?',
      [villageId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Village not found' });
    }

    res.json({ message: 'Village deleted successfully' });
  } catch (error) {
    console.error('Error deleting village:', error);
    res.status(500).json({ message: 'Error deleting village' });
  }
});

module.exports = router; 