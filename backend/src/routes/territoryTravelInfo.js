const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../../db');     
const slugify = require('slugify');
const fs = require('fs');

// Test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

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
    cb(null, 'territory-travel-' + uniqueSuffix + '-' + cleanName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
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

// Get all travel info for a territory subdistrict
router.get('/subdistrict/:subdistrictId', async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM territory_subdistrict_travel_info 
       WHERE territory_subdistrict_id = ?`,
      [subdistrictId]
    );

    // Parse JSON fields and format image URLs
    const travels = rows.map(travel => {
      // Convert Buffer to string if needed
      const parseJsonField = (field) => {
        if (!field) return {};
        if (Buffer.isBuffer(field)) {
          try {
            return JSON.parse(field.toString());
          } catch (e) {
            return {};
          }
        }
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch (e) {
            return {};
          }
        }
        return field || {};
      };

      return {
        id: travel.id,
        territory_subdistrict_id: travel.territory_subdistrict_id,
        title: travel.title,
        slug: travel.slug,
        description: travel.description,
        featured_image: travel.featured_image ? 
          `${process.env.API_BASE_URL || 'http://localhost:5000'}/${travel.featured_image}` : 
          null,
        meta_title: travel.meta_title,
        meta_description: travel.meta_description,
        meta_keywords: travel.meta_keywords,
        best_time_to_visit: travel.best_time_to_visit,
        transportation: parseJsonField(travel.transportation),
        accommodation: parseJsonField(travel.accommodation),
        local_cuisine: parseJsonField(travel.local_cuisine),
        travel_tips: parseJsonField(travel.travel_tips),
        created_at: travel.created_at,
        updated_at: travel.updated_at
      };
    });

    // Set proper content type header
    res.setHeader('Content-Type', 'application/json');
    res.json(travels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching travel information' });
  }
});

// Get single travel info by ID
router.get('/:travelInfoId', async (req, res) => {
  try {
    const { travelInfoId } = req.params;
    const [travel] = await db.query(
      `SELECT * FROM territory_subdistrict_travel_info WHERE id = ?`,
      [travelInfoId]
    );

    if (!travel) {
      return res.status(404).json({ message: 'Travel information not found' });
    }

    // Parse JSON fields and format image URL
    const parsedTravel = {
      ...travel,
      featured_image: travel.featured_image ? 
        `${process.env.API_BASE_URL || 'http://localhost:5000'}/${travel.featured_image}` : 
        null,
      transportation: JSON.parse(travel.transportation || '{}'),
      accommodation: JSON.parse(travel.accommodation || '{}'),
      local_cuisine: JSON.parse(travel.local_cuisine || '{}'),
      travel_tips: JSON.parse(travel.travel_tips || '{}')
    };

    res.json(parsedTravel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching travel information' });
  }
});

// Add new travel info for a territory subdistrict
router.post('/subdistrict/:subdistrictId', upload.single('featured_image'), async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const {
      title,
      description,
      meta_title,
      meta_description,
      meta_keywords,
      best_time_to_visit,
      transportation,
      accommodation,
      local_cuisine,
      travel_tips
    } = req.body;

    // Generate a unique slug by appending timestamp
    const timestamp = Date.now();
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${timestamp}`;

    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO territory_subdistrict_travel_info (
        territory_subdistrict_id,
        title,
        slug,
        description,
        featured_image,
        meta_title,
        meta_description,
        meta_keywords,
        best_time_to_visit,
        transportation,
        accommodation,
        local_cuisine,
        travel_tips
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      subdistrictId,
      title,
      slug,
      description,
      imagePath,
      meta_title,
      meta_description,
      meta_keywords,
      best_time_to_visit,
      transportation || '{}',
      accommodation || '{}',
      local_cuisine || '{}',
      travel_tips || '{}'
    ];

    const result = await db.query(query, params);

    // Get the newly created travel info
    const [newTravel] = await db.query(
      'SELECT * FROM territory_subdistrict_travel_info WHERE id = ?',
      [result.insertId]
    );

    // Format the response to include full image URL
    const formattedTravel = {
      ...newTravel,
      featured_image: newTravel.featured_image ? 
        `${process.env.API_BASE_URL || 'http://localhost:5000'}/${newTravel.featured_image}` : 
        null,
      transportation: JSON.parse(newTravel.transportation || '{}'),
      accommodation: JSON.parse(newTravel.accommodation || '{}'),
      local_cuisine: JSON.parse(newTravel.local_cuisine || '{}'),
      travel_tips: JSON.parse(newTravel.travel_tips || '{}')
    };

    res.status(201).json(formattedTravel);
  } catch (error) {
    res.status(500).json({ message: 'Error adding travel information' });
  }
});

