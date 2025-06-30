const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validateAccommodation } = require('../middleware/validation');

// Increase body parser limits
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multer config for multiple images
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
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per file
    fieldSize: 10 * 1024 * 1024, // 10MB per field
    fields: 50 // Maximum number of fields
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  }
});

// Helper to clean image path
const cleanImagePath = (file) => {
  if (!file) return '';
  return file.filename; // Only filename, no uploads/
};

// Helper to generate unique slug
const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;
  let exists = true;
  while (exists) {
    const [rows] = await db.query('SELECT id FROM hotels WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  return slug;
};

// Get all accommodations with type filter
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = `
      SELECT h.*, s.name as state_name 
      FROM hotels h
      LEFT JOIN states s ON h.state_id = s.id
    `;
    const params = [];

    if (type) {
      query += ' WHERE h.accommodation_type = ?';
      params.push(type);
    }

    const [accommodations] = await db.query(query, params);
    
    // Add full URL for featured images and ensure state_name is included
    const accommodationsWithFullUrls = accommodations.map(hotel => ({
      ...hotel,
      featured_image: hotel.featured_image ? `http://localhost:5000/uploads/${hotel.featured_image}` : null,
      state_name: hotel.state_name || 'N/A'
    }));

    res.json(accommodationsWithFullUrls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accommodations' });
  }
});

