const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getTerritoryDistricts,
    getTerritoryDistrict,
    createTerritoryDistrict,
    updateTerritoryDistrict,
    deleteTerritoryDistrict,
    updateTerritoryDistrictData
} = require('../controllers/territoryDistrictController');
const db = require('../../db');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'territory-district-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
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

// Routes
router.get('/territory/:territoryId', getTerritoryDistricts);
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [districts] = await db.query(
      'SELECT * FROM territory_districts WHERE slug = ?',
      [slug]
    );
    
    if (districts.length === 0) {
      return res.status(404).json({ error: 'District not found' });
    }
    
    // Format image path
    const district = districts[0];
    if (district.featured_image) {
      district.featured_image = `${process.env.API_BASE_URL || 'http://localhost:5000'}${district.featured_image}`;
    }
    
    res.json(district);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch district by slug', details: error.message });
  }
});
router.get('/:id', getTerritoryDistrict);
router.post('/', upload.single('featured_image'), createTerritoryDistrict);
router.put('/:id', upload.single('featured_image'), updateTerritoryDistrict);
router.delete('/:id', deleteTerritoryDistrict);
router.put('/:id/update-data', updateTerritoryDistrictData);

module.exports = router; 