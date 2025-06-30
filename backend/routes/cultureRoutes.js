const express = require('express');
const router = express.Router();
const multer = require('multer');
const cultureController = require('../controllers/cultureController');

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

// State Cultures
router.get('/id/:id', cultureController.getCultureById);
router.get('/slug/:slug', cultureController.getCultureBySlug);
router.get('/subdistrict/:subdistrictId', cultureController.getCulturesBySubdistrict);
router.post('/', upload.single('featured_image'), cultureController.createCulture);
router.put('/:id', upload.single('featured_image'), cultureController.updateCulture);
router.delete('/:id', cultureController.deleteCulture);

// Territory Cultures
router.get('/territory-subdistrict/:subdistrictId', cultureController.getTerritoryCulturesBySubdistrict);
router.post('/territory', upload.single('featured_image'), cultureController.createTerritoryCulture);
router.put('/territory/:id', upload.single('featured_image'), cultureController.updateTerritoryCulture);
router.delete('/territory/:id', cultureController.deleteTerritoryCulture);

module.exports = router; 