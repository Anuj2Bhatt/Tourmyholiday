const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'adventure-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .jpeg and .webp files are allowed!'));
  }
});

// Helper function to format activity data
const formatActivityData = (activity) => {
  if (!activity) return null;
  return {
    ...activity,
    featured_image: activity.featured_image ? `uploads/${activity.featured_image}` : null,
    gallery_images: activity.gallery_images ? JSON.parse(activity.gallery_images) : []
  };
};

// State Subdistrict Routes

// Get all activities for a state subdistrict
router.get('/state/:subdistrictId', async (req, res) => {
  try {
    const [activities] = await db.query(
      'SELECT * FROM state_adventure_activities WHERE subdistrict_id = ?',
      [req.params.subdistrictId]
    );
    res.json(activities.map(formatActivityData));
  } catch (err) {
    console.error('Error fetching state adventure activities:', err);
    res.status(500).json({ error: 'Failed to fetch adventure activities' });
  }
});

// Get activities by category for a state subdistrict
router.get('/state/:subdistrictId/category/:category', async (req, res) => {
  try {
    const [activities] = await db.query(
      'SELECT * FROM state_adventure_activities WHERE subdistrict_id = ? AND category = ?',
      [req.params.subdistrictId, req.params.category]
    );
    res.json(activities.map(formatActivityData));
  } catch (err) {
    console.error('Error fetching state adventure activities by category:', err);
    res.status(500).json({ error: 'Failed to fetch adventure activities' });
  }
});

