const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    console.log('Gallery upload directory:', uploadDir);
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating gallery upload directory:', uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.originalname.replace(/\s/g, '-');
    console.log('Generated gallery filename:', filename);
    cb(null, filename);
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
    const [rows] = await db.query('SELECT * FROM gallery_images ORDER BY created_at DESC');
    
    // Map the rows to include full URLs and debug info
    const images = rows.map(image => {
      const fullPath = path.join(__dirname, '..', image.image_path);
      return {
        ...image,
        url: image.image_path.startsWith('http') ? 
          image.image_path : 
          `http://localhost:5000/uploads/${path.basename(image.image_path)}`,
        exists: fs.existsSync(fullPath),
        full_path: fullPath,
        uploads_dir: path.join(__dirname, '..', 'uploads')
      };
    });
    
    res.json({
      total_images: images.length,
      images: images,
      uploads_dir: path.join(__dirname, '..', 'uploads'),
      files_in_uploads: fs.readdirSync(path.join(__dirname, '..', 'uploads'))
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Get a single gallery image by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM gallery_images WHERE id = ?', [id]);
    
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
    console.error('Error fetching gallery image:', error);
    res.status(500).json({ error: 'Failed to fetch gallery image' });
  }
});

// Add a new gallery image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, altText } = req.body;
    
    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    console.log('File uploaded:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
    
    const imagePath = `/uploads/${req.file.filename}`;
    console.log('Image path to be stored:', imagePath);
    
    const [result] = await db.query(
      'INSERT INTO gallery_images (title, description, alt_text, image_path) VALUES (?, ?, ?, ?)',
      [title, description, altText, imagePath]
    );
    
    const newImage = {
      id: result.insertId,
      url: `http://localhost:5000${imagePath}`,
      title,
      description,
      altText,
      image_path: imagePath
    };
    
    console.log('New image created:', newImage);
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error adding image:', error);
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
      const [oldImage] = await db.query('SELECT image_path FROM gallery_images WHERE id = ?', [id]);
      if (oldImage.length > 0 && oldImage[0].image_path) {
        const oldPath = path.join(__dirname, '..', oldImage[0].image_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    updateQuery += ' WHERE id = ?';
    queryParams.push(id);
    
    const [result] = await db.query(updateQuery, queryParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ 
      message: 'Image updated successfully',
      image: {
        id,
        title,
        description,
        altText,
        image_path: req.file ? `/uploads/${req.file.filename}` : undefined
      }
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete a gallery image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the image path before deleting
    const [rows] = await db.query('SELECT image_path FROM gallery_images WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete the file if it exists
    if (rows[0].image_path) {
      const imagePath = path.join(__dirname, '..', rows[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete from database
    await db.query('DELETE FROM gallery_images WHERE id = ?', [id]);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Debug route to check image paths
router.get('/debug/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = `/uploads/${filename}`;
    const fullPath = path.join(__dirname, '..', imagePath);
    
    // Check database for this image
    const [dbImages] = await db.query(
      'SELECT * FROM gallery_images WHERE image_path = ?',
      [imagePath]
    );
    
    res.json({
      requested_filename: filename,
      image_path: imagePath,
      full_path: fullPath,
      exists: fs.existsSync(fullPath),
      uploads_dir: path.join(__dirname, '..', 'uploads'),
      files_in_uploads: fs.readdirSync(path.join(__dirname, '..', 'uploads')),
      database_records: dbImages,
      current_dir: __dirname
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: 'Debug route error', details: error.message });
  }
});

// Debug route to list all gallery images
router.get('/debug/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery_images ORDER BY created_at DESC');
    
    // Map the rows to include file existence check
    const images = rows.map(image => {
      const fullPath = path.join(__dirname, '..', image.image_path);
      return {
        ...image,
        exists: fs.existsSync(fullPath),
        full_path: fullPath
      };
    });
    
    res.json({
      total_images: images.length,
      images: images,
      uploads_dir: path.join(__dirname, '..', 'uploads'),
      files_in_uploads: fs.readdirSync(path.join(__dirname, '..', 'uploads'))
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: 'Debug route error', details: error.message });
  }
});

// Debug route to check specific image
router.get('/debug/check/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = `/uploads/${filename}`;
    
    // Check database
    const [dbImages] = await db.query(
      'SELECT * FROM gallery_images WHERE image_path = ? OR image_path LIKE ?',
      [imagePath, `%${filename}`]
    );
    
    // Check file system
    const fullPath = path.join(__dirname, '..', imagePath);
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const allFiles = fs.readdirSync(uploadsDir);
    const similarFiles = allFiles.filter(f => f.includes('alaska-1.jpg'));
    
    res.json({
      requested_file: filename,
      image_path: imagePath,
      full_path: fullPath,
      exists: fs.existsSync(fullPath),
      uploads_dir: uploadsDir,
      database_records: dbImages,
      similar_files: similarFiles,
      all_files_count: allFiles.length
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: 'Debug route error', details: error.message });
  }
});

// Debug route to check alaska images in database
router.get('/debug/alaska', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM gallery_images WHERE image_path LIKE ? ORDER BY created_at DESC',
      ['%alaska%']
    );
    
    // Map rows to include file existence
    const images = rows.map(image => {
      const fullPath = path.join(__dirname, '..', image.image_path);
      return {
        ...image,
        exists: fs.existsSync(fullPath),
        full_path: fullPath
      };
    });
    
    res.json({
      total_alaska_images: images.length,
      images: images
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: 'Debug route error', details: error.message });
  }
});

module.exports = router; 