// Get hotel by ID with images and rooms
router.get('/:id', async (req, res) => {
  try {
    const [hotelRows] = await db.query(`
      SELECT h.*, s.name as state_name, s.id as state_id 
      FROM hotels h
      LEFT JOIN states s ON h.state_id = s.id 
      WHERE h.id = ?`, 
      [req.params.id]
    );
    
    if (hotelRows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    const hotel = hotelRows[0];

    // Get images for this hotel
    const [images] = await db.query('SELECT * FROM hotel_images WHERE hotel_id = ?', [req.params.id]);
    hotel.images = images.map(img => ({
      ...img,
      url: img.url.startsWith('http') ? img.url : `http://localhost:5000/uploads/${img.url}`
    }));

    // Get rooms for this hotel
    const [rooms] = await db.query('SELECT * FROM hotel_rooms WHERE hotel_id = ?', [req.params.id]);
    hotel.rooms = rooms;

    // Add full URL for featured image
    if (hotel.featured_image) {
      hotel.featured_image = hotel.featured_image.startsWith('http') 
        ? hotel.featured_image 
        : `http://localhost:5000/uploads/${hotel.featured_image}`;
    }

    // Parse amenities and features if they are strings
    if (typeof hotel.amenities === 'string') {
      try {
        hotel.amenities = JSON.parse(hotel.amenities);
      } catch (e) {
        hotel.amenities = [];
      }
    }

    if (typeof hotel.resort_features === 'string') {
      try {
        hotel.resort_features = JSON.parse(hotel.resort_features);
      } catch (e) {
        hotel.resort_features = [];
      }
    }

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotel', error: error.message });
  }
});

// Create new accommodation
router.post('/', upload.fields([
  { name: 'featured_image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), validateAccommodation, async (req, res) => {
  try {
    const {
      name,
      slug,
      category_id,
      state_id,
      location,
      address,
      phone_number,
      description,
      star_rating,
      price_per_night,
      total_rooms,
      available_rooms,
      amenities,
      check_in_time,
      check_out_time,
      latitude,
      longitude,
      meta_title,
      meta_description,
      meta_keywords,
      accommodation_type,
      tent_capacity,
      tent_type,
      resort_category,
      resort_features,
      homestay_features,
      hostel_features,
      guesthouse_features
    } = req.body;

    // Handle image uploads
    const featuredImage = req.files.featured_image ? cleanImagePath(req.files.featured_image[0]) : null;

    // Generate slug if not provided
    const finalSlug = slug || await generateUniqueSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

    // Parse amenities if it's a string
    const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;

    // Parse resort features if it's a string
    const parsedResortFeatures = resort_features && resort_features !== '' ? 
      (typeof resort_features === 'string' ? JSON.parse(resort_features) : resort_features) : 
      [];

    // Handle tent capacity
    let parsedTentCapacity = null;
    if (accommodation_type === 'tent') {
      if (tent_capacity && Number(tent_capacity) > 0) {
        parsedTentCapacity = Number(tent_capacity);
      } else {
        throw new Error('tent_capacity must be a positive number for tents');
      }
    } else {
      parsedTentCapacity = null;
    }

    // Handle tent type
    const parsedTentType = accommodation_type === 'tent' ? 
      (tent_type && tent_type !== '' ? tent_type : null) : 
      null;

    // Handle accommodation type specific features
    const parsedHomestayFeatures = accommodation_type === 'homestay' ? 
      (homestay_features && homestay_features !== '' ? homestay_features : '[]') : 
      '[]';

    const parsedHostelFeatures = accommodation_type === 'hostel' ? 
      (hostel_features && hostel_features !== '' ? hostel_features : '[]') : 
      '[]';

    const parsedGuesthouseFeatures = accommodation_type === 'guesthouse' ? 
      (guesthouse_features && guesthouse_features !== '' ? guesthouse_features : '[]') : 
      '[]';

    // Handle numeric fields
    const parsedStarRating = star_rating ? parseFloat(star_rating) : null;
    const parsedPricePerNight = price_per_night ? parseFloat(price_per_night) : null;
    const parsedTotalRooms = total_rooms ? parseInt(total_rooms) : null;
    const parsedAvailableRooms = available_rooms ? parseInt(available_rooms) : null;
    const parsedLatitude = (latitude && latitude !== '' && latitude !== 'null') ? parseFloat(latitude) : null;
    const parsedLongitude = (longitude && longitude !== '' && longitude !== 'null') ? parseFloat(longitude) : null;

    // Add this validation logic:
    const totalRooms = Number(req.body.total_rooms);
    const availableRooms = Number(req.body.available_rooms);
    if (!isNaN(totalRooms) && !isNaN(availableRooms) && availableRooms > totalRooms) {
      return res.status(400).json({ message: 'Available rooms cannot be greater than total rooms' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insert hotel with state_id
      const [result] = await connection.query(
        `INSERT INTO hotels (
          name, slug, category_id, state_id, location, address, phone_number,
          description, star_rating, price_per_night, total_rooms,
          available_rooms, amenities, check_in_time, check_out_time,
          latitude, longitude, meta_title, meta_description, meta_keywords,
          featured_image, accommodation_type, tent_capacity, tent_type,
          resort_category, resort_features, homestay_features,
          hostel_features, guesthouse_features
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, finalSlug, category_id, state_id, location, address, phone_number,
          description, parsedStarRating, parsedPricePerNight, parsedTotalRooms,
          parsedAvailableRooms, JSON.stringify(parsedAmenities), check_in_time, check_out_time,
          parsedLatitude, parsedLongitude, meta_title, meta_description, meta_keywords,
          featuredImage, accommodation_type, parsedTentCapacity, parsedTentType,
          resort_category, JSON.stringify(parsedResortFeatures), parsedHomestayFeatures,
          parsedHostelFeatures, parsedGuesthouseFeatures
        ]
      );

      const hotelId = result.insertId;

      // Insert images into hotel_images table with alt_text and description
      if (req.files.images && req.files.images.length > 0) {
        const imageValues = req.files.images.map((file, index) => [
          hotelId,
          cleanImagePath(file),
          req.body[`alt_text_${index}`] || '',
          req.body[`description_${index}`] || ''
        ]);
        if (imageValues.length > 0) {
          await connection.query(
            'INSERT INTO hotel_images (hotel_id, url, alt_text, description) VALUES ?',
            [imageValues]
          );
        }
      }

      await connection.commit();
      res.status(201).json({
        message: 'Accommodation created successfully',
        id: hotelId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating accommodation: ' + error.message });
  }
});

// Update accommodation
router.put('/:id', upload.array('images', 10), validateAccommodation, async (req, res) => {
  try {
    const {
      name,
      slug,
      category_id,
      state_id,
      location,
      address,
      phone_number,
      description,
      star_rating,
      price_per_night,
      total_rooms,
      available_rooms,
      amenities,
      check_in_time,
      check_out_time,
      latitude,
      longitude,
      meta_title,
      meta_description,
      meta_keywords,
      accommodation_type,
      tent_capacity,
      tent_type,
      resort_category, 
      resort_features,
      homestay_features,
      hostel_features,
      guesthouse_features,
      remove_images // Get remove_images from request body
    } = req.body;

    // Add this validation logic:
    const totalRooms = Number(req.body.total_rooms);
    const availableRooms = Number(req.body.available_rooms);
    if (!isNaN(totalRooms) && !isNaN(availableRooms) && availableRooms > totalRooms) {
      return res.status(400).json({ message: 'Available rooms cannot be greater than total rooms' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Handle image removal first
      if (remove_images) {
        try {
          const imageIds = JSON.parse(remove_images);
          if (Array.isArray(imageIds) && imageIds.length > 0) {
            // First get the image URLs to delete the files
            const [imagesToDelete] = await connection.query(
              'SELECT url FROM hotel_images WHERE id IN (?)',
              [imageIds]
            );
            
            // Delete the image files from the uploads directory
            for (const image of imagesToDelete) {
              const filePath = path.join(__dirname, '../uploads', image.url);
              try {
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }
              } catch (err) {
              }
            }

            // Delete the database records
            const [deleteResult] = await connection.query(
              'DELETE FROM hotel_images WHERE id IN (?)',
              [imageIds]
            );
          }
        } catch (error) {
          throw new Error('Failed to remove images: ' + error.message);
        }
      }

      // Handle new image uploads with proper alt text and description
      if (req.files && req.files.length > 0) {
        const imageValues = req.files.map((file, index) => {
          // Get alt text and description from request body
          const altText = req.body[`alt_text_${index}`] || '';
          const imageDescription = req.body[`description_${index}`] || '';
          
          return [
            req.params.id,
            cleanImagePath(file),
            altText,
            imageDescription
          ];
        });

        if (imageValues.length > 0) {
          await connection.query(
            'INSERT INTO hotel_images (hotel_id, url, alt_text, description) VALUES ?',
            [imageValues]
          );
        }
      }

      // Update hotel details with state_id
      const [result] = await connection.query(
        `UPDATE hotels SET
          name = ?, slug = ?, category_id = ?, state_id = ?, location = ?, address = ?,
          phone_number = ?, description = ?, star_rating = ?, price_per_night = ?,
          total_rooms = ?, available_rooms = ?, amenities = ?, check_in_time = ?,
          check_out_time = ?, latitude = ?, longitude = ?, meta_title = ?,
          meta_description = ?, meta_keywords = ?, accommodation_type = ?,
          tent_capacity = ?, tent_type = ?, resort_category = ?, resort_features = ?,
          homestay_features = ?, hostel_features = ?, guesthouse_features = ?
        WHERE id = ?`,
        [
          name, slug, category_id, state_id, location, address, phone_number,
          description, star_rating, price_per_night, total_rooms,
          available_rooms, amenities, check_in_time, check_out_time,
          latitude, longitude, meta_title, meta_description, meta_keywords,
          accommodation_type, tent_capacity, tent_type, resort_category,
          resort_features, homestay_features, hostel_features,
          guesthouse_features, req.params.id
        ]
      );

      if (result.affectedRows === 0) {
        throw new Error('Hotel not found');
      }

      // Commit transaction
      await connection.commit();
      // Get updated hotel with images
      const [updatedHotel] = await db.query('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
      const [images] = await db.query('SELECT * FROM hotel_images WHERE hotel_id = ?', [req.params.id]);
      
      const response = {
        ...updatedHotel[0],
        images: images.map(img => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `http://localhost:5000/uploads/${img.url}`
        }))
      };

      res.json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating accommodation: ' + error.message });
  }
});

// Get amenities by accommodation type
router.get('/amenities/:type', async (req, res) => {
  try {
    const [amenities] = await db.query(
      'SELECT * FROM accommodation_amenities WHERE accommodation_type = ?',
      [req.params.type]
    );
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching amenities' });
  }
});

// Get all hotels with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      state,
      location, 
      minPrice, 
      maxPrice, 
      rating,
      page = 1,
      limit = 10
    } = req.query;

    let query = `
      SELECT 
        h.*,
        s.name as state_name,
        s.id as state_id,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', hi.id,
            'url', hi.url,
            'alt_text', hi.alt_text,
            'description', hi.description
          )
        ) as images
      FROM hotels h
      LEFT JOIN states s ON h.state_id = s.id
      LEFT JOIN hotel_images hi ON h.id = hi.hotel_id
      WHERE h.is_active = true
    `;
    const params = [];

    if (category) {
      query += ' AND h.category_id = ?';
      params.push(category);
    }

    if (state) {
      query += ' AND h.state_id = ?';
      params.push(state);
    }

    if (location) {
      query += ' AND h.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (minPrice) {
      query += ' AND h.price_per_night >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND h.price_per_night <= ?';
      params.push(maxPrice);
    }

    if (rating) {
      query += ' AND h.star_rating >= ?';
      params.push(rating);
    }

    query += ' GROUP BY h.id, s.name, s.id';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [hotels] = await db.query(query, params);
    
    // Parse the images JSON string to array and format featured_image path
    const parsedHotels = hotels.map(hotel => {
      return {
        ...hotel,
        featured_image: hotel.featured_image ? `http://localhost:5000/uploads/${hotel.featured_image}` : null,
        images: hotel.images ? hotel.images.split(',').map(img => JSON.parse(img)) : [],
        state_name: hotel.state_name || 'N/A',
        state_id: hotel.state_id || null
      };
    });

    res.json(parsedHotels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels: ' + error.message });
  }
});

