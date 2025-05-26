const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/subdistricts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Helper function to format image URL
const formatImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `http://localhost:5000/uploads/subdistricts/${path.basename(imagePath)}`;
};

// Get subdistrict details by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get basic subdistrict details
    const [subdistrict] = await pool.query(
      'SELECT * FROM subdistricts WHERE slug = ?',
      [slug]
    );

    if (subdistrict.length === 0) {
      return res.status(404).json({ message: 'Subdistrict not found' });
    }

    const subdistrictId = subdistrict[0].id;

    // Get all related information
    const [
      [demographics],
      [travelInfo],
      [economy],
      [education],
      [healthcare],
      [weather],
      [images],
      [villages]
    ] = await Promise.all([
      pool.query('SELECT * FROM subdistrict_demographics WHERE subdistrict_id = ?', [subdistrictId]),
      pool.query('SELECT * FROM subdistrict_travel_info WHERE subdistrict_id = ?', [subdistrictId]),
      pool.query('SELECT * FROM subdistrict_economy WHERE subdistrict_id = ?', [subdistrictId]),
      pool.query('SELECT * FROM subdistrict_education WHERE subdistrict_id = ?', [subdistrictId]),
      pool.query('SELECT * FROM subdistrict_healthcare WHERE subdistrict_id = ?', [subdistrictId]),
      pool.query('SELECT * FROM subdistrict_weather WHERE subdistrict_id = ?', [subdistrictId]),
      pool.query('SELECT * FROM subdistrict_images WHERE subdistrict_id = ?', [subdistrictId]),
      pool.query('SELECT * FROM villages WHERE subdistrict_id = ?', [subdistrictId])
    ]);

    // Format image URLs
    const formattedImages = images.map(image => ({
      ...image,
      image_path: `http://localhost:5000/uploads/subdistricts/${image.image_path.split('/').pop()}`
    }));

    // Parse JSON fields
    const parseJsonFields = (data) => {
      if (!data) return null;
      const parsed = { ...data };
      if (data.languages) parsed.languages = JSON.parse(data.languages);
      if (data.religions) parsed.religions = JSON.parse(data.religions);
      if (data.transportation) parsed.transportation = JSON.parse(data.transportation);
      if (data.accommodation) parsed.accommodation = JSON.parse(data.accommodation);
      if (data.local_cuisine) parsed.local_cuisine = JSON.parse(data.local_cuisine);
      if (data.shopping) parsed.shopping = JSON.parse(data.shopping);
      if (data.major_industries) parsed.major_industries = JSON.parse(data.major_industries);
      if (data.agriculture) parsed.agriculture = JSON.parse(data.agriculture);
      if (data.employment) parsed.employment = JSON.parse(data.employment);
      if (data.infrastructure) parsed.infrastructure = JSON.parse(data.infrastructure);
      if (data.schools) parsed.schools = JSON.parse(data.schools);
      if (data.colleges) parsed.colleges = JSON.parse(data.colleges);
      if (data.universities) parsed.universities = JSON.parse(data.universities);
      if (data.vocational_institutes) parsed.vocational_institutes = JSON.parse(data.vocational_institutes);
      if (data.hospitals) parsed.hospitals = JSON.parse(data.hospitals);
      if (data.clinics) parsed.clinics = JSON.parse(data.clinics);
      if (data.pharmacies) parsed.pharmacies = JSON.parse(data.pharmacies);
      if (data.specialists) parsed.specialists = JSON.parse(data.specialists);
      if (data.seasonal_patterns) parsed.seasonal_patterns = JSON.parse(data.seasonal_patterns);
      if (data.monthly_temperatures) parsed.monthly_temperatures = JSON.parse(data.monthly_temperatures);
      if (data.monthly_rainfall) parsed.monthly_rainfall = JSON.parse(data.monthly_rainfall);
      if (data.natural_disasters) parsed.natural_disasters = JSON.parse(data.natural_disasters);
      return parsed;
    };

    // Combine all data
    const response = {
      ...subdistrict[0],
      demographics: parseJsonFields(demographics),
      travelInfo: parseJsonFields(travelInfo),
      economy: parseJsonFields(economy),
      education: parseJsonFields(education),
      healthcare: parseJsonFields(healthcare),
      weather: parseJsonFields(weather),
      images: formattedImages,
      villages: villages
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching subdistrict details:', error);
    res.status(500).json({ message: 'Error fetching subdistrict details' });
  }
});

