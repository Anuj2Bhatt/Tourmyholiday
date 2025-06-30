const express = require('express');
const router = express.Router();
const pool = require('../../db');
const slugify = require('slugify');

// Get weather info for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [weather] = await pool.query(
      'SELECT * FROM subdistrict_weather WHERE subdistrict_id = ?',
      [subdistrictId]
    );

    if (weather.length === 0) {
      return res.status(404).json({ message: 'Weather info not found' });
    }

    res.json(weather[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weather info' });
  }
});

// Add weather info for a subdistrict
router.post('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      climate_type,
      temperature_range,
      rainfall,
      best_season
    } = req.body;

    // Generate slug from meta title
    const slug = slugify(meta_title || 'weather', { lower: true, strict: true });

    const [result] = await pool.query(
      `INSERT INTO subdistrict_weather (
        subdistrict_id, slug, description,
        meta_title, meta_description, meta_keywords,
        climate_type, temperature_range, rainfall, best_season
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrictId, slug, description,
        meta_title, meta_description, meta_keywords,
        climate_type, temperature_range, rainfall, best_season
      ]
    );

    const [newWeather] = await pool.query(
      'SELECT * FROM subdistrict_weather WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newWeather[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding weather info' });
  }
});

// Update weather info
router.put('/:weatherId', async (req, res) => {
  try {
    const { weatherId } = req.params;
    const {
      description,
      meta_title,
      meta_description,
      meta_keywords,
      climate_type,
      temperature_range,
      rainfall,
      best_season
    } = req.body;

    // Generate new slug if meta title is changed
    const slug = meta_title ? slugify(meta_title, { lower: true, strict: true }) : undefined;

    await pool.query(
      `UPDATE subdistrict_weather SET 
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        climate_type = COALESCE(?, climate_type),
        temperature_range = COALESCE(?, temperature_range),
        rainfall = COALESCE(?, rainfall),
        best_season = COALESCE(?, best_season)
      WHERE id = ?`,
      [
        slug, description, meta_title, meta_description, meta_keywords,
        climate_type, temperature_range, rainfall, best_season,
        weatherId
      ]
    );

    const [updatedWeather] = await pool.query(
      'SELECT * FROM subdistrict_weather WHERE id = ?',
      [weatherId]
    );

    if (updatedWeather.length === 0) {
      return res.status(404).json({ message: 'Weather info not found' });
    }

    res.json(updatedWeather[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating weather info' });
  }
});

// Delete weather info
router.delete('/:weatherId', async (req, res) => {
  try {
    const { weatherId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM subdistrict_weather WHERE id = ?',
      [weatherId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Weather info not found' });
    }

    res.json({ message: 'Weather info deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting weather info' });
  }
});

module.exports = router; 