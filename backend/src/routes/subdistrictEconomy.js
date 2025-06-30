const express = require('express');
const router = express.Router();
const pool = require('../../db');
const slugify = require('slugify');

// Get economy info for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [economy] = await pool.query(
      'SELECT * FROM subdistrict_economy WHERE subdistrict_id = ?',
      [subdistrictId]
    );

    if (economy.length === 0) {
      return res.status(404).json({ message: 'Economy info not found' });
    }

    // Parse JSON fields
    economy[0].major_industries = JSON.parse(economy[0].major_industries);
    economy[0].agriculture = JSON.parse(economy[0].agriculture);
    economy[0].employment = JSON.parse(economy[0].employment);
    economy[0].infrastructure = JSON.parse(economy[0].infrastructure);

    res.json(economy[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching economy info' });
  }
});

// Get economy info by slug
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [economy] = await pool.query(
      'SELECT * FROM subdistrict_economy WHERE slug = ?',
      [slug]
    );

    if (economy.length === 0) {
      return res.status(404).json({ message: 'Economy info not found' });
    }

    // Parse JSON fields
    economy[0].major_industries = JSON.parse(economy[0].major_industries);
    economy[0].agriculture = JSON.parse(economy[0].agriculture);
    economy[0].employment = JSON.parse(economy[0].employment);
    economy[0].infrastructure = JSON.parse(economy[0].infrastructure);

    res.json(economy[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching economy info' });
  }
});

// Add economy info for a subdistrict
router.post('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      gdp,
      per_capita_income,
      major_industries,
      agriculture,
      employment,
      infrastructure,
      economic_growth,
      investment_opportunities
    } = req.body;

    // Generate slug from meta title
    const slug = slugify(meta_title || 'economy', { lower: true, strict: true });

    const [result] = await pool.query(
      `INSERT INTO subdistrict_economy (
        subdistrict_id, slug, description,
        meta_title, meta_description, meta_keywords,
        gdp, per_capita_income, major_industries,
        agriculture, employment, infrastructure,
        economic_growth, investment_opportunities
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrictId, slug, description,
        meta_title, meta_description, meta_keywords,
        gdp, per_capita_income,
        JSON.stringify(major_industries),
        JSON.stringify(agriculture),
        JSON.stringify(employment),
        JSON.stringify(infrastructure),
        economic_growth,
        investment_opportunities
      ]
    );

    const [newEconomy] = await pool.query(
      'SELECT * FROM subdistrict_economy WHERE id = ?',
      [result.insertId]
    );

    // Parse JSON fields
    newEconomy[0].major_industries = JSON.parse(newEconomy[0].major_industries);
    newEconomy[0].agriculture = JSON.parse(newEconomy[0].agriculture);
    newEconomy[0].employment = JSON.parse(newEconomy[0].employment);
    newEconomy[0].infrastructure = JSON.parse(newEconomy[0].infrastructure);

    res.status(201).json(newEconomy[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Economy info already exists for this subdistrict' });
    }
    res.status(500).json({ message: 'Error adding economy info' });
  }
});

// Update economy info
router.put('/:economyId', async (req, res) => {
  try {
    const { economyId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      gdp,
      per_capita_income,
      major_industries,
      agriculture,
      employment,
      infrastructure,
      economic_growth,
      investment_opportunities
    } = req.body;

    // Generate new slug if meta title is changed
    const slug = meta_title ? slugify(meta_title, { lower: true, strict: true }) : undefined;

    await pool.query(
      `UPDATE subdistrict_economy SET 
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        gdp = COALESCE(?, gdp),
        per_capita_income = COALESCE(?, per_capita_income),
        major_industries = COALESCE(?, major_industries),
        agriculture = COALESCE(?, agriculture),
        employment = COALESCE(?, employment),
        infrastructure = COALESCE(?, infrastructure),
        economic_growth = COALESCE(?, economic_growth),
        investment_opportunities = COALESCE(?, investment_opportunities)
      WHERE id = ?`,
      [
        slug, description, meta_title, meta_description, meta_keywords,
        gdp, per_capita_income,
        major_industries ? JSON.stringify(major_industries) : undefined,
        agriculture ? JSON.stringify(agriculture) : undefined,
        employment ? JSON.stringify(employment) : undefined,
        infrastructure ? JSON.stringify(infrastructure) : undefined,
        economic_growth,
        investment_opportunities,
        economyId
      ]
    );

    const [updatedEconomy] = await pool.query(
      'SELECT * FROM subdistrict_economy WHERE id = ?',
      [economyId]
    );

    if (updatedEconomy.length === 0) {
      return res.status(404).json({ message: 'Economy info not found' });
    }

    // Parse JSON fields
    updatedEconomy[0].major_industries = JSON.parse(updatedEconomy[0].major_industries);
    updatedEconomy[0].agriculture = JSON.parse(updatedEconomy[0].agriculture);
    updatedEconomy[0].employment = JSON.parse(updatedEconomy[0].employment);
    updatedEconomy[0].infrastructure = JSON.parse(updatedEconomy[0].infrastructure);

    res.json(updatedEconomy[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'An economy info with this meta title already exists' });
    }
    res.status(500).json({ message: 'Error updating economy info' });
  }
});

// Delete economy info
router.delete('/:economyId', async (req, res) => {
  try {
    const { economyId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM subdistrict_economy WHERE id = ?',
      [economyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Economy info not found' });
    }

    res.json({ message: 'Economy info deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting economy info' });
  }
});

module.exports = router; 