// Create new hotel
router.post('/', upload.array('images'), async (req, res) => {
  try {
    const {
      name,
      slug,
      category_id,
      location,
      address,
      phone_number,
      description,
      star_rating,
      price_per_night,
      total_rooms,
      available_rooms,
      amenities,
      check_in_time,
      check_out_time,
      latitude,
      longitude,
      meta_title,
      meta_description,
      meta_keywords,
      hotel_type
    } = req.body;

    // Handle uploaded images
    const images = req.files.map(file => `uploads/hotels/${file.filename}`);
    const thumbnail_image = images[0] || null;

    // Add this validation logic:
    const totalRooms = Number(req.body.total_rooms);
    const availableRooms = Number(req.body.available_rooms);
    if (!isNaN(totalRooms) && !isNaN(availableRooms) && availableRooms > totalRooms) {
      return res.status(400).json({ message: 'Available rooms cannot be greater than total rooms' });
    }

    const [result] = await db.query(
      `INSERT INTO hotels (
        name, slug, category_id, location, address, phone_number,
        description, star_rating, price_per_night, total_rooms,
        available_rooms, amenities, images, thumbnail_image,
        check_in_time, check_out_time, latitude, longitude,
        meta_title, meta_description, meta_keywords, hotel_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, slug, category_id, location, address, phone_number,
        description, star_rating, price_per_night, total_rooms,
        available_rooms, JSON.stringify(amenities), JSON.stringify(images),
        thumbnail_image, check_in_time, check_out_time, latitude,
        longitude, meta_title, meta_description, meta_keywords, hotel_type
      ]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Hotel created successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating hotel' });
  }
});

// Update hotel
router.put('/:id', upload.array('images'), async (req, res) => {
  try {
    const {
      name,
      slug,
      category_id,
      location,
      address,
      phone_number,
      description,
      star_rating,
      price_per_night,
      total_rooms,
      available_rooms,
      amenities,
      check_in_time,
      check_out_time,
      latitude,
      longitude,
      meta_title,
      meta_description,
      meta_keywords,
      accommodation_type,
      tent_capacity,
      tent_type,
      resort_category,
      resort_features,
      homestay_features,
      hostel_features,
      guesthouse_features,
      remove_images // Array of image IDs to remove
    } = req.body;


    // Add this validation logic:
    const totalRooms = Number(req.body.total_rooms);
    const availableRooms = Number(req.body.available_rooms);
    if (!isNaN(totalRooms) && !isNaN(availableRooms) && availableRooms > totalRooms) {
      return res.status(400).json({ message: 'Available rooms cannot be greater than total rooms' });
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Remove specified images
      if (remove_images) {
        const imageIds = JSON.parse(remove_images);
        if (imageIds.length > 0) {
          await db.query('DELETE FROM hotel_images WHERE id IN (?)', [imageIds]);
        }
      }

      // Handle new image uploads
      const newImages = req.files || [];
      const imageValues = newImages.map((file, index) => [
        req.params.id,
        cleanImagePath(file),
        req.body[`alt_text_${index}`] || '',
        req.body[`description_${index}`] || ''
      ]);
      if (imageValues.length > 0) {
        await db.query(
          'INSERT INTO hotel_images (hotel_id, url, alt_text, description) VALUES ?',
          [imageValues]
        );
      }

      // Update hotel details
      const [result] = await db.query(
        `UPDATE hotels SET
          name = ?, slug = ?, category_id = ?, location = ?, address = ?,
          phone_number = ?, description = ?, star_rating = ?, price_per_night = ?,
          total_rooms = ?, available_rooms = ?, amenities = ?, check_in_time = ?,
          check_out_time = ?, latitude = ?, longitude = ?, meta_title = ?,
          meta_description = ?, meta_keywords = ?, accommodation_type = ?,
          tent_capacity = ?, tent_type = ?, resort_category = ?, resort_features = ?,
          homestay_features = ?, hostel_features = ?, guesthouse_features = ?
        WHERE id = ?`,
        [
          name, slug, category_id, location, address, phone_number,
          description, star_rating, price_per_night, total_rooms,
          available_rooms, amenities, check_in_time, check_out_time,
          latitude, longitude, meta_title, meta_description, meta_keywords,
          accommodation_type, tent_capacity, tent_type, resort_category,
          resort_features, homestay_features, hostel_features,
          guesthouse_features, req.params.id
        ]
      );

      if (result.affectedRows === 0) {
        throw new Error('Hotel not found');
      }

      // Commit transaction
      await db.commit();

      // Get updated hotel with images
      const [updatedHotel] = await db.query('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
      const [images] = await db.query('SELECT * FROM hotel_images WHERE hotel_id = ?', [req.params.id]);
      
      const response = {
        ...updatedHotel[0],
        images: images.map(img => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `http://localhost:5000/uploads/${img.url}`
        }))
      };

      res.json(response);
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating hotel', error: error.message });
  }
});

