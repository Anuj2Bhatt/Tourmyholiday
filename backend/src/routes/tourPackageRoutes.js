const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const tourPackageController = require('../controllers/tourPackageController');
const { createUploadMiddleware } = require('../middleware/imageUpload');

// Tour Package Routes
router.post('/', 
  createUploadMiddleware([
    { name: 'featured_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
  ]), 
  tourPackageController.createTourPackage
);

router.put('/:id',
  createUploadMiddleware([
    { name: 'featured_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
  ]),
  tourPackageController.updateTourPackage
);

// Other routes...
router.get('/', tourPackageController.getAllTourPackages);
router.get('/:id', tourPackageController.getTourPackageById);
router.get('/slug/:slug', tourPackageController.getTourPackageBySlug);
router.delete('/:id', tourPackageController.deleteTourPackage);

module.exports = router; 