// Get a single state activity
router.get('/state/:id', async (req, res) => {
  try {
    const [activities] = await db.query(
      'SELECT * FROM state_adventure_activities WHERE id = ?',
      [req.params.id]
    );
    if (activities.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(formatActivityData(activities[0]));
  } catch (err) {
    console.error('Error fetching state adventure activity:', err);
    res.status(500).json({ error: 'Failed to fetch adventure activity' });
  }
});

// Create a new state activity
router.post('/state', upload.single('featured_image'), async (req, res) => {
  try {
    const {
      subdistrict_id,
      title,
      slug,
      category,
      description,
      difficulty_level,
      duration,
      best_season,
      location_details,
      coordinates,
      safety_guidelines,
      required_permits,
      contact_info,
      price_range,
      gallery_images
    } = req.body;

    // Validate required fields
    if (!subdistrict_id || !title || !slug || !category || !difficulty_level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      `INSERT INTO state_adventure_activities (
        subdistrict_id, title, slug, category, description, difficulty_level,
        duration, best_season, location_details, coordinates, featured_image,
        gallery_images, safety_guidelines, required_permits, contact_info, price_range
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrict_id, title, slug, category, description, difficulty_level,
        duration, best_season, location_details, coordinates, req.file?.filename,
        gallery_images, safety_guidelines, required_permits, contact_info, price_range
      ]
    );

    const [newActivity] = await db.query(
      'SELECT * FROM state_adventure_activities WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(formatActivityData(newActivity[0]));
  } catch (err) {
    console.error('Error creating state adventure activity:', err);
    res.status(500).json({ error: 'Failed to create adventure activity' });
  }
});

// Update a state activity
router.put('/state/:id', upload.single('featured_image'), async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      description,
      difficulty_level,
      duration,
      best_season,
      location_details,
      coordinates,
      safety_guidelines,
      required_permits,
      contact_info,
      price_range,
      gallery_images
    } = req.body;

    // Get current activity to check if we need to delete old image
    const [currentActivity] = await db.query(
      'SELECT featured_image FROM state_adventure_activities WHERE id = ?',
      [req.params.id]
    );

    if (currentActivity.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // If new image uploaded, delete old one
    if (req.file && currentActivity[0].featured_image) {
      const oldImagePath = path.join(__dirname, '../../uploads', currentActivity[0].featured_image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Error deleting old image:', err);
      });
    }

    await db.query(
      `UPDATE state_adventure_activities SET
        title = ?, slug = ?, category = ?, description = ?, difficulty_level = ?,
        duration = ?, best_season = ?, location_details = ?, coordinates = ?,
        featured_image = COALESCE(?, featured_image),
        gallery_images = ?, safety_guidelines = ?, required_permits = ?,
        contact_info = ?, price_range = ?
      WHERE id = ?`,
      [
        title, slug, category, description, difficulty_level,
        duration, best_season, location_details, coordinates,
        req.file?.filename, gallery_images, safety_guidelines,
        required_permits, contact_info, price_range, req.params.id
      ]
    );

    const [updatedActivity] = await db.query(
      'SELECT * FROM state_adventure_activities WHERE id = ?',
      [req.params.id]
    );

    res.json(formatActivityData(updatedActivity[0]));
  } catch (err) {
    console.error('Error updating state adventure activity:', err);
    res.status(500).json({ error: 'Failed to update adventure activity' });
  }
});

// Delete a state activity
router.delete('/state/:id', async (req, res) => {
  try {
    // Get activity to delete its image
    const [activity] = await db.query(
      'SELECT featured_image FROM state_adventure_activities WHERE id = ?',
      [req.params.id]
    );

    if (activity.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Delete the activity
    await db.query('DELETE FROM state_adventure_activities WHERE id = ?', [req.params.id]);

    // Delete the image file if it exists
    if (activity[0].featured_image) {
      const imagePath = path.join(__dirname, '../../uploads', activity[0].featured_image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('Error deleting state adventure activity:', err);
    res.status(500).json({ error: 'Failed to delete adventure activity' });
  }
});

// Territory Subdistrict Routes

// Get all activities for a territory subdistrict
router.get('/territory/:subdistrictId', async (req, res) => {
  try {
    const [activities] = await db.query(
      'SELECT * FROM territory_adventure_activities WHERE territory_subdistrict_id = ?',
      [req.params.subdistrictId]
    );
    res.json(activities.map(formatActivityData));
  } catch (err) {
    console.error('Error fetching territory adventure activities:', err);
    res.status(500).json({ error: 'Failed to fetch adventure activities' });
  }
});

// Get activities by category for a territory subdistrict
router.get('/territory/:subdistrictId/category/:category', async (req, res) => {
  try {
    const [activities] = await db.query(
      'SELECT * FROM territory_adventure_activities WHERE territory_subdistrict_id = ? AND category = ?',
      [req.params.subdistrictId, req.params.category]
    );
    res.json(activities.map(formatActivityData));
  } catch (err) {
    console.error('Error fetching territory adventure activities by category:', err);
    res.status(500).json({ error: 'Failed to fetch adventure activities' });
  }
});

// Get a single territory activity
router.get('/territory/:id', async (req, res) => {
  try {
    const [activities] = await db.query(
      'SELECT * FROM territory_adventure_activities WHERE id = ?',
      [req.params.id]
    );
    if (activities.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(formatActivityData(activities[0]));
  } catch (err) {
    console.error('Error fetching territory adventure activity:', err);
    res.status(500).json({ error: 'Failed to fetch adventure activity' });
  }
});

// Create a new territory activity
router.post('/territory', upload.single('featured_image'), async (req, res) => {
  try {
    const {
      territory_subdistrict_id,
      title,
      slug,
      category,
      description,
      difficulty_level,
      duration,
      best_season,
      location_details,
      coordinates,
      safety_guidelines,
      required_permits,
      contact_info,
      price_range,
      gallery_images
    } = req.body;

    // Validate required fields
    if (!territory_subdistrict_id || !title || !slug || !category || !difficulty_level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      `INSERT INTO territory_adventure_activities (
        territory_subdistrict_id, title, slug, category, description, difficulty_level,
        duration, best_season, location_details, coordinates, featured_image,
        gallery_images, safety_guidelines, required_permits, contact_info, price_range
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        territory_subdistrict_id, title, slug, category, description, difficulty_level,
        duration, best_season, location_details, coordinates, req.file?.filename,
        gallery_images, safety_guidelines, required_permits, contact_info, price_range
      ]
    );

    const [newActivity] = await db.query(
      'SELECT * FROM territory_adventure_activities WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(formatActivityData(newActivity[0]));
  } catch (err) {
    console.error('Error creating territory adventure activity:', err);
    res.status(500).json({ error: 'Failed to create adventure activity' });
  }
});

// Update a territory activity
router.put('/territory/:id', upload.single('featured_image'), async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      description,
      difficulty_level,
      duration,
      best_season,
      location_details,
      coordinates,
      safety_guidelines,
      required_permits,
      contact_info,
      price_range,
      gallery_images
    } = req.body;

    // Get current activity to check if we need to delete old image
    const [currentActivity] = await db.query(
      'SELECT featured_image FROM territory_adventure_activities WHERE id = ?',
      [req.params.id]
    );

    if (currentActivity.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // If new image uploaded, delete old one
    if (req.file && currentActivity[0].featured_image) {
      const oldImagePath = path.join(__dirname, '../../uploads', currentActivity[0].featured_image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Error deleting old image:', err);
      });
    }

    await db.query(
      `UPDATE territory_adventure_activities SET
        title = ?, slug = ?, category = ?, description = ?, difficulty_level = ?,
        duration = ?, best_season = ?, location_details = ?, coordinates = ?,
        featured_image = COALESCE(?, featured_image),
        gallery_images = ?, safety_guidelines = ?, required_permits = ?,
        contact_info = ?, price_range = ?
      WHERE id = ?`,
      [
        title, slug, category, description, difficulty_level,
        duration, best_season, location_details, coordinates,
        req.file?.filename, gallery_images, safety_guidelines,
        required_permits, contact_info, price_range, req.params.id
      ]
    );

    const [updatedActivity] = await db.query(
      'SELECT * FROM territory_adventure_activities WHERE id = ?',
      [req.params.id]
    );

    res.json(formatActivityData(updatedActivity[0]));
  } catch (err) {
    console.error('Error updating territory adventure activity:', err);
    res.status(500).json({ error: 'Failed to update adventure activity' });
  }
});

// Delete a territory activity
router.delete('/territory/:id', async (req, res) => {
  try {
    // Get activity to delete its image
    const [activity] = await db.query(
      'SELECT featured_image FROM territory_adventure_activities WHERE id = ?',
      [req.params.id]
    );

    if (activity.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Delete the activity
    await db.query('DELETE FROM territory_adventure_activities WHERE id = ?', [req.params.id]);

    // Delete the image file if it exists
    if (activity[0].featured_image) {
      const imagePath = path.join(__dirname, '../../uploads', activity[0].featured_image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('Error deleting territory adventure activity:', err);
    res.status(500).json({ error: 'Failed to delete adventure activity' });
  }
});

module.exports = router; 