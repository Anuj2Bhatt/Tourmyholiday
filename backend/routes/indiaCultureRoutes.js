const express = require('express');
const router = express.Router();
const multer = require('multer');
const indiaCultureController = require('../controllers/indiaCultureController');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all India Cultures
router.get('/', indiaCultureController.getAllIndiaCultures);

// Get India Culture by ID
router.get('/:id', indiaCultureController.getIndiaCultureById);

// Create new India Culture
router.post('/', upload.single('featured_image'), indiaCultureController.createIndiaCulture);

// Update India Culture
router.put('/:id', upload.single('featured_image'), indiaCultureController.updateIndiaCulture);

// Delete India Culture
router.delete('/:id', indiaCultureController.deleteIndiaCulture);

// Get India Cultures by category
router.get('/category/:category', indiaCultureController.getIndiaCulturesByCategory);

// Get India Cultures by state
router.get('/state/:state', indiaCultureController.getIndiaCulturesByState);

// Get India Cultures by region
router.get('/region/:region', indiaCultureController.getIndiaCulturesByRegion);

module.exports = router; 