const express = require('express');
const router = express.Router();
const pool = require('../db');
const path = require('path');
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // Debug log
  console.log('Uploading file:', file.originalname, 'mimetype:', file.mimetype, 'ext:', ext);

  if (allowedExtensions.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

// Get all images for a state
router.get('/:stateId', async (req, res) => {
  try {
    const { stateId } = req.params;
    console.log('Fetching images for state ID:', stateId);

    // First check if state exists
    const [states] = await pool.query('SELECT id FROM states WHERE id = ?', [stateId]);
    if (states.length === 0) {
      return res.status(404).json({ message: 'State not found' });
    }

    // Get all images for this state
    const [images] = await pool.query(`
      SELECT id, state_id, url, alt, caption, created_at
      FROM state_images 
      WHERE state_id = ? 
      ORDER BY created_at DESC
    `, [stateId]);

    // Format image URLs
    const formattedImages = images.map(image => ({
      ...image,
      url: image.url.startsWith('http') ? image.url : `http://localhost:5000${image.url}`
    }));

    console.log(`Found ${images.length} images for state ${stateId}`);
    res.json(formattedImages);
  } catch (error) {
    console.error('Error fetching state images:', error);
    res.status(500).json({ message: 'Failed to fetch state images', error: error.message });
  }
});

// Upload new image for a state
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { state_id, caption, alt } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Check if state exists
    const [states] = await pool.query('SELECT id FROM states WHERE id = ?', [state_id]);
    if (states.length === 0) {
      return res.status(404).json({ message: 'State not found' });
    }

    // Save image info to database
    const [result] = await pool.query(
      'INSERT INTO state_images (state_id, url, alt, caption) VALUES (?, ?, ?, ?)',
      [state_id, `/uploads/${image.filename}`, alt || '', caption || '']
    );

    const newImage = {
      id: result.insertId,
      state_id: parseInt(state_id),
      url: `http://localhost:5000/uploads/${image.filename}`,
      alt: alt || '',
      caption: caption || '',
      created_at: new Date()
    };

    console.log('Successfully uploaded image for state:', state_id);
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error uploading state image:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
});

// Delete an image
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    // Get image info first
    const [images] = await pool.query('SELECT url FROM state_images WHERE id = ?', [imageId]);
    if (images.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from database
    await pool.query('DELETE FROM state_images WHERE id = ?', [imageId]);

    // Delete file from uploads directory
    const imagePath = path.join(__dirname, '../..', images[0].url);
    try {
      require('fs').unlinkSync(imagePath);
    } catch (err) {
      console.warn('Could not delete image file:', err);
    }

    console.log('Successfully deleted image:', imageId);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting state image:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

module.exports = router; 