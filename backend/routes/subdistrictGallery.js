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
    // Check mimetype
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`Only ${allowedExtensions.join(', ')} files are allowed`), false);
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all images for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const [images] = await db.query(
      'SELECT * FROM subdistrict_gallery WHERE subdistrict_id = ? ORDER BY created_at DESC',
      [req.params.subdistrictId]
    );
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery images' });
  }
});

// Add new image to gallery
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { subdistrict_id, alt_text, description } = req.body;
    
    if (!subdistrict_id) {
      return res.status(400).json({ message: 'Subdistrict ID is required' });
    }

    const [result] = await db.query(
      'INSERT INTO subdistrict_gallery (subdistrict_id, image_url, alt_text, description) VALUES (?, ?, ?, ?)',
      [subdistrict_id, req.file.filename, alt_text || null, description || null]
    );

    const [newImage] = await db.query(
      'SELECT * FROM subdistrict_gallery WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newImage[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding gallery image' });
  }
});

// Update gallery image
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { alt_text, description } = req.body;
    const imageId = req.params.id;

    let updateQuery = 'UPDATE subdistrict_gallery SET alt_text = ?, description = ?';
    let queryParams = [alt_text || null, description || null];

    if (req.file) {
      // Get old image filename to delete it
      const [oldImage] = await db.query(
        'SELECT image_url FROM subdistrict_gallery WHERE id = ?',
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
      'SELECT * FROM subdistrict_gallery WHERE id = ?',
      [imageId]
    );

    if (!updatedImage[0]) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(updatedImage[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating gallery image' });
  }
});

// Delete gallery image
router.delete('/:id', async (req, res) => {
  try {
    // Get image filename before deleting
    const [image] = await db.query(
      'SELECT image_url FROM subdistrict_gallery WHERE id = ?',
      [req.params.id]
    );

    if (!image[0]) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from database
    await db.query('DELETE FROM subdistrict_gallery WHERE id = ?', [req.params.id]);

    // Delete image file
    const imagePath = path.join(__dirname, '../uploads', image[0].image_url);
    try {
      require('fs').unlinkSync(imagePath);
    } catch (err) {
      }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gallery image' });
  }
});

module.exports = router; 