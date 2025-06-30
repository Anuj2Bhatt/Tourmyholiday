const express = require('express');
const router = express.Router();
const pool = require('../../db');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload state history image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }

    // Create the full URL for the uploaded image
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// Get state history
router.get('/', async (req, res) => {
  try {
    const { state_id, sort = 'desc' } = req.query;

    if (!state_id) {
      return res.status(400).json({ error: 'State ID is required' });
    }

    // Validate sort parameter
    if (sort !== 'asc' && sort !== 'desc') {
      return res.status(400).json({ error: 'Invalid sort parameter. Use "asc" or "desc"' });
    }

    // First check if state exists
    const [states] = await pool.query('SELECT id FROM states WHERE id = ?', [state_id]);
    if (states.length === 0) {
      return res.status(404).json({ message: 'State not found' });
    }

    // Get state history with correct column names
    const [history] = await pool.query(`
      SELECT 
        sh.id,
        sh.state_id,
        sh.title,
        sh.content,
        sh.image,
        sh.slug,
        sh.status,
        sh.meta_title,
        sh.meta_description,
        sh.meta_keywords,
        s.name as state_name
      FROM state_history sh
      JOIN states s ON sh.state_id = s.id
      WHERE sh.state_id = ?
      ORDER BY sh.id ${sort === 'desc' ? 'DESC' : 'ASC'}
    `, [state_id]);

    // Format image URLs
    const formattedHistory = history.map(item => {
      if (!item.image) return { ...item, image: null };

      let imageUrl = item.image;
      
      // If it's already a full URL, return as is
      if (imageUrl.startsWith('http')) {
        return { ...item, image: imageUrl };
      }
      
      // Remove any leading slashes
      imageUrl = imageUrl.replace(/^\//, '');
      
      // If it's just the filename, add the uploads path
      if (!imageUrl.includes('/')) {
        imageUrl = `uploads/${imageUrl}`;
      }
      
      // Construct the full URL
      return { 
        ...item, 
        image: `${process.env.API_BASE_URL || 'http://localhost:5000'}/${imageUrl}`
      };
    });

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch state history', error: error.message });
  }
});

// Update state history by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      image,
      slug,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      state_id
    } = req.body;

    // Check if entry exists
    const [rows] = await pool.query('SELECT * FROM state_history WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'State history not found' });
    }

    // Format image URL if it exists
    let formattedImage = null;
    if (image) {
      // If it's already a full URL, extract just the filename
      if (image.startsWith('http')) {
        formattedImage = image.split('/').pop();
      } else {
        // Remove any leading slashes or 'uploads/' prefix
        formattedImage = image.replace(/^uploads[\\/]/, '').replace(/^\//, '');
      }
    }

    // Update entry
    await pool.query(
      `UPDATE state_history SET
        title = ?,
        content = ?,
        image = ?,
        slug = ?,
        status = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        state_id = ?
      WHERE id = ?`,
      [
        title,
        content ? `<p>${content}</p>` : content,
        formattedImage,
        slug,
        status,
        meta_title,
        meta_description,
        meta_keywords,
        state_id,
        id
      ]
    );

    // Return updated row with formatted image URL
    const [updated] = await pool.query('SELECT * FROM state_history WHERE id = ?', [id]);
    let imgUrl = updated[0].image;
    if (imgUrl) {
      if (!imgUrl.startsWith('http')) {
        imgUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${imgUrl}`;
      }
    } else {
      imgUrl = null;
    }
    const formatted = {
      ...updated[0],
      image: imgUrl
    };
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update state history' });
  }
});

// Get state history by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get state history with correct column names
    const [history] = await pool.query(`
      SELECT 
        sh.id,
        sh.state_id,
        sh.title,
        sh.content,
        sh.image,
        sh.slug,
        sh.status,
        sh.meta_title,
        sh.meta_description,
        sh.meta_keywords,
        sh.created_at,
        s.name as state_name
      FROM state_history sh
      JOIN states s ON sh.state_id = s.id
      WHERE sh.slug = ? AND sh.status = 'Public'
    `, [slug]);

    if (history.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'State history not found'
      });
    }

    // Format image URL and content
    let historyItem = history[0];
    
    // Format content to HTML if it's not already
    if (historyItem.content && !historyItem.content.startsWith('<')) {
      historyItem.content = `<p>${historyItem.content}</p>`;
    }
    
    if (historyItem.image) {
      let imageUrl = historyItem.image;
      // Remove any leading slashes or 'uploads/' prefix
      imageUrl = imageUrl.replace(/^uploads[\\/]/, '').replace(/^\//, '');
      if (!imageUrl.startsWith('http')) {
        imageUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${imageUrl}`;
      }
      historyItem.image = imageUrl;
    }

    // Update the content in database if it was plain text
    if (history[0].content && !history[0].content.startsWith('<')) {
      await pool.query(
        'UPDATE state_history SET content = ? WHERE id = ?',
        [historyItem.content, historyItem.id]
      );
    }

    res.json({
      success: true,
      data: historyItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch state history'
    });
  }
});

// Temporary route to update content format
router.put('/update-content-format/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current content
    const [rows] = await pool.query('SELECT content FROM state_history WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'State history not found' });
    }

    const currentContent = rows[0].content;
    
    // Only update if content is not already in HTML format
    if (currentContent && !currentContent.startsWith('<')) {
      const updatedContent = `<p>${currentContent}</p>`;
      await pool.query(
        'UPDATE state_history SET content = ? WHERE id = ?',
        [updatedContent, id]
      );
      
      res.json({ 
        success: true, 
        message: 'Content format updated',
        oldContent: currentContent,
        newContent: updatedContent
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Content already in HTML format',
        content: currentContent
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content format' });
  }
});

module.exports = router; 