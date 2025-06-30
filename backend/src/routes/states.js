const express = require('express');
const router = express.Router();
const pool = require('../../db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    // Create uploads directory if it doesn't exist
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

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed! Please upload a valid image file (jpg, jpeg, png, gif).'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File size too large. Maximum size is 5MB.' 
      });
    }
    return res.status(400).json({ 
      error: 'File upload error: ' + err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      error: err.message 
    });
  }
  next();
};

// Get all states
router.get('/', async (req, res) => {
  try {
    const [states] = await pool.query('SELECT * FROM states ORDER BY name ASC');
    // Format image URLs
    const formattedStates = states.map(state => ({
      ...state,
      image: state.image ? `${process.env.API_BASE_URL || 'http://localhost:5000'}${state.image}` : null
    }));
    
    res.json(formattedStates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch states', error: error.message });
  }
});

// Get state by ID or route
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    // Try to find by ID first
    let [states] = await pool.query('SELECT * FROM states WHERE id = ?', [identifier]);
    
    // If not found by ID, try by route
    if (states.length === 0) {
      let route = identifier;
      // Normalize: always start with /
      if (!route.startsWith('/')) {
        route = '/' + route;
      }
      // Lowercase for case-insensitive match
      route = route.toLowerCase();

      [states] = await pool.query('SELECT * FROM states WHERE LOWER(route) = ?', [route]);
    }
    if (states.length === 0) {
      return res.status(404).json({ message: 'State not found' });
    }
    
    const state = states[0];
    // Format image URL
    state.image = state.image ? `${process.env.API_BASE_URL || 'http://localhost:5000'}${state.image}` : null;

    // Fetch history for this state
    const [history] = await pool.query('SELECT * FROM state_history WHERE state_id = ?', [state.id]);
    // Format image URLs in history
    const formattedHistory = history.map(item => ({
      ...item,
      image: item.image
        ? (item.image.startsWith('http') ? item.image : `${process.env.API_BASE_URL || 'http://localhost:5000'}${item.image}`)
        : null
    }));
    // Add history to state object
    state.history = formattedHistory;

    res.json(state);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch state', error: error.message });
  }
});

// Delete a state
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // First get the state details to get the image path
    const [states] = await connection.query('SELECT * FROM states WHERE id = ?', [req.params.id]);
    if (states.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'State not found',
        requestedId: req.params.id,
        message: 'No state exists with the provided ID'
      });
    }

    const state = states[0];
    // Delete the image file if it exists
    if (state.image && state.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', '..', state.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        } else {
        }
    }

    // Delete related records first (if any)
    await connection.query('DELETE FROM state_images WHERE state_id = ?', [req.params.id]);
    
    await connection.query('DELETE FROM state_history WHERE state_id = ?', [req.params.id]);
    
    // Delete the state
    const [result] = await connection.query('DELETE FROM states WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'State not found',
        requestedId: req.params.id,
        message: 'Delete operation did not affect any rows'
      });
    }

    await connection.commit();
    res.json({ 
      message: 'State deleted successfully',
      deletedState: {
        id: state.id,
        name: state.name
      }
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ 
      error: 'Failed to delete state',
      details: error.message,
      requestedId: req.params.id
    });
  } finally {
    connection.release();
  }
});

// Create new state
router.post('/', upload.single('image'), handleMulterError, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      name,
      description,
      emoji,
      capital,
      activities,
      metaTitle,
      metaDescription,
      metaKeywords,
      route
    } = req.body;

    // Validate required fields
    if (!name || !description || !capital || !activities || !route) {
      throw new Error('Missing required fields');
    }

    // Normalize route: always start with / and lowercase
    let normalizedRoute = route.toLowerCase();
    if (!normalizedRoute.startsWith('/')) {
      normalizedRoute = '/' + normalizedRoute;
    }

    // Check if route already exists
    const [existingStates] = await connection.query(
      'SELECT id FROM states WHERE route = ?',
      [normalizedRoute]
    );

    if (existingStates.length > 0) {
      throw new Error('A state with this route already exists');
    }

    // Insert new state
    const [result] = await connection.query(
      `INSERT INTO states (
        name, description, emoji, capital, activities,
        meta_title, meta_description, meta_keywords,
        route, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        emoji,
        capital,
        activities,
        metaTitle,
        metaDescription,
        metaKeywords,
        normalizedRoute,
        req.file ? `/uploads/${req.file.filename}` : null
      ]
    );

    // Get the newly created state
    const [newState] = await connection.query(
      'SELECT * FROM states WHERE id = ?',
      [result.insertId]
    );

    await connection.commit();

    // Format image URL in response
    const formattedState = {
      ...newState[0],
      image: newState[0].image ? `${process.env.API_BASE_URL || 'http://localhost:5000'}${newState[0].image}` : null
    };

    res.status(201).json(formattedState);
  } catch (error) {
    await connection.rollback();
    // If there was a file upload and an error occurred, delete the file
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(400).json({ 
      error: error.message || 'Failed to create state',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

// Update state
router.put('/:id', upload.single('image'), handleMulterError, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const stateId = req.params.id;
    const {
      name,
      description,
      emoji,
      capital,
      activities,
      metaTitle,
      metaDescription,
      metaKeywords,
      route
    } = req.body;

    // Validate required fields
    if (!name || !description || !capital || !activities || !route) {
      throw new Error('Missing required fields');
    }

    // Normalize route: always start with / and lowercase
    let normalizedRoute = route.toLowerCase();
    if (!normalizedRoute.startsWith('/')) {
      normalizedRoute = '/' + normalizedRoute;
    }

    // Check if route already exists for other states
    const [existingStates] = await connection.query(
      'SELECT id FROM states WHERE route = ? AND id != ?',
      [normalizedRoute, stateId]
    );

    if (existingStates.length > 0) {
      throw new Error('A state with this route already exists');
    }

    // Get current state to check if we need to delete old image
    const [currentState] = await connection.query(
      'SELECT image FROM states WHERE id = ?',
      [stateId]
    );

    if (currentState.length === 0) {
      throw new Error('State not found');
    }

    // If new image is uploaded, delete old image
    if (req.file && currentState[0].image) {
      const oldImagePath = path.join(__dirname, '..', '..', currentState[0].image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update state
    const [result] = await connection.query(
      `UPDATE states SET 
        name = ?,
        description = ?,
        emoji = ?,
        capital = ?,
        activities = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        route = ?,
        image = COALESCE(?, image)
      WHERE id = ?`,
      [
        name,
        description,
        emoji,
        capital,
        activities,
        metaTitle,
        metaDescription,
        metaKeywords,
        normalizedRoute,
        req.file ? `/uploads/${req.file.filename}` : null,
        stateId
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error('State not found');
    }

    // Get the updated state
    const [updatedState] = await connection.query(
      'SELECT * FROM states WHERE id = ?',
      [stateId]
    );

    await connection.commit();

    // Format image URL in response
    const formattedState = {
      ...updatedState[0],
      image: updatedState[0].image ? `${process.env.API_BASE_URL || 'http://localhost:5000'}${updatedState[0].image}` : null
    };

    res.json(formattedState);
  } catch (error) {
    await connection.rollback();
    // If there was a file upload and an error occurred, delete the file
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(400).json({ 
      error: error.message || 'Failed to update state',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router; 