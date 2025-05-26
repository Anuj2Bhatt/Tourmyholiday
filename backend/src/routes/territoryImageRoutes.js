const express = require('express');
const router = express.Router();
const territoryImageController = require('../controllers/territoryImageController');
const { upload } = require('../middleware/uploadMiddleware');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/by-territory/:territoryId', territoryImageController.getTerritoryImages);

// Protected routes (admin only)
router.post('/', 
  authenticateToken, 
  isAdmin, 
  upload.single('image'), 
  territoryImageController.addTerritoryImage
);

router.put('/:imageId', 
  authenticateToken, 
  isAdmin, 
  upload.single('image'), 
  territoryImageController.updateTerritoryImage
);

router.delete('/:imageId', 
  authenticateToken, 
  isAdmin, 
  territoryImageController.deleteTerritoryImage
);

router.patch('/:imageId/feature', 
  authenticateToken, 
  isAdmin, 
  territoryImageController.toggleFeatured
);

router.patch('/:imageId/order', 
  authenticateToken, 
  isAdmin, 
  territoryImageController.updateDisplayOrder
);

module.exports = router; 