const express = require('express');
const router = express.Router();
const pool = require('../../db');
const path = require('path');
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Update file filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file type. Allowed types: jpg, jpeg, png, gif, webp'), false);
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return cb(new Error('File size too large. Maximum size is 5MB'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Update error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Update the seasons array to include all five seasons
const SEASONS = ['summer', 'monsoon', 'autumn', 'winter', 'spring'];

// Get all season images for a state
router.get('/:stateId', async (req, res) => {
  try {
    const { stateId } = req.params;
    // First check if state exists
    const [states] = await pool.query('SELECT id FROM states WHERE id = ?', [stateId]);
    if (states.length === 0) {
      return res.status(404).json({ message: 'State not found' });
    }

    // Get images for all seasons of this state
    const [images] = await pool.query(`
      SELECT id, state_id, season, url, location, alt, caption, created_at, updated_at
      FROM state_season_images 
      WHERE state_id = ?
      ORDER BY season, created_at DESC
    `, [stateId]);

    // Group images by season
    const seasonImages = {
      summer: [],
      monsoon: [],
      autumn: [],
      winter: [],
      spring: []
    };

    // Format and group images
    images.forEach(image => {
      let imageUrl = image.url;
      
      // Remove any leading slashes
      if (imageUrl.startsWith('/')) {
        imageUrl = imageUrl.substring(1);
      }
      
      // Remove 'uploads/' prefix if it exists
      if (imageUrl.startsWith('uploads/')) {
        imageUrl = imageUrl.substring(8);
      }
      
      // Format the image URL
      const formattedImage = {
        ...image,
        url: imageUrl.startsWith('http') ? imageUrl : `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${imageUrl}`
      };

      // Add to appropriate season array
      if (SEASONS.includes(image.season.toLowerCase())) {
        seasonImages[image.season.toLowerCase()].push(formattedImage);
      }
    });
    
    res.json(seasonImages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch season images', error: error.message });
  }
});

// Add PUT route for updating image details
router.put('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { location, alt, caption } = req.body;

    // First check if image exists
    const [images] = await pool.query('SELECT id, url FROM state_season_images WHERE id = ?', [imageId]);
    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Update image details
    await pool.query(
      'UPDATE state_season_images SET location = ?, alt = ?, caption = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [location, alt, caption, imageId]
    );

    // Get updated image
    const [updatedImage] = await pool.query(
      'SELECT * FROM state_season_images WHERE id = ?',
      [imageId]
    );

    // Format image URL consistently
    const imageUrl = updatedImage[0].url;
    const formattedImage = {
      ...updatedImage[0],
      url: imageUrl.startsWith('http') ? imageUrl : `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${imageUrl}`
    };

    res.json(formattedImage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Update POST route validation
router.post('/', upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const { stateId, season, location, alt, caption } = req.body;

    if (!stateId || !season || !location || !alt) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!SEASONS.includes(season)) {
      return res.status(400).json({ 
        error: 'Invalid season. Must be one of: summer, monsoon, autumn, winter, spring' 
      });
    }

    // Store just the filename in database
    const imageUrl = req.file.filename;

    const [result] = await pool.query(
      'INSERT INTO state_season_images (state_id, season, url, location, alt, caption) VALUES (?, ?, ?, ?, ?, ?)',
      [stateId, season.toLowerCase(), imageUrl, location || null, alt || null, caption || null]
    );

    const [newImage] = await pool.query(
      'SELECT * FROM state_season_images WHERE id = ?',
      [result.insertId]
    );

    // Format response URL
    const formattedImage = {
      ...newImage[0],
      url: `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${imageUrl}`
    };

    res.status(201).json(formattedImage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete a season image
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    // Get image info first
    const [images] = await pool.query('SELECT url FROM state_season_images WHERE id = ?', [imageId]);
    if (images.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from database
    await pool.query('DELETE FROM state_season_images WHERE id = ?', [imageId]);

    // Delete file from uploads directory
    const imagePath = path.join(__dirname, '../..', images[0].url);
    try {
      require('fs').unlinkSync(imagePath);
    } catch (err) {
      }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

module.exports = router; 