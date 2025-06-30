const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const tourPackageController = require('../controllers/tourPackageController');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../upload');
        // Create upload directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Tour Package Routes
router.post('/', upload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
]), tourPackageController.createTourPackage);

router.get('/', tourPackageController.getAllTourPackages);
router.get('/:id', tourPackageController.getTourPackageById);
router.get('/slug/:slug', tourPackageController.getTourPackageBySlug);

router.put('/:id', upload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
]), tourPackageController.updateTourPackage);

router.delete('/:id', tourPackageController.deleteTourPackage);

// Special Offers Routes
router.post('/:id/offers', tourPackageController.createSpecialOffer);
router.get('/:id/offers', tourPackageController.getSpecialOffers);
router.put('/:id/offers/:offerId', tourPackageController.updateSpecialOffer);
router.delete('/:id/offers/:offerId', tourPackageController.deleteSpecialOffer);

// Gallery Images Routes
router.post('/:id/gallery', upload.array('gallery_images', 10), tourPackageController.addGalleryImages);
router.delete('/:id/gallery/:imageId', tourPackageController.deleteGalleryImage);

// Amenities Routes
router.post('/:id/amenities', tourPackageController.addAmenities);
router.delete('/:id/amenities/:amenityId', tourPackageController.removeAmenity);

module.exports = router; 