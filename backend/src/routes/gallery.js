const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../../db');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use the same uploads directory as defined in server.js
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s/g, '-'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('File must be an image'), false);
    }
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`Only ${allowedExtensions.join(', ')} files are allowed`), false);
    }
    
    cb(null, true);
  }
});

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery_images ORDER BY created_at DESC');
    
    // Map the rows to include full URLs
    const images = rows.map(image => ({
      ...image,
      url: image.image_path.startsWith('http') ? 
        image.image_path : 
        `http://localhost:5000/uploads/${path.basename(image.image_path)}`
    }));
    
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Get a single gallery image by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Map the row to include full URL
    const image = {
      ...rows[0],
      url: rows[0].image_path.startsWith('http') ? 
        rows[0].image_path : 
        `http://localhost:5000/uploads/${path.basename(rows[0].image_path)}`
    };
    
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery image' });
  }
});

// Add a new gallery image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, altText } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    const imagePath = `/uploads/${req.file.filename}`;
    
    const [result] = await pool.query(
      'INSERT INTO gallery_images (title, description, alt_text, image_path) VALUES (?, ?, ?, ?)',
      [title, description, altText, imagePath]
    );
    
    const newImage = {
      id: result.insertId,
      url: `http://localhost:5000${imagePath}`,
      title,
      description,
      altText
    };
    
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Update a gallery image
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, altText } = req.body;
    
    let updateQuery = 'UPDATE gallery_images SET title = ?, description = ?, alt_text = ?';
    let queryParams = [title, description, altText];
    
    if (req.file) {
      const imagePath = `/uploads/${req.file.filename}`;
      updateQuery += ', image_path = ?';
      queryParams.push(imagePath);
      
      // Get old image path to delete
      const [oldImage] = await pool.query('SELECT image_path FROM gallery_images WHERE id = ?', [id]);
      if (oldImage.length > 0 && oldImage[0].image_path) {
        const oldPath = path.join(__dirname, '..', 'public', oldImage[0].image_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    updateQuery += ' WHERE id = ?';
    queryParams.push(id);
    
    const [result] = await pool.query(updateQuery, queryParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ message: 'Image updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete a gallery image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the image path before deleting
    const [rows] = await pool.query('SELECT image_path FROM gallery_images WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete the file if it exists
    if (rows[0].image_path) {
      const imagePath = path.join(__dirname, '..', '..', 'uploads', path.basename(rows[0].image_path));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete from database
    await pool.query('DELETE FROM gallery_images WHERE id = ?', [id]);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Debug route to check database
router.get('/debug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.json({ 
        error: 'Image not found in database',
        query: 'SELECT * FROM gallery_images WHERE id = ?',
        params: [id]
      });
    }
    
    const image = rows[0];
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(image.image_path));
    
    res.json({
      database_record: image,
      file_exists: fs.existsSync(filePath),
      file_path: filePath,
      uploads_dir: path.join(__dirname, '..', 'uploads'),
      files_in_uploads: fs.readdirSync(path.join(__dirname, '..', 'uploads'))
    });
  } catch (error) {
    res.status(500).json({ error: 'Debug route error', details: error.message });
  }
});

// Debug route to check file existence
router.get('/debug-file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const filePath = path.join(uploadsDir, filename);
    
    const response = {
      filename,
      uploadsDir,
      filePath,
      fileExists: fs.existsSync(filePath),
      directoryExists: fs.existsSync(uploadsDir),
      directoryContents: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [],
      currentWorkingDir: process.cwd()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 