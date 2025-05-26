const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pool = require('../config/database');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads')); // Save directly in uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to handle image uploads
const handleImageUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const imagePaths = req.files.map(file => {
      // Save path directly in weather folder
      const relativePath = path.join('weather', file.filename);
      return relativePath.replace(/\\/g, '/'); // Convert Windows paths to URL format
    });

    req.body.images = JSON.stringify(imagePaths);
    next();
  } catch (error) {
    console.error('Error handling image upload:', error);
    res.status(500).json({ error: 'Error uploading images' });
  }
};

// Helper function to delete old images
const deleteOldImages = async (images) => {
  if (!images) return;
  
  try {
    const imagePaths = JSON.parse(images);
    imagePaths.forEach(imagePath => {
      const fullPath = path.join(__dirname, '../../uploads', imagePath);
      if (fs.access(fullPath).then(() => true).catch(() => false)) {
        fs.unlink(fullPath);
      }
    });
  } catch (error) {
    console.error('Error deleting old images:', error);
  }
};

// Get weather data for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    // First try regular subdistricts table
    let [subdistrict] = await pool.query(
      'SELECT latitude, longitude FROM subdistricts WHERE id = ?',
      [req.params.subdistrictId]
    );

    // If not found in regular subdistricts, try territory subdistricts
    if (!subdistrict || subdistrict.length === 0) {
      [subdistrict] = await pool.query(
        'SELECT latitude, longitude FROM territory_subdistricts WHERE id = ?',
        [req.params.subdistrictId]
      );
    }

    if (!subdistrict || subdistrict.length === 0) {
      return res.status(404).json({ error: 'Subdistrict not found' });
    }

    const { latitude, longitude } = subdistrict[0];

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Subdistrict coordinates not set' });
    }

    // Fetch weather data from Tomorrow.io API
    const apiKey = process.env.TOMORROW_API_KEY;
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${latitude},${longitude}&apikey=${apiKey}`;
    console.log('Fetching weather from URL:', url);
    const weatherResponse = await axios.get(url);
    console.log('Full API Response:', JSON.stringify(weatherResponse.data, null, 2));
    const data = weatherResponse.data;
    if (!data || !data.data || !data.data.values) {
      console.log('Invalid data structure received:', {
        hasData: !!data,
        hasDataData: !!(data && data.data),
        hasValues: !!(data && data.data && data.data.values)
      });
      throw new Error('Invalid weather data received from API');
    }

    const current = data.data.values;
    if (!current) {
      console.log('No weather values found in current interval');
      throw new Error('No weather data available');
    }

    // Format current weather
    const currentWeather = {
      temperature: current.temperature,
      humidity: current.humidity,
      wind_speed: current.windSpeed,
      rainIntensity: current.rainIntensity,
      precipitationProbability: current.precipitationProbability,
      weatherCode: current.weatherCode,
      time: data.data.time
    };

    res.json({
      current: currentWeather
    });
  } catch (error) {
    console.error('Error fetching weather data:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching weather data',
      details: error.message 
    });
  }
});

// GET weather alerts for a subdistrict
router.get('/alerts/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [alerts] = await pool.query(
      'SELECT * FROM weather_alerts WHERE subdistrict_id = ? ORDER BY start_date DESC',
      [subdistrictId]
    );
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

// GET seasonal guides for a subdistrict
router.get('/seasonal-guides/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [guides] = await pool.query(
      'SELECT * FROM seasonal_guides WHERE subdistrict_id = ? ORDER BY month ASC',
      [subdistrictId]
    );
    res.json(guides);
  } catch (error) {
    console.error('Error fetching seasonal guides:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal guides' });
  }
});

// GET weather statistics for a subdistrict
router.get('/statistics/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [stats] = await pool.query(
      'SELECT * FROM weather_statistics WHERE subdistrict_id = ? ORDER BY month ASC',
      [subdistrictId]
    );
    res.json(stats);
  } catch (error) {
    console.error('Error fetching weather statistics:', error);
    res.status(500).json({ error: 'Failed to fetch weather statistics' });
  }
});

// GET tourist features for a subdistrict
router.get('/tourist-features/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [features] = await pool.query(
      'SELECT * FROM tourist_features WHERE subdistrict_id = ?',
      [subdistrictId]
    );
    res.json(features);
  } catch (error) {
    console.error('Error fetching tourist features:', error);
    res.status(500).json({ error: 'Failed to fetch tourist features' });
  }
});

// GET weather activities for a subdistrict
router.get('/activities/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [activities] = await pool.query(
      'SELECT * FROM weather_activities WHERE subdistrict_id = ?',
      [subdistrictId]
    );
    res.json(activities);
  } catch (error) {
    console.error('Error fetching weather activities:', error);
    res.status(500).json({ error: 'Failed to fetch weather activities' });
  }
});

// POST new weather alert with images
router.post('/alerts', upload.array('images', 5), handleImageUpload, async (req, res) => {
  try {
    const { 
      subdistrict_id,
      type,
      severity,
      title,
      description,
      detailed_description,
      start_date,
      end_date,
      affected_areas,
      safety_instructions,
      emergency_contacts
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO weather_alerts (
        subdistrict_id, type, severity, title, description,
        detailed_description, alert_images, start_date, end_date,
        affected_areas, safety_instructions, emergency_contacts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrict_id, type, severity, title, description,
        detailed_description, req.body.images, start_date, end_date,
        JSON.stringify(affected_areas), safety_instructions,
        JSON.stringify(emergency_contacts)
      ]
    );

    res.status(201).json({
      id: result.insertId,
      subdistrict_id,
      type,
      severity,
      title,
      description,
      detailed_description,
      alert_images: JSON.parse(req.body.images),
      start_date,
      end_date,
      affected_areas: JSON.parse(affected_areas),
      safety_instructions,
      emergency_contacts: JSON.parse(emergency_contacts)
    });
  } catch (error) {
    console.error('Error creating weather alert:', error);
    res.status(500).json({ error: 'Failed to create weather alert' });
  }
});

// POST new seasonal guide with images
router.post('/seasonal-guides', upload.array('images', 10), async (req, res) => {
  try {
    const { 
      subdistrict_id,
      month,
      temperature_range,
      rainfall,
      activities,
      detailed_description,
      packing_suggestions,
      things_to_carry,
      best_time,
      local_events,
      seasonal_food,
      seasonal_attractions,
      travel_tips
    } = req.body;

    // Validate required fields
    if (!subdistrict_id || !month || !temperature_range || !rainfall) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert the seasonal guide
      const [result] = await connection.query(
        `INSERT INTO seasonal_guides (
          subdistrict_id, month, temperature_range, rainfall,
          activities, detailed_description, packing_suggestions,
          things_to_carry, best_time, local_events, seasonal_food,
          seasonal_attractions, travel_tips
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subdistrict_id, month, temperature_range, rainfall,
          activities, detailed_description, packing_suggestions,
          JSON.stringify(things_to_carry || []), best_time, local_events,
          seasonal_food, seasonal_attractions, travel_tips
        ]
      );

      const guideId = result.insertId;

      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        const imageValues = req.files.map((file, index) => [
          guideId,
          file.filename,
          req.body.alt_texts?.[index] || ''
        ]);

        // Insert images into seasonal_guide_images table
        await connection.query(
          `INSERT INTO seasonal_guide_images (guide_id, image_path, alt_text)
           VALUES ?`,
          [imageValues]
        );
      }

      await connection.commit();

      // Fetch the created guide with its images
      const [guide] = await connection.query(
        `SELECT g.*, GROUP_CONCAT(i.image_path) as images
         FROM seasonal_guides g
         LEFT JOIN seasonal_guide_images i ON g.id = i.guide_id
         WHERE g.id = ?
         GROUP BY g.id`,
        [guideId]
      );

      res.status(201).json({
        message: 'Seasonal guide created successfully',
        guide: {
          ...guide[0],
          images: guide[0].images ? guide[0].images.split(',') : []
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating seasonal guide:', error);
    res.status(500).json({ error: 'Failed to create seasonal guide' });
  }
});