// Delete hotel
router.delete('/:id', async (req, res) => {
  try {
    // First delete associated images
    await db.query('DELETE FROM hotel_images WHERE hotel_id = ?', [req.params.id]);
    
    // Then delete the hotel
    const [result] = await db.query('DELETE FROM hotels WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hotel' });
  }
});

// Room Management Routes

// Get all rooms for a hotel
router.get('/:hotelId/rooms', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM hotel_rooms WHERE hotel_id = ?', [req.params.hotelId]);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

// Add a new room to a hotel
router.post('/:hotelId/rooms', async (req, res) => {
  try {
    const { type, total_rooms, available_rooms, peak_season_price, off_season_price } = req.body;
    const hotelId = req.params.hotelId;

    const [result] = await db.query(
      'INSERT INTO hotel_rooms (hotel_id, type, total_rooms, available_rooms, peak_season_price, off_season_price) VALUES (?, ?, ?, ?, ?, ?)',
      [hotelId, type, total_rooms, available_rooms, peak_season_price, off_season_price]
    );

    res.status(201).json({ id: result.insertId, message: 'Room added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding room' });
  }
});

// Update a room
router.put('/:hotelId/rooms/:roomId', async (req, res) => {
  try {
    const { type, total_rooms, available_rooms, peak_season_price, off_season_price } = req.body;
    const { hotelId, roomId } = req.params;

    await db.query(
      'UPDATE hotel_rooms SET type = ?, total_rooms = ?, available_rooms = ?, peak_season_price = ?, off_season_price = ? WHERE id = ? AND hotel_id = ?',
      [type, total_rooms, available_rooms, peak_season_price, off_season_price, roomId, hotelId]
    );

    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room' });
  }
});

// Delete a room
router.delete('/:hotelId/rooms/:roomId', async (req, res) => {
  try {
    const { hotelId, roomId } = req.params;
    await db.query('DELETE FROM hotel_rooms WHERE id = ? AND hotel_id = ?', [roomId, hotelId]);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room' });
  }
});

// Update accommodation type
router.patch('/:id/accommodation-type', async (req, res) => {
  try {
    const { id } = req.params;
    const { accommodation_type } = req.body;

    // Validate accommodation type
    const validTypes = ['hotel', 'tent', 'resort', 'homestay', 'hostel', 'guesthouse', 'cottage'];
    if (!validTypes.includes(accommodation_type)) {
      return res.status(400).json({ 
        message: 'Invalid accommodation type. Must be one of: ' + validTypes.join(', ') 
      });
    }

    const [result] = await db.query(
      'UPDATE hotels SET accommodation_type = ? WHERE id = ?',
      [accommodation_type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ 
      message: 'Accommodation type updated successfully',
      accommodation_type 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating accommodation type' });
  }
});

// Get hotels by amenity
router.get('/amenity/:amenityName', async (req, res) => {
  try {
    const { amenityName } = req.params;
    
    // Get hotels that have this amenity
    const [hotels] = await db.query(`
      SELECT DISTINCT h.* 
      FROM hotels h
      INNER JOIN hotel_amenities ha ON h.id = ha.hotel_id
      INNER JOIN amenities a ON ha.amenity_id = a.id
      WHERE a.name = ?
    `, [amenityName]);

    // Add full URLs for featured images
    const hotelsWithFullUrls = hotels.map(hotel => ({
      ...hotel,
      featured_image: hotel.featured_image ? `http://localhost:5000/uploads/${hotel.featured_image}` : null
    }));

    res.json(hotelsWithFullUrls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels by amenity' });
  }
});

// Add error handling middleware
const errorHandler = (err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ message: 'This accommodation already exists' });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ message: 'Invalid category selected' });
  }

  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({ message: 'Invalid data provided' });
  }

  if (err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(400).json({ message: 'Invalid field in request' });
  }

  if (err.code === 'ER_PARSE_ERROR') {
    return res.status(400).json({ message: 'Invalid SQL query' });
  }

  res.status(500).json({ message: 'Internal server error: ' + err.message });
};

router.use(errorHandler);

module.exports = router;
