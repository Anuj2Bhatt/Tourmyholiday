const express = require('express');
const router = express.Router();
const { uploadMiddleware } = require('../middleware/uploadMiddleware');
const {
  createTourismPackage,
  getAllTourismPackages,
  getTourismPackageById,
  getTourismPackageBySlug,
  updateTourismPackage,
  deleteTourismPackage,
  getTrendingDestinations
} = require('../controllers/tourismController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllTourismPackages);
router.get('/trending', getTrendingDestinations);
router.get('/:id', getTourismPackageById);
router.get('/slug/:slug', getTourismPackageBySlug);

// Protected routes (admin only)
router.post('/',
  authenticateToken,
  isAdmin,
  uploadMiddleware,
  createTourismPackage
);

router.put('/:id',
  authenticateToken,
  isAdmin,
  uploadMiddleware,
  updateTourismPackage
);

router.delete('/:id',
  authenticateToken,
  isAdmin,
  deleteTourismPackage
);

module.exports = router; 