// POST new tourist feature with images
router.post('/tourist-features', upload.array('images', 5), handleImageUpload, async (req, res) => {
  try {
    const {
      subdistrict_id,
      feature_type,
      title,
      description,
      detailed_description,
      best_time,
      recommendations,
      things_to_carry,
      entry_fee,
      timings,
      location_details,
      how_to_reach,
      nearby_attractions
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO tourist_features (
        subdistrict_id, feature_type, title, description,
        detailed_description, feature_images, best_time, recommendations,
        things_to_carry, entry_fee, timings, location_details,
        how_to_reach, nearby_attractions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrict_id, feature_type, title, description,
        detailed_description, req.body.images, best_time, recommendations,
        JSON.stringify(things_to_carry), entry_fee, timings,
        location_details, how_to_reach, nearby_attractions
      ]
    );

    res.status(201).json({
      id: result.insertId,
      subdistrict_id,
      feature_type,
      title,
      description,
      detailed_description,
      feature_images: JSON.parse(req.body.images),
      best_time,
      recommendations,
      things_to_carry: JSON.parse(things_to_carry),
      entry_fee,
      timings,
      location_details,
      how_to_reach,
      nearby_attractions
    });
  } catch (error) {
    console.error('Error creating tourist feature:', error);
    res.status(500).json({ error: 'Failed to create tourist feature' });
  }
});

