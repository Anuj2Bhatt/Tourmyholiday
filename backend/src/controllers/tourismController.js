const pool = require('../../db');
const path = require('path');
const fs = require('fs').promises;

// Helper function to validate required fields
const validateTourismPackage = (data) => {
  const requiredFields = [
    'name', 'slug', 'short_description', 'description', 'price',
    'duration', 'tourism_type_id', 'trip_style_id', 'season_id', 
    'budget_category_id', 'location_name', 'best_time_to_visit', 
    'how_to_reach', 'activities', 'accommodation_types',
    'budget_range_min', 'budget_range_max', 'meta_title',
    'meta_description', 'meta_keywords', 'status'
  ];

  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

// Create a new tourism package
const createTourismPackage = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Validate request data
    validateTourismPackage(req.body);

    // Handle featured image - Modified to handle both new and existing images
    let featuredImage;
    if (req.files?.featured_image?.[0]) {
      // New image uploaded
      featuredImage = req.files.featured_image[0].filename;
      } else if (req.body.existing_featured_image) {
      // Using existing image
      featuredImage = req.body.existing_featured_image;
      } else if (req.body.id) {
      // This is an update, fetch existing image
      const [existingPackage] = await connection.query(
        'SELECT featured_image FROM tourism_packages WHERE id = ?',
        [req.body.id]
      );
      if (existingPackage[0]?.featured_image) {
        featuredImage = existingPackage[0].featured_image;
        } else {
        throw new Error('Featured image is required');
      }
    } else {
      // This is a new package without an image
      throw new Error('Featured image is required');
    }

    // Insert package data without checking for duplicate slug
    const [result] = await connection.query(
      `INSERT INTO tourism_packages (
        name, slug, short_description, description, price, duration,
        tourism_type_id, trip_style_id, season_id, budget_category_id, 
        location_name, latitude, longitude, featured_image, best_time_to_visit, 
        how_to_reach, activities, accommodation_types, budget_range_min, 
        budget_range_max, meta_title, meta_description, meta_keywords, status,
        is_active, is_featured, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.name, req.body.slug, req.body.short_description,
        req.body.description, req.body.price, req.body.duration,
        req.body.tourism_type_id, req.body.trip_style_id, req.body.season_id, 
        req.body.budget_category_id, req.body.location_name, 
        req.body.latitude || null, req.body.longitude || null,
        featuredImage, req.body.best_time_to_visit, req.body.how_to_reach,
        req.body.activities, req.body.accommodation_types, 
        req.body.budget_range_min, req.body.budget_range_max, 
        req.body.meta_title, req.body.meta_description,
        req.body.meta_keywords, req.body.status, 
        req.body.is_active ? 1 : 0, req.body.is_featured ? 1 : 0, 
        req.body.is_trending ? 1 : 0
      ]
    );

    const packageId = result.insertId;

    // Handle gallery images
    if (req.files?.gallery_images?.length > 0) {
      const galleryValues = req.files.gallery_images.map((file, index) => [
        packageId,
        file.filename,
        req.body.gallery_alt_texts?.[index] || file.originalname.split('.')[0],
        index
      ]);

      await connection.query(
        `INSERT INTO tourism_package_images (package_id, image_path, alt_text, display_order)
         VALUES ?`,
        [galleryValues]
      );
    }

    // Handle amenities
    if (req.body.amenities && Array.isArray(req.body.amenities)) {
      const amenityValues = req.body.amenities.map(amenityId => [packageId, amenityId]);
      await connection.query(
        `INSERT INTO tourism_package_amenities (package_id, amenity_id)
         VALUES ?`,
        [amenityValues]
      );
    }

    await connection.commit();

    // Fetch the created package with all relations
    const [package] = await connection.query(
      `SELECT tp.*, 
          tt.name as tourism_type,
          ts.name as trip_style,
          tse.name as season,
          bc.name as budget_category,
          GROUP_CONCAT(DISTINCT ta.name) as amenities,
          GROUP_CONCAT(DISTINCT tpi.image_path) as gallery_images
      FROM tourism_packages tp
      LEFT JOIN tourism_types tt ON tp.tourism_type_id = tt.id
      LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
      LEFT JOIN tourism_seasons tse ON tp.season_id = tse.id
      LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
      LEFT JOIN tourism_package_amenities tpa ON tp.id = tpa.package_id
      LEFT JOIN tourism_amenities ta ON tpa.amenity_id = ta.id
      LEFT JOIN tourism_package_images tpi ON tp.id = tpi.package_id
      WHERE tp.id = ?
      GROUP BY tp.id`,
      [packageId]
    );

    res.status(201).json({
      success: true,
      message: 'Tourism package created successfully',
      data: package[0]
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating tourism package',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Get all tourism packages with filters
const getAllTourismPackages = async (req, res) => {
  try {
    const {
      type,
      style,
      season,
      budget,
      status,
      is_active,
      is_featured,
      search,
      page = 1,
      limit = 10
    } = req.query;

    let query = `
      SELECT tp.*, 
          tt.name as tourism_type,
          ts.name as trip_style,
          tse.name as season,
          bc.name as budget_category,
          GROUP_CONCAT(DISTINCT ta.name) as amenities,
          GROUP_CONCAT(DISTINCT tpi.image_path ORDER BY tpi.display_order) as gallery_images
      FROM tourism_packages tp
      LEFT JOIN tourism_types tt ON tp.tourism_type_id = tt.id
      LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
      LEFT JOIN tourism_seasons tse ON tp.season_id = tse.id
      LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
      LEFT JOIN tourism_package_amenities tpa ON tp.id = tpa.package_id
      LEFT JOIN tourism_amenities ta ON tpa.amenity_id = ta.id
      LEFT JOIN tourism_package_images tpi ON tp.id = tpi.package_id
    `;

    const whereConditions = [];
    const queryParams = [];

    if (type) {
      whereConditions.push('tp.tourism_type_id = ?');
      queryParams.push(type);
    }
    if (style) {
      whereConditions.push('tp.trip_style_id = ?');
      queryParams.push(style);
    }
    if (season) {
      whereConditions.push('tp.season_id = ?');
      queryParams.push(season);
    }
    if (budget) {
      whereConditions.push('tp.budget_category_id = ?');
      queryParams.push(budget);
    }
    if (status) {
      whereConditions.push('tp.status = ?');
      queryParams.push(status);
    }
    if (is_active !== undefined) {
      whereConditions.push('tp.is_active = ?');
      queryParams.push(is_active === 'true' ? 1 : 0);
    }
    if (is_featured !== undefined) {
      whereConditions.push('tp.is_featured = ?');
      queryParams.push(is_featured === 'true' ? 1 : 0);
    }
    if (search) {
      whereConditions.push('(tp.name LIKE ? OR tp.short_description LIKE ? OR tp.location_name LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' GROUP BY tp.id';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [packages] = await pool.query(query, queryParams);

    // Format the packages data before sending
    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      // Format gallery images into an array
      gallery_images: pkg.gallery_images ? pkg.gallery_images.split(',').map(img => ({
        url: `/uploads/${img}`,
        filename: img
      })) : [],
      // Format featured image
      featured_image: pkg.featured_image ? `/uploads/${pkg.featured_image}` : null,
      // Format amenities into an array
      amenities: pkg.amenities ? pkg.amenities.split(',') : [],
      // Parse meta keywords if it's a JSON string
      meta_keywords: typeof pkg.meta_keywords === 'string' ?
        JSON.parse(pkg.meta_keywords) : pkg.meta_keywords,
      // Convert boolean fields
      is_active: Boolean(pkg.is_active),
      is_featured: Boolean(pkg.is_featured),
      is_trending: Boolean(pkg.is_trending)
    }));

    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(DISTINCT tp.id) as total
       FROM tourism_packages tp
       ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}`,
      queryParams.slice(0, -2) // Remove limit and offset
    );

    res.json({
      success: true,
      data: formattedPackages,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tourism packages',
      error: error.message
    });
  }
};