// Update travel info
router.put('/:travelInfoId', upload.single('featured_image'), async (req, res) => {
  try {
    const { travelInfoId } = req.params;
    const {
      title,
      slug,
      description,
      meta_title,
      meta_description,
      meta_keywords,
      best_time_to_visit,
      transportation,
      accommodation,
      local_cuisine,
      travel_tips
    } = req.body;

    // Get the current travel info to get the subdistrict ID
    const [currentTravel] = await db.query(
      'SELECT territory_subdistrict_id FROM territory_subdistrict_travel_info WHERE id = ?',
      [travelInfoId]
    );

    if (!currentTravel) {
      return res.status(404).json({ message: 'Travel information not found' });
    }

    // Get current travel info to check if we need to delete old image
    const [currentTravelInfo] = await db.query(
      'SELECT featured_image FROM territory_subdistrict_travel_info WHERE id = ?',
      [travelInfoId]
    );

    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    // Update travel info
    await db.query(
      `UPDATE territory_subdistrict_travel_info SET
        title = ?,
        slug = ?,
        description = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        best_time_to_visit = ?,
        transportation = ?,
        accommodation = ?,
        local_cuisine = ?,
        travel_tips = ?,
        featured_image = CASE 
          WHEN ? IS NOT NULL THEN ?
          ELSE featured_image
        END
      WHERE id = ?`,
      [
        title,
        slug,
        description,
        meta_title,
        meta_description,
        meta_keywords,
        best_time_to_visit,
        transportation || '{}',
        accommodation || '{}',
        local_cuisine || '{}',
        travel_tips || '{}',
        imagePath,
        imagePath,
        travelInfoId
      ]
    );

    // If new image was uploaded and old image exists, delete old image
    if (req.file && currentTravelInfo?.featured_image) {
      const oldImagePath = path.join(__dirname, '../../', currentTravelInfo.featured_image);
      try {
        await fs.unlink(oldImagePath);
      } catch (err) {
        }
    }

    // Get the updated travel info
    const [updatedTravel] = await db.query(
      'SELECT * FROM territory_subdistrict_travel_info WHERE id = ?',
      [travelInfoId]
    );

    // Format the response to include full image URL
    const formattedTravel = {
      ...updatedTravel,
      featured_image: updatedTravel.featured_image ? 
        `${process.env.API_BASE_URL || 'http://localhost:5000'}/${updatedTravel.featured_image}` : 
        null,
      transportation: JSON.parse(updatedTravel.transportation || '{}'),
      accommodation: JSON.parse(updatedTravel.accommodation || '{}'),
      local_cuisine: JSON.parse(updatedTravel.local_cuisine || '{}'),
      travel_tips: JSON.parse(updatedTravel.travel_tips || '{}')
    };

    res.json(formattedTravel);
  } catch (error) {
    res.status(500).json({ message: 'Error updating travel information' });
  }
});

// Delete travel info
router.delete('/:travelInfoId', async (req, res) => {
  try {
    const { travelInfoId } = req.params;

    // Get travel info to delete associated image
    const [travel] = await db.query(
      'SELECT featured_image FROM territory_subdistrict_travel_info WHERE id = ?',
      [travelInfoId]
    );

    // Delete travel info
    await db.query(
      'DELETE FROM territory_subdistrict_travel_info WHERE id = ?',
      [travelInfoId]
    );

    // Delete associated image if exists
    if (travel?.featured_image) {
      const imagePath = path.join(__dirname, '../../', travel.featured_image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        }
    }

    res.json({ message: 'Travel information deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting travel information' });
  }
});

module.exports = router; 