// POST new weather activity with images
router.post('/activities', upload.array('images', 5), handleImageUpload, async (req, res) => {
  try {
    const {
      subdistrict_id,
      activity_type,
      title,
      description,
      detailed_description,
      weather_requirements,
      indoor_outdoor,
      best_season,
      recommendations,
      things_to_carry,
      difficulty_level,
      duration,
      cost_range,
      age_restrictions,
      safety_guidelines,
      required_permits,
      contact_info
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO weather_activities (
        subdistrict_id, activity_type, title, description,
        detailed_description, activity_images, weather_requirements,
        indoor_outdoor, best_season, recommendations, things_to_carry,
        difficulty_level, duration, cost_range, age_restrictions,
        safety_guidelines, required_permits, contact_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrict_id, activity_type, title, description,
        detailed_description, req.body.images, weather_requirements,
        indoor_outdoor, best_season, recommendations,
        JSON.stringify(things_to_carry), difficulty_level, duration,
        cost_range, age_restrictions, safety_guidelines,
        required_permits, contact_info
      ]
    );

    res.status(201).json({
      id: result.insertId,
      subdistrict_id,
      activity_type,
      title,
      description,
      detailed_description,
      activity_images: JSON.parse(req.body.images),
      weather_requirements,
      indoor_outdoor,
      best_season,
      recommendations,
      things_to_carry: JSON.parse(things_to_carry),
      difficulty_level,
      duration,
      cost_range,
      age_restrictions,
      safety_guidelines,
      required_permits,
      contact_info
    });
  } catch (error) {
    console.error('Error creating weather activity:', error);
    res.status(500).json({ error: 'Failed to create weather activity' });
  }
});

// Upload seasonal guide images
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const altTexts = req.body.alt_texts || [];
    const imagePaths = req.files.map((file, index) => ({
      path: file.filename, // Just use filename since it's in root uploads folder
      alt_text: altTexts[index] || ''
    }));

    // Store image information in database
    const insertPromises = imagePaths.map(async (image) => {
      const [result] = await pool.query(
        'INSERT INTO seasonal_guide_images (image_path, alt_text) VALUES (?, ?)',
        [image.path, image.alt_text]
      );
      return {
        ...image,
        id: result.insertId
      };
    });

    const uploadedImages = await Promise.all(insertPromises);

    res.json({
      message: 'Images uploaded successfully',
      imagePaths: uploadedImages.map(img => img.path),
      images: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    // If there's an error, try to clean up any uploaded files
    if (req.files) {
      await Promise.all(req.files.map(file => 
        fs.unlink(file.path).catch(err => console.error('Error deleting file:', err))
      ));
    }
    res.status(500).json({ error: error.message || 'Failed to upload images' });
  }
});

// DELETE routes with image cleanup
router.delete('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get images before deleting
    const [alert] = await pool.query('SELECT alert_images FROM weather_alerts WHERE id = ?', [id]);
    if (alert && alert[0]) {
      await deleteOldImages(alert[0].alert_images);
    }
    
    await pool.query('DELETE FROM weather_alerts WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting weather alert:', error);
    res.status(500).json({ error: 'Failed to delete weather alert' });
  }
});

router.delete('/seasonal-guides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get images before deleting
    const [guide] = await pool.query('SELECT month_images FROM seasonal_guides WHERE id = ?', [id]);
    if (guide && guide[0]) {
      await deleteOldImages(guide[0].month_images);
    }
    
    await pool.query('DELETE FROM seasonal_guides WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting seasonal guide:', error);
    res.status(500).json({ error: 'Failed to delete seasonal guide' });
  }
});

router.delete('/tourist-features/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get images before deleting
    const [feature] = await pool.query('SELECT feature_images FROM tourist_features WHERE id = ?', [id]);
    if (feature && feature[0]) {
      await deleteOldImages(feature[0].feature_images);
    }
    
    await pool.query('DELETE FROM tourist_features WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tourist feature:', error);
    res.status(500).json({ error: 'Failed to delete tourist feature' });
  }
});

router.delete('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get images before deleting
    const [activity] = await pool.query('SELECT activity_images FROM weather_activities WHERE id = ?', [id]);
    if (activity && activity[0]) {
      await deleteOldImages(activity[0].activity_images);
    }
    
    await pool.query('DELETE FROM weather_activities WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting weather activity:', error);
    res.status(500).json({ error: 'Failed to delete weather activity' });
  }
});

module.exports = router; 