// Get tourism package by ID
const getTourismPackageById = async (req, res) => {
  try {
    const [package] = await pool.query(
      `SELECT tp.*, 
          tt.name as tourism_type,
          ts.name as trip_style,
          tse.name as season,
          bc.name as budget_category,
          GROUP_CONCAT(DISTINCT ta.name) as amenities,
          GROUP_CONCAT(DISTINCT tpi.image_path) as gallery_images
      FROM tourism_packages tp
      LEFT JOIN tourism_types tt ON tp.tourism_type_id = tt.id
      LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
      LEFT JOIN tourism_seasons tse ON tp.season_id = tse.id
      LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
      LEFT JOIN tourism_package_amenities tpa ON tp.id = tpa.package_id
      LEFT JOIN tourism_amenities ta ON tpa.amenity_id = ta.id
      LEFT JOIN tourism_package_images tpi ON tp.id = tpi.package_id
      WHERE tp.id = ?
      GROUP BY tp.id`,
      [req.params.id]
    );

    if (!package[0]) {
      return res.status(404).json({
        success: false,
        message: 'Tourism package not found'
      });
    }

    res.json({
      success: true,
      data: package[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tourism package',
      error: error.message
    });
  }
};

// Get tourism package by slug
const getTourismPackageBySlug = async (req, res) => {
  try {
    const [package] = await pool.query(
      `SELECT tp.*, 
          tt.name as tourism_type,
          ts.name as trip_style,
          tse.name as season,
          bc.name as budget_category,
          GROUP_CONCAT(DISTINCT ta.name) as amenities,
          GROUP_CONCAT(DISTINCT tpi.image_path) as gallery_images
      FROM tourism_packages tp
      LEFT JOIN tourism_types tt ON tp.tourism_type_id = tt.id
      LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
      LEFT JOIN tourism_seasons tse ON tp.season_id = tse.id
      LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
      LEFT JOIN tourism_package_amenities tpa ON tp.id = tpa.package_id
      LEFT JOIN tourism_amenities ta ON tpa.amenity_id = ta.id
      LEFT JOIN tourism_package_images tpi ON tp.id = tpi.package_id
      WHERE tp.slug = ?
      GROUP BY tp.id`,
      [req.params.slug]
    );

    if (!package[0]) {
      return res.status(404).json({
        success: false,
        message: 'Tourism package not found'
      });
    }

    res.json({
      success: true,
      data: package[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tourism package',
      error: error.message
    });
  }
};

// Update tourism package
const updateTourismPackage = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const packageId = req.params.id;

    // Check if package exists
    const [existingPackage] = await connection.query(
      'SELECT id, featured_image FROM tourism_packages WHERE id = ?',
      [packageId]
    );

    if (!existingPackage[0]) {
      throw new Error('Tourism package not found');
    }

    // Validate request data
    validateTourismPackage(req.body);

    // Handle featured image
    let featuredImage = existingPackage[0].featured_image;
    
    // Only update featured image if a new one is uploaded
    if (req.files?.featured_image?.[0]) {
      // Delete old featured image if it exists
      if (existingPackage[0].featured_image) {
        const oldImagePath = path.join(__dirname, '../../uploads', existingPackage[0].featured_image);
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
          // Don't throw error here, continue with update
        }
      }
      featuredImage = req.files.featured_image[0].filename;
    }
    // If no new image is uploaded, keep the existing one
    // No need to validate featured image during update if not provided

    // Update package data
    await connection.query(
      `UPDATE tourism_packages SET
        name = ?, slug = ?, short_description = ?, description = ?,
        price = ?, duration = ?, tourism_type_id = ?, trip_style_id = ?,
        season_id = ?, budget_category_id = ?, location_name = ?, latitude = ?,
        longitude = ?, featured_image = ?, best_time_to_visit = ?,
        how_to_reach = ?, activities = ?, accommodation_types = ?,
        budget_range_min = ?, budget_range_max = ?, meta_title = ?,
        meta_description = ?, meta_keywords = ?, status = ?,
        is_active = ?, is_featured = ?, is_trending = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        req.body.name, req.body.slug, req.body.short_description,
        req.body.description, req.body.price, req.body.duration,
        req.body.tourism_type_id, req.body.trip_style_id, req.body.season_id,
        req.body.budget_category_id, req.body.location_name, req.body.latitude || null,
        req.body.longitude || null, featuredImage, req.body.best_time_to_visit,
        req.body.how_to_reach, req.body.activities, req.body.accommodation_types,
        req.body.budget_range_min, req.body.budget_range_max, req.body.meta_title,
        req.body.meta_description, req.body.meta_keywords, req.body.status,
        req.body.is_active ? 1 : 0, req.body.is_featured ? 1 : 0, req.body.is_trending ? 1 : 0,
        packageId
      ]
    );

    // Handle gallery images
    if (req.files?.gallery_images?.length > 0) {
      const galleryValues = req.files.gallery_images.map((file, index) => [
        packageId,
        file.filename,
        req.body.gallery_alt_texts?.[index] || file.originalname.split('.')[0],
        index
      ]);

      await connection.query(
        `INSERT INTO tourism_package_images (package_id, image_path, alt_text, display_order)
         VALUES ?`,
        [galleryValues]
      );
    }

    // Handle amenities
    if (req.body.amenities) {
      // Delete existing amenities
      await connection.query(
        'DELETE FROM tourism_package_amenities WHERE package_id = ?',
        [packageId]
      );

      // Add new amenities
      if (Array.isArray(req.body.amenities) && req.body.amenities.length > 0) {
        const amenityValues = req.body.amenities.map(amenityId => [packageId, amenityId]);
        await connection.query(
          `INSERT INTO tourism_package_amenities (package_id, amenity_id)
           VALUES ?`,
          [amenityValues]
        );
      }
    }

    await connection.commit();

    // Fetch updated package
    const [updatedPackage] = await connection.query(
      `SELECT tp.*, 
          tt.name as tourism_type,
          ts.name as trip_style,
          tse.name as season,
          bc.name as budget_category,
          GROUP_CONCAT(DISTINCT ta.name) as amenities,
          GROUP_CONCAT(DISTINCT tpi.image_path) as gallery_images
      FROM tourism_packages tp
      LEFT JOIN tourism_types tt ON tp.tourism_type_id = tt.id
      LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
      LEFT JOIN tourism_seasons tse ON tp.season_id = tse.id
      LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
      LEFT JOIN tourism_package_amenities tpa ON tp.id = tpa.package_id
      LEFT JOIN tourism_amenities ta ON tpa.amenity_id = ta.id
      LEFT JOIN tourism_package_images tpi ON tp.id = tpi.package_id
      WHERE tp.id = ?
      GROUP BY tp.id`,
      [packageId]
    );

    res.json({
      success: true,
      message: 'Tourism package updated successfully',
      data: updatedPackage[0]
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating tourism package',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Delete tourism package
const deleteTourismPackage = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const packageId = req.params.id;

    // Get package images
    const [images] = await connection.query(
      'SELECT featured_image FROM tourism_packages WHERE id = ?',
      [packageId]
    );

    const [galleryImages] = await connection.query(
      'SELECT image_path FROM tourism_package_images WHERE package_id = ?',
      [packageId]
    );

    // Delete images from filesystem
    if (images[0]?.featured_image) {
      const featuredImagePath = path.join(__dirname, '../../uploads', images[0].featured_image);
      try {
        await fs.unlink(featuredImagePath);
      } catch (error) {
        }
    }

    for (const image of galleryImages) {
      const imagePath = path.join(__dirname, '../../uploads', image.image_path);
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        }
    }

    // Delete from database (cascade will handle related records)
    await connection.query('DELETE FROM tourism_packages WHERE id = ?', [packageId]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Tourism package deleted successfully'
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting tourism package',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Get trending destinations
const getTrendingDestinations = async (req, res) => {
  try {
    const [destinations] = await pool.query(`
      SELECT 
        tp.id,
        tp.name,
        tp.location_name,
        tp.short_description,
        tp.featured_image,
        tp.price,
        tp.budget_range_min,
        tp.budget_range_max,
        tp.slug,
        so.is_active as has_special_offer,
        so.promo_code
      FROM tourism_packages tp
      LEFT JOIN special_offers so ON tp.id = so.package_id
      WHERE tp.is_active = 1
      AND tp.status = 'published'
      AND tp.is_featured = 1
      ORDER BY tp.created_at DESC
      LIMIT 4
    `);

    res.json({
      success: true,
      data: destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trending destinations',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  createTourismPackage,
  getAllTourismPackages,
  getTourismPackageById,
  getTourismPackageBySlug,
  updateTourismPackage,
  deleteTourismPackage,
  getTrendingDestinations
}; 