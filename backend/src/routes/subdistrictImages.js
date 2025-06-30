const express = require('express');
const router = express.Router();
const pool = require('../../db');  
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const cleanName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-.]/g, '')
      .toLowerCase();
    cb(null, 'subdistrict-' + uniqueSuffix + '-' + cleanName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.'), false);
    }
  }
});

// Helper function to format image URL
const formatImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(imagePath)}`;
};

// Get all images for a subdistrict
router.get('/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [images] = await pool.query(
      'SELECT * FROM subdistrict_gallery WHERE subdistrict_id = ?',
      [subdistrictId]
    );

    // Format image URLs
    const formattedImages = images.map(image => ({
      ...image,
      image_url: formatImageUrl(image.image_url)
    }));

    res.json(formattedImages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subdistrict images' });
  }
});

// Add a new image
router.post('/:subdistrictId', upload.single('image'), async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const { alt_text, caption } = req.body;
    const image_url = req.file ? `uploads/${req.file.filename}` : null;

    if (!image_url) {    
      return res.status(400).json({ message: 'No image file provided' });
    }

    const [result] = await pool.query(
      'INSERT INTO subdistrict_gallery (subdistrict_id, image_url, alt_text, caption) VALUES (?, ?, ?, ?)',
      [subdistrictId, image_url, alt_text, caption]
    );

    const [newImage] = await pool.query(
      'SELECT * FROM subdistrict_gallery WHERE id = ?',
      [result.insertId]
    );

    // Format image URL
    newImage[0].image_url = formatImageUrl(newImage[0].image_url);

    res.status(201).json(newImage[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding subdistrict image' });
  }
});

// Update an image
router.put('/:imageId', upload.single('image'), async (req, res) => {
  try {
    const { imageId } = req.params;
    const { alt_text, caption } = req.body;
    const image_url = req.file ? req.file.path : null;

    // Get current image data
    const [currentImage] = await pool.query(
      'SELECT * FROM subdistrict_gallery WHERE id = ?',
      [imageId]
    );

    if (currentImage.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete old image file if new image is uploaded
    if (image_url && currentImage[0].image_url) {
      const oldImagePath = path.join(__dirname, '../../', currentImage[0].image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update image data
    await pool.query(
      'UPDATE subdistrict_gallery SET image_url = COALESCE(?, image_url), alt_text = ?, caption = ? WHERE id = ?',
      [image_url, alt_text, caption, imageId]
    );

    const [updatedImage] = await pool.query(
      'SELECT * FROM subdistrict_gallery WHERE id = ?',
      [imageId]
    );

    // Format image URL
    updatedImage[0].image_url = formatImageUrl(updatedImage[0].image_url);

    res.json(updatedImage[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating subdistrict image' });
  }
});

// Delete an image
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    // Get image data before deleting
    const [image] = await pool.query(
      'SELECT * FROM subdistrict_gallery WHERE id = ?',
      [imageId]
    );

    if (image.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete image file
    if (image[0].image_url) {
      const imagePath = path.join(__dirname, '../../', image[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete from database
    await pool.query('DELETE FROM subdistrict_gallery WHERE id = ?', [imageId]);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subdistrict image' });
  }
});

module.exports = router; 