// Get subdistrict images
router.get('/:slug/images', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try state subdistrict images first
    let images = await pool.query(
      'SELECT * FROM subdistrict_images WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );

    // If no images found, try territory subdistrict images
    if (images.rows.length === 0) {
      images = await pool.query(
        'SELECT * FROM territory_subdistrict_images WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }

    // Format image URLs
    const formattedImages = images.rows.map(image => ({
      ...image,
      image_path: formatImageUrl(image.image_path)
    }));

    res.json(formattedImages);
  } catch (error) {
    console.error('Error fetching subdistrict images:', error);
    res.status(500).json({ message: 'Error fetching subdistrict images' });
  }
});

// Get subdistrict villages
router.get('/:slug/villages', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try state subdistrict villages first
    let villages = await pool.query(
      'SELECT * FROM villages WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );

    // If no villages found, try territory subdistrict villages
    if (villages.rows.length === 0) {
      villages = await pool.query(
        'SELECT * FROM territory_villages WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }

    res.json(villages.rows);
  } catch (error) {
    console.error('Error fetching subdistrict villages:', error);
    res.status(500).json({ message: 'Error fetching subdistrict villages' });
  }
});

// Get subdistrict demographics
router.get('/:slug/demographics', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try state subdistrict demographics first
    let demographics = await pool.query(
      'SELECT * FROM subdistrict_demographics WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );

    // If no demographics found, try territory subdistrict demographics
    if (demographics.rows.length === 0) {
      demographics = await pool.query(
        'SELECT * FROM territory_subdistrict_demographics WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }

    res.json(demographics.rows[0] || null);
  } catch (error) {
    console.error('Error fetching subdistrict demographics:', error);
    res.status(500).json({ message: 'Error fetching subdistrict demographics' });
  }
});

// Get subdistrict attractions
router.get('/:slug/attractions', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try state subdistrict attractions first
    let attractions = await pool.query(
      'SELECT * FROM subdistrict_attractions WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );

    // If no attractions found, try territory subdistrict attractions
    if (attractions.rows.length === 0) {
      attractions = await pool.query(
        'SELECT * FROM territory_subdistrict_attractions WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }

    // Format image URLs
    const formattedAttractions = attractions.rows.map(attraction => ({
      ...attraction,
      image_path: formatImageUrl(attraction.image_path)
    }));

    res.json(formattedAttractions);
  } catch (error) {
    console.error('Error fetching subdistrict attractions:', error);
    res.status(500).json({ message: 'Error fetching subdistrict attractions' });
  }
});

// Get subdistrict culture
router.get('/:slug/culture', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try state subdistrict culture first
    let culture = await pool.query(
      'SELECT * FROM subdistrict_culture WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );

    // If no culture found, try territory subdistrict culture
    if (culture.rows.length === 0) {
      culture = await pool.query(
        'SELECT * FROM territory_subdistrict_culture WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }

    // Format image URLs
    const formattedCulture = culture.rows.map(item => ({
      ...item,
      image_paths: item.image_paths ? item.image_paths.map(path => formatImageUrl(path)) : []
    }));

    res.json(formattedCulture);
  } catch (error) {
    console.error('Error fetching subdistrict culture:', error);
    res.status(500).json({ message: 'Error fetching subdistrict culture' });
  }
});

// Get subdistrict travel info
router.get('/:slug/travel', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // First check if it's a state subdistrict
    const [stateSubdistrict] = await pool.query(
      'SELECT id FROM subdistricts WHERE slug = ?',
      [slug]
    );

    if (stateSubdistrict.length > 0) {
      // It's a state subdistrict, fetch from subdistrict_travel_info
      const [travelInfo] = await pool.query(
        'SELECT * FROM subdistrict_travel_info WHERE subdistrict_id = ?',
        [stateSubdistrict[0].id]
      );

      // Format the response
      const formattedTravelInfo = travelInfo.map(info => ({
        ...info,
        featured_image: info.featured_image ? 
          `http://localhost:5000/${info.featured_image}` : 
          null
      }));

      return res.json(formattedTravelInfo);
    }

    // If not found in state subdistricts, check territory subdistricts
    const [territorySubdistrict] = await pool.query(
      'SELECT id FROM territory_subdistricts WHERE slug = ?',
      [slug]
    );

    if (territorySubdistrict.length > 0) {
      // It's a territory subdistrict, fetch from territory_subdistrict_travel_info
      const [travelInfo] = await pool.query(
        'SELECT * FROM territory_subdistrict_travel_info WHERE territory_subdistrict_id = ?',
        [territorySubdistrict[0].id]
      );

      // Format the response
      const formattedTravelInfo = travelInfo.map(info => ({
        ...info,
        featured_image: info.featured_image ? 
          `http://localhost:5000/${info.featured_image}` : 
          null,
        transportation: JSON.parse(info.transportation || '{}'),
        accommodation: JSON.parse(info.accommodation || '{}'),
        local_cuisine: JSON.parse(info.local_cuisine || '{}'),
        travel_tips: JSON.parse(info.travel_tips || '{}')
      }));

      return res.json(formattedTravelInfo);
    }

    // If not found in either table, return 404
    return res.status(404).json({ message: 'Travel info not found' });
  } catch (error) {
    console.error('Error fetching subdistrict travel info:', error);
    res.status(500).json({ message: 'Error fetching subdistrict travel info' });
  }
});

// Get subdistrict economy
router.get('/:slug/economy', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try state subdistrict economy first
    let economy = await pool.query(
      'SELECT * FROM subdistrict_economy WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );

    // If no economy found, try territory subdistrict economy
    if (economy.rows.length === 0) {
      economy = await pool.query(
        'SELECT * FROM territory_subdistrict_economy WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }

    res.json(economy.rows[0] || null);
  } catch (error) {
    console.error('Error fetching subdistrict economy:', error);
    res.status(500).json({ message: 'Error fetching subdistrict economy' });
  }
});

// Get subdistrict education and healthcare
router.get('/:slug/education-healthcare', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try state subdistrict education and healthcare first
    let education = await pool.query(
      'SELECT * FROM subdistrict_education WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );
    let healthcare = await pool.query(
      'SELECT * FROM subdistrict_healthcare WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );

    // If no education/healthcare found, try territory subdistrict
    if (education.rows.length === 0) {
      education = await pool.query(
        'SELECT * FROM territory_subdistrict_education WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }
    if (healthcare.rows.length === 0) {
      healthcare = await pool.query(
        'SELECT * FROM territory_subdistrict_healthcare WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }

    res.json({
      education: education.rows,
      healthcare: healthcare.rows
    });
  } catch (error) {
    console.error('Error fetching subdistrict education and healthcare:', error);
    res.status(500).json({ message: 'Error fetching subdistrict education and healthcare' });
  }
});

// Get subdistrict weather
router.get('/:slug/weather', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try state subdistrict weather first
    let weather = await pool.query(
      'SELECT * FROM subdistrict_weather WHERE subdistrict_id = (SELECT id FROM subdistricts WHERE slug = $1)',
      [slug]
    );

    // If no weather found, try territory subdistrict weather
    if (weather.rows.length === 0) {
      weather = await pool.query(
        'SELECT * FROM territory_subdistrict_weather WHERE territory_subdistrict_id = (SELECT id FROM territory_subdistricts WHERE slug = $1)',
        [slug]
      );
    }

    res.json(weather.rows[0] || null);
  } catch (error) {
    console.error('Error fetching subdistrict weather:', error);
    res.status(500).json({ message: 'Error fetching subdistrict weather' });
  }
});

module.exports = router; 