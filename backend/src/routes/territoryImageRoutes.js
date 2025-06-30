const express = require('express');
const router = express.Router();
const { uploadMiddleware } = require('../middleware/uploadMiddleware');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const {
  uploadTerritoryImage,
  getTerritoryImages,
  deleteTerritoryImage
} = require('../controllers/territoryImageController');

// Create a custom middleware for single image upload
const singleImageUpload = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    // Rename the file field to match what the controller expects
    if (req.files && req.files.featured_image) {
      req.file = req.files.featured_image[0];
    }
    next();
  });
};

// Protected routes (admin only)
router.post('/',
  authenticateToken,
  isAdmin,
  singleImageUpload,
  uploadTerritoryImage
);

router.get('/', getTerritoryImages);

router.delete('/:id',
  authenticateToken,
  isAdmin,
  deleteTerritoryImage
);

module.exports = router; 