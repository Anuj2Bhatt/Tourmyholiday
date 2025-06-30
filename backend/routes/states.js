const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
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

const upload = multer({ storage: storage });

// Fix foreign key constraints for state_images
router.post('/fix-constraints', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // First check if the constraint exists
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_NAME = 'state_images' 
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `);
    
    if (constraints.length > 0) {
      // Drop existing foreign key constraint
      await connection.query(`
        ALTER TABLE state_images 
        DROP FOREIGN KEY ${constraints[0].CONSTRAINT_NAME}
      `);
      }
    
    // Add new foreign key constraint with CASCADE
    await connection.query(`
      ALTER TABLE state_images 
      ADD CONSTRAINT state_images_ibfk_1 
      FOREIGN KEY (state_id) 
      REFERENCES states(id) 
      ON DELETE CASCADE
    `);
    await connection.commit();
    res.json({ 
      message: 'Foreign key constraints updated successfully',
      details: 'Added ON DELETE CASCADE to state_images foreign key'
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ 
      error: 'Failed to update constraints',
      details: error.message 
    });
  } finally {
    connection.release();
  }
});

// GET all states
router.get('/', async (req, res) => {
  try {
    // First get Uttarakhand
    const [uttarakhand] = await db.query('SELECT * FROM states WHERE name = ?', ['Uttarakhand']);
    
    // Then get all other states
    const [otherStates] = await db.query('SELECT * FROM states WHERE name != ? ORDER BY name ASC', ['Uttarakhand']);
    
    // Combine the results with Uttarakhand first
    const allStates = [...uttarakhand, ...otherStates];
    
    // Format image paths
    const formattedStates = allStates.map(state => ({
      ...state,
      image: state.image ? `http://localhost:5000/uploads/${path.basename(state.image)}` : null
    }));
    
    res.json(formattedStates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states', details: error.message });
  }
});

// POST create a new state
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      emoji,
      capital,
      activities, 
      metaTitle, 
      metaDescription, 
      metaKeywords 
    } = req.body;

    // Handle image path
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO states (
        name, 
        image, 
        description, 
        emoji,
        capital,
        activities, 
        meta_title, 
        meta_description, 
        meta_keywords, 
        route
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        imagePath, 
        description, 
        emoji,
        capital,
        activities, 
        metaTitle, 
        metaDescription, 
        metaKeywords, 
        `/${name.toLowerCase()}`
      ]
    );

    res.status(201).json({ 
      id: result.insertId, 
      ...req.body,
      image: imagePath ? `http://localhost:5000/${imagePath}` : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create state', details: error.message });
  }
});

// PUT update a state
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      emoji,
      capital,
      activities, 
      metaTitle, 
      metaDescription, 
      metaKeywords 
    } = req.body;

    // Handle image path
    let imagePath = req.body.image; // Keep existing image if no new file uploaded
    if (req.file) {
      imagePath = `uploads/${req.file.filename}`;
    }

    const [result] = await db.query(
      `UPDATE states SET 
        name = ?, 
        image = ?, 
        description = ?, 
        emoji = ?,
        capital = ?,
        activities = ?, 
        meta_title = ?, 
        meta_description = ?, 
        meta_keywords = ?, 
        route = ?
      WHERE id = ?`,
      [
        name, 
        imagePath, 
        description, 
        emoji,
        capital,
        activities, 
        metaTitle, 
        metaDescription, 
        metaKeywords, 
        `/${name.toLowerCase()}`, 
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'State not found' });
    }

    res.json({ 
      id, 
      ...req.body,
      image: imagePath ? `http://localhost:5000/${imagePath}` : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update state', details: error.message });
  }
});

// GET specific state data
router.get('/:stateName', async (req, res) => {
  try {
    const { stateName } = req.params;
    // Skip if the stateName is 'manage-states' or any other admin route
    if (stateName === 'manage-states' || stateName.startsWith('admin')) {
      return res.status(404).json({ error: 'Invalid state name' });
    }

    // First try to find by route
    let [stateRows] = await db.query(
      'SELECT * FROM states WHERE route = ? OR route = ? OR name = ? OR LOWER(REPLACE(name, " ", "-")) = ?',
      [`/${stateName}`, stateName, stateName, stateName]
    );

    if (stateRows.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }

    const state = stateRows[0];
    
    // Format image path
    if (state.image) {
      state.image = `http://localhost:5000/uploads/${path.basename(state.image)}`;
    }

    // Get state images
    const [imageRows] = await db.query(
      'SELECT * FROM state_images WHERE state_id = ?',
      [state.id]
    );

    // Format image paths for state images
    const formattedImages = imageRows.map(img => ({
      ...img,
      url: img.url ? `http://localhost:5000/uploads/${path.basename(img.url)}` : null
    }));

    // Get state history
    const [historyRows] = await db.query(
      'SELECT * FROM state_history WHERE state_id = ? ORDER BY id',
      [state.id]
    );

    // Format image paths for history
    const formattedHistory = historyRows.map(history => ({
      ...history,
      image: history.image ? (history.image.startsWith('http') ? history.image : `http://localhost:5000/uploads/${path.basename(history.image)}`) : null
    }));

    // Get districts for this state
    const [districtRows] = await db.query(
      'SELECT * FROM districts WHERE state_name = ?',
      [state.name]
    );

    // Format image paths for districts
    const formattedDistricts = districtRows.map(district => ({
      ...district,
      image: district.image ? `http://localhost:5000/uploads/${path.basename(district.image)}` : null
    }));

    // Combine all data
    const stateData = {
      ...state,
      images: formattedImages,
      history: formattedHistory,
      districts: formattedDistricts
    };

    res.json(stateData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch state data',
      details: error.message 
    });
  }
});

// DELETE a state
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    // First get the state details to get the image path and name
    const [states] = await connection.query('SELECT * FROM states WHERE id = ?', [id]);
    if (states.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'State not found',
        requestedId: id,
        message: 'No state exists with the provided ID'
      });
    }

    const state = states[0];
    // Delete related records first
    // Get and delete state images first
    const [stateImages] = await connection.query('SELECT * FROM state_images WHERE state_id = ?', [id]);
    // Delete image files for state_images
    for (const image of stateImages) {
      if (image.url && image.url.startsWith('/uploads/')) {
        const imagePath = path.join(__dirname, '..', image.url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          } else {
          }
      }
    }
    
    // Delete state_images records
    await connection.query('DELETE FROM state_images WHERE state_id = ?', [id]);
    // Delete places (has ON DELETE CASCADE)
    await connection.query('DELETE FROM places WHERE state_id = ?', [id]);
    // Delete state season images (has ON DELETE CASCADE)
    await connection.query('DELETE FROM state_season_images WHERE state_id = ?', [id]);
    // Delete state history
    await connection.query('DELETE FROM state_history WHERE state_id = ?', [id]);
    // Delete districts that reference this state by name
    await connection.query('DELETE FROM districts WHERE state_name = ?', [state.name]);
    // Delete the state's main image file if it exists
    if (state.image && state.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', state.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        } else {
        }
    }

    // Finally delete the state
    const [result] = await connection.query('DELETE FROM states WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'State not found',
        requestedId: id,
        message: 'Delete operation did not affect any rows'
      });
    }

    await connection.commit();
    res.json({ 
      message: 'State and all related records deleted successfully',
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

module.exports = router; 