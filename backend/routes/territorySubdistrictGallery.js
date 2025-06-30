const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Direct upload to uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file extension and mimetype
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all images for a territory subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const [images] = await db.query(
      'SELECT * FROM territory_subdistrict_gallery WHERE territory_subdistrict_id = ? ORDER BY created_at DESC',
      [req.params.subdistrictId]
    );
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching territory gallery images' });
  }
});

// Add new image to territory gallery
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { territory_subdistrict_id, alt_text, description } = req.body;
    
    if (!territory_subdistrict_id) {
      return res.status(400).json({ message: 'Territory Subdistrict ID is required' });
    }

    const [result] = await db.query(
      'INSERT INTO territory_subdistrict_gallery (territory_subdistrict_id, image_url, alt_text, description) VALUES (?, ?, ?, ?)',
      [territory_subdistrict_id, req.file.filename, alt_text || null, description || null]
    );

    const [newImage] = await db.query(
      'SELECT * FROM territory_subdistrict_gallery WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newImage[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding territory gallery image' });
  }
});

// Update territory gallery image
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { alt_text, description } = req.body;
    const imageId = req.params.id;

    let updateQuery = 'UPDATE territory_subdistrict_gallery SET alt_text = ?, description = ?';
    let queryParams = [alt_text || null, description || null];

    if (req.file) {
      // Get old image filename to delete it
      const [oldImage] = await db.query(
        'SELECT image_url FROM territory_subdistrict_gallery WHERE id = ?',
        [imageId]
      );

      if (oldImage[0]) {
        const oldImagePath = path.join(__dirname, '../uploads', oldImage[0].image_url);
        // Delete old image file
        try {
          require('fs').unlinkSync(oldImagePath);
        } catch (err) {
          }
      }

      updateQuery += ', image_url = ?';
      queryParams.push(req.file.filename);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(imageId);

    await db.query(updateQuery, queryParams);

    const [updatedImage] = await db.query(
      'SELECT * FROM territory_subdistrict_gallery WHERE id = ?',
      [imageId]
    );

    if (!updatedImage[0]) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(updatedImage[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating territory gallery image' });
  }
});

// Delete territory gallery image
router.delete('/:id', async (req, res) => {
  try {
    // Get image filename before deleting
    const [image] = await db.query(
      'SELECT image_url FROM territory_subdistrict_gallery WHERE id = ?',
      [req.params.id]
    );

    if (!image[0]) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from database
    await db.query('DELETE FROM territory_subdistrict_gallery WHERE id = ?', [req.params.id]);

    // Delete image file
    const imagePath = path.join(__dirname, '../uploads', image[0].image_url);
    try {
      require('fs').unlinkSync(imagePath);
    } catch (err) {
      }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting territory gallery image' });
  }
});

module.exports = router; 