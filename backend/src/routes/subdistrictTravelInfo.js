const express = require('express');
const router = express.Router();
const pool = require('../../src/db');
const slugify = require('slugify');
const multer = require('multer');
const path = require('path');
const db = require('../../src/db');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const cleanName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-.]/g, '')
      .toLowerCase();
    cb(null, 'travel-' + uniqueSuffix + '-' + cleanName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get travel info for a state subdistrict
router.get('/state/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [travelInfo] = await pool.query(
      'SELECT * FROM subdistrict_travel_info WHERE subdistrict_id = ?',
      [subdistrictId]
    );

    if (travelInfo.length === 0) {
      return res.status(404).json({ message: 'Travel info not found' });
    }

    // Format all entries
    const formattedTravelInfo = travelInfo.map(info => ({
      ...info,
      featured_image: info.featured_image ? 
        `http://localhost:5000/${info.featured_image}` : 
        null
    }));
    res.json(formattedTravelInfo);
  } catch (error) {
    console.error('Error fetching travel info:', error);
    res.status(500).json({ message: 'Error fetching travel info' });
  }
});

// Add travel info for a state subdistrict
router.post('/state/:subdistrictId', upload.single('featured_image'), async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const {
      title,
      description,
      meta_title,
      meta_description,
      meta_keywords,
      best_time_to_visit,
      how_to_reach,
      accommodation,
      local_transport,
      safety_tips
    } = req.body;

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Check for duplicate slug only within the same subdistrict
    const [existing] = await pool.query(
      'SELECT id FROM subdistrict_travel_info WHERE slug = ? AND subdistrict_id = ?',
      [slug, subdistrictId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'A travel entry with this title already exists in this subdistrict' });
    }

    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO subdistrict_travel_info (
        subdistrict_id, title, slug, description, featured_image,
        meta_title, meta_description, meta_keywords,
        best_time_to_visit, how_to_reach, accommodation,
        local_transport, safety_tips
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subdistrictId, title, slug, description, imagePath,
        meta_title, meta_description, meta_keywords,
        best_time_to_visit, how_to_reach, accommodation,
        local_transport, safety_tips
      ]
    );

    const [newTravelInfo] = await pool.query(
      'SELECT * FROM subdistrict_travel_info WHERE id = ?',
      [result.insertId]
    );

    // Format the response to include full image URL
    const formattedTravelInfo = {
      ...newTravelInfo[0],
      featured_image: newTravelInfo[0].featured_image ? 
        `http://localhost:5000/${newTravelInfo[0].featured_image}` : 
        null
    };

    res.status(201).json(formattedTravelInfo);
  } catch (error) {
    console.error('Error adding travel info:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A travel entry with this title already exists in this subdistrict' });
    }
    res.status(500).json({ message: 'Error adding travel info' });
  }
});

// Update travel info
router.put('/:id', upload.single('featured_image'), async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    best_time_to_visit,
    how_to_reach,
    local_transport,
    accommodation,
    meta_title,
    meta_description,
    meta_keywords
  } = req.body;

  try {
    // First check if the travel info exists and get its subdistrict_id
    const [existingTravelInfo] = await db.query(
      'SELECT * FROM subdistrict_travel_info WHERE id = ?',
      [id]
    );

    if (existingTravelInfo.length === 0) {
      return res.status(404).json({ message: 'Travel information not found' });
    }

    // Generate slug from title if title is being updated
    let slug = existingTravelInfo[0].slug;
    if (title && title !== existingTravelInfo[0].title) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      // Check for duplicate slug only within the same subdistrict, excluding current entry
      const [duplicateSlug] = await db.query(
        'SELECT id FROM subdistrict_travel_info WHERE slug = ? AND subdistrict_id = ? AND id != ?',
        [slug, existingTravelInfo[0].subdistrict_id, id]
      );
      if (duplicateSlug.length > 0) {
        return res.status(400).json({ message: 'A travel entry with this title already exists in this subdistrict' });
      }
    }

    // Handle image update
    let imagePath = existingTravelInfo[0].featured_image;
    if (req.file) {
      // Delete old image if it exists
      if (existingTravelInfo[0].featured_image) {
        const oldImagePath = path.join(__dirname, '../../', existingTravelInfo[0].featured_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `uploads/${req.file.filename}`;
    }

    // Update travel info
    const [result] = await db.query(
      `UPDATE subdistrict_travel_info 
       SET title = COALESCE(?, title),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           featured_image = COALESCE(?, featured_image),
           best_time_to_visit = COALESCE(?, best_time_to_visit),
           how_to_reach = COALESCE(?, how_to_reach),
           local_transport = COALESCE(?, local_transport),
           accommodation = COALESCE(?, accommodation),
           meta_title = COALESCE(?, meta_title),
           meta_description = COALESCE(?, meta_description),
           meta_keywords = COALESCE(?, meta_keywords),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        slug,
        description,
        imagePath,
        best_time_to_visit,
        how_to_reach,
        local_transport,
        accommodation,
        meta_title,
        meta_description,
        meta_keywords,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Travel information not found' });
    }

    // Get updated travel info
    const [updatedTravelInfo] = await db.query(
      'SELECT * FROM subdistrict_travel_info WHERE id = ?',
      [id]
    );

    // Format the response
    const formattedTravelInfo = {
      ...updatedTravelInfo[0],
      featured_image: updatedTravelInfo[0].featured_image 
        ? `http://localhost:5000/${updatedTravelInfo[0].featured_image}`
        : null
    };

    res.json({
      message: 'Travel information updated successfully',
      travelInfo: formattedTravelInfo
    });

  } catch (error) {
    console.error('Error updating travel info:', error);
    res.status(500).json({ 
      message: 'Failed to update travel information',
      error: error.message 
    });
  }
});

// Delete travel info for state subdistrict
router.delete('/state/:travelInfoId', async (req, res) => {
  try {
    const { travelInfoId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM subdistrict_travel_info WHERE id = ?',
      [travelInfoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Travel info not found' });
    }

    res.json({ message: 'Travel info deleted successfully' });
  } catch (error) {
    console.error('Error deleting travel info:', error);
    res.status(500).json({ message: 'Error deleting travel info' });
  }
});

module.exports = router; 