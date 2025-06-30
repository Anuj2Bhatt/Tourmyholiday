const { pool, query } = require('../db');
const path = require('path');
const fs = require('fs').promises;

// Helper function to get image path
const getImagePath = (filename) => {
  if (!filename) return null;
  return filename; // Just return the filename, no uploads/ prefix needed
};

// Create a new tour package
exports.createTourPackage = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const {
      name,
      slug,
      short_description,
      price,
      package_type_id,
      trip_style_id,
      season_id,
      budget_category_id,
      description,
      status,
      best_time_to_visit,
      duration,
      budget_range_min,
      budget_range_max,
      nearby_attractions,
      how_to_reach,
      activities,
      accommodation_types,
      meta_title,
      meta_description,
      meta_keywords,
      is_active,
      is_featured
    } = req.body;

    // Check if slug already exists
    const [existingPackage] = await connection.query(
      'SELECT id FROM tour_packages WHERE slug = ?',
      [slug]
    );

    if (existingPackage.length > 0) {
      throw new Error('A package with this slug already exists');
    }

    // Handle featured image
    const featuredImage = req.files?.featured_image?.[0] 
      ? getImagePath(req.files.featured_image[0].filename)
      : null;

    // Insert basic info
    const [result] = await connection.query(
      `INSERT INTO tour_packages (
        name, slug, short_description, price, package_type_id, trip_style_id,
        season_id, budget_category_id, description, featured_image, status,
        best_time_to_visit, duration, budget_range_min, budget_range_max,
        nearby_attractions, how_to_reach, activities, accommodation_types,
        meta_title, meta_description, meta_keywords, is_active, is_featured,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name, slug, short_description, price, package_type_id, trip_style_id,
        season_id, budget_category_id, description, featuredImage, status,
        best_time_to_visit, duration, budget_range_min, budget_range_max,
        nearby_attractions, how_to_reach, activities, accommodation_types,
        meta_title, meta_description, meta_keywords, is_active ? 1 : 0, is_featured ? 1 : 0
      ]
    );

    const packageId = result.insertId;

    // Handle gallery images
    if (req.files?.gallery_images?.length > 0) {
      const galleryValues = req.files.gallery_images.map((file, index) => [
        packageId,
        getImagePath(file.filename),
        req.body.gallery_alt_texts?.[index] || file.originalname.split('.')[0],
        index
      ]);

      await connection.query(
        `INSERT INTO package_images (package_id, image_path, alt_text, display_order)
         VALUES ?`,
        [galleryValues]
      );
    }

    await connection.commit();

    // Fetch the created package
    const [package] = await connection.query(
      `SELECT tp.*, 
          pt.name as package_type,
          ts.name as trip_style,
          st.name as season,
          bc.name as budget_category,
          GROUP_CONCAT(DISTINCT pa.name) as amenities,
          GROUP_CONCAT(DISTINCT pi.image_path) as gallery_images
      FROM tour_packages tp
      LEFT JOIN package_types pt ON tp.package_type_id = pt.id
      LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
      LEFT JOIN seasons_tour st ON tp.season_id = st.id
      LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
      LEFT JOIN package_amenity_relations par ON tp.id = par.package_id
      LEFT JOIN package_amenities pa ON par.amenity_id = pa.id
      LEFT JOIN package_images pi ON tp.id = pi.package_id
      WHERE tp.id = ?
      GROUP BY tp.id`,
      [packageId]
    );

    res.json({
      success: true,
      message: 'Tour package created successfully',
      data: package[0]
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating tour package',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Get all tour packages
exports.getAllTourPackages = async (req, res) => {
    try {
        const [packages] = await pool.query(
            `SELECT tp.*, 
                pt.name as package_type,
                ts.name as trip_style,
                st.name as season,
                bc.name as budget_category,
                GROUP_CONCAT(DISTINCT pa.name) as amenities,
                GROUP_CONCAT(DISTINCT pi.image_path) as gallery_images
            FROM tour_packages tp
            LEFT JOIN package_types pt ON tp.package_type_id = pt.id
            LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
            LEFT JOIN seasons_tour st ON tp.season_id = st.id
            LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
            LEFT JOIN package_amenity_relations par ON tp.id = par.package_id
            LEFT JOIN package_amenities pa ON par.amenity_id = pa.id
            LEFT JOIN package_images pi ON tp.id = pi.package_id
            GROUP BY tp.id
            ORDER BY tp.created_at DESC`
        );

        res.json({
            success: true,
            data: packages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tour packages',
            error: error.message
        });
    }
};

// Get tour package by ID
exports.getTourPackageById = async (req, res) => {
    try {
        const [package] = await pool.query(
            `SELECT tp.*, 
                pt.name as package_type,
                ts.name as trip_style,
                st.name as season,
                bc.name as budget_category,
                GROUP_CONCAT(DISTINCT pa.name) as amenities,
                GROUP_CONCAT(DISTINCT pi.image_path) as gallery_images
            FROM tour_packages tp
            LEFT JOIN package_types pt ON tp.package_type_id = pt.id
            LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
            LEFT JOIN seasons_tour st ON tp.season_id = st.id
            LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
            LEFT JOIN package_amenity_relations par ON tp.id = par.package_id
            LEFT JOIN package_amenities pa ON par.amenity_id = pa.id
            LEFT JOIN package_images pi ON tp.id = pi.package_id
            WHERE tp.id = ?
            GROUP BY tp.id`,
            [req.params.id]
        );

        if (!package[0]) {
            return res.status(404).json({
                success: false,
                message: 'Tour package not found'
            });
        }

        res.json({
            success: true,
            data: package[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tour package',
            error: error.message
        });
    }
};

// Get tour package by slug
exports.getTourPackageBySlug = async (req, res) => {
    try {
        const [package] = await pool.query(
            `SELECT tp.*, 
                pt.name as package_type,
                ts.name as trip_style,
                st.name as season,
                bc.name as budget_category,
                GROUP_CONCAT(DISTINCT pa.name) as amenities,
                GROUP_CONCAT(DISTINCT pi.image_path) as gallery_images
            FROM tour_packages tp
            LEFT JOIN package_types pt ON tp.package_type_id = pt.id
            LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
            LEFT JOIN seasons_tour st ON tp.season_id = st.id
            LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
            LEFT JOIN package_amenity_relations par ON tp.id = par.package_id
            LEFT JOIN package_amenities pa ON par.amenity_id = pa.id
            LEFT JOIN package_images pi ON tp.id = pi.package_id
            WHERE tp.slug = ?
            GROUP BY tp.id`,
            [req.params.slug]
        );

        if (!package[0]) {
            return res.status(404).json({
                success: false,
                message: 'Tour package not found'
            });
        }

        res.json({
            success: true,
            data: package[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tour package',
            error: error.message
        });
    }
};

// Update tour package
exports.updateTourPackage = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const packageId = req.params.id;
        const { success, message, basicInfo, ...updateData } = req.body;  // Extract basicInfo

        // Build update query
        let updateFields = [];
        let updateValues = [];

        // Handle basicInfo fields
        if (basicInfo) {
            // Map basicInfo fields to database columns
            const fieldMapping = {
                name: 'name',
                slug: 'slug',
                shortDescription: 'short_description',
                price: 'price',
                isActive: 'is_active',
                isFeatured: 'is_featured'
            };

            // Add basicInfo fields
            Object.entries(basicInfo).forEach(([key, value]) => {
                if (fieldMapping[key]) {
                    if (key === 'isActive' || key === 'isFeatured') {
                        updateFields.push(`${fieldMapping[key]} = ?`);
                        updateValues.push(value ? 1 : 0);
                    } else {
                        updateFields.push(`${fieldMapping[key]} = ?`);
                        updateValues.push(value);
                    }
                }
            });

            // Handle categories
            if (basicInfo.categories) {
                const categoryMapping = {
                    destinationType: 'package_type_id',
                    tripType: 'trip_style_id',
                    season: 'season_id',
                    budget: 'budget_category_id'
                };

                Object.entries(basicInfo.categories).forEach(([key, value]) => {
                    if (categoryMapping[key]) {
                        updateFields.push(`${categoryMapping[key]} = ?`);
                        updateValues.push(value || null);
                    }
                });
            }
        }

        // Add other fields except special ones
        Object.keys(updateData).forEach(key => {
            if (key !== 'id' && 
                key !== 'featured_image' && 
                key !== 'gallery_images' && 
                key !== 'amenities' && 
                key !== 'existing_gallery_images' &&
                key !== 'featured_image_url') {
                
                updateFields.push(`${key} = ?`);
                // Convert empty strings, 'null', and undefined to NULL
                const value = updateData[key];
                updateValues.push(
                    value === '' || value === 'null' || value === undefined || value === null 
                    ? null 
                    : value
                );
            }
        });

        // Handle featured image
        if (req.files && req.files.featured_image) {
            // Delete old featured image if exists
            const [oldPackage] = await connection.query(
                'SELECT featured_image FROM tour_packages WHERE id = ?',
                [packageId]
            );

            if (oldPackage[0]?.featured_image) {
                const oldImagePath = path.join(__dirname, '../upload', oldPackage[0].featured_image);
                if (fs.existsSync(oldImagePath)) {
                    await fs.unlink(oldImagePath);
                }
            }

            updateFields.push('featured_image = ?');
            updateValues.push(req.files.featured_image[0].filename);
        } else if (updateData.featured_image_url) {
            // If we have a featured image URL (existing image)
            updateFields.push('featured_image = ?');
            updateValues.push(updateData.featured_image_url);
        }

        // Add updated_at timestamp
        updateFields.push('updated_at = NOW()');

        // Update tour package
        if (updateFields.length > 0) {
            const query = `UPDATE tour_packages SET ${updateFields.join(', ')} WHERE id = ?`;
            await connection.query(query, [...updateValues, packageId]);
        }

        // Handle gallery images
        if (req.files && req.files.gallery_images) {
            const galleryImages = req.files.gallery_images;
            const altTexts = req.body.gallery_alt_texts || [];

            for (let i = 0; i < galleryImages.length; i++) {
                const image = galleryImages[i];
                const altText = altTexts[i] || '';
                const imagePath = `/uploads/tour-packages/${packageId}/gallery/${image.filename}`;

                await connection.query(
                    'INSERT INTO package_images (package_id, image_path, alt_text, created_at) VALUES (?, ?, ?, NOW())',
                    [packageId, imagePath, altText]
                );
            }
        }

        // Handle existing gallery images
        if (updateData.existing_gallery_images) {
            try {
                const existingImages = JSON.parse(updateData.existing_gallery_images);
                
                // First, get all current images
                const [currentImages] = await connection.query(
                    'SELECT id, image_path FROM package_images WHERE package_id = ?',
                    [packageId]
                );

                // Find images to delete (those not in existing_images)
                const currentPaths = currentImages.map(img => img.image_path);
                const existingPaths = existingImages.map(img => img.url);
                const imagesToDelete = currentImages.filter(img => !existingPaths.includes(img.image_path));

                // Delete images that are no longer needed
                for (const image of imagesToDelete) {
                    // Delete file from filesystem
                    const imagePath = path.join(__dirname, '../upload', image.image_path);
                    if (fs.existsSync(imagePath)) {
                        await fs.unlink(imagePath);
                    }
                    // Delete from database
                    await connection.query(
                        'DELETE FROM package_images WHERE id = ?',
                        [image.id]
                    );
                }

                // Update alt texts for existing images
                for (const image of existingImages) {
                    await connection.query(
                        'UPDATE package_images SET alt_text = ? WHERE package_id = ? AND image_path = ?',
                        [image.altText, packageId, image.url]
                    );
                }
            } catch (error) {
                throw new Error('Failed to process existing gallery images');
            }
        }

        await connection.commit();

        // Fetch updated package
        const [updatedPackage] = await connection.query(
            `SELECT tp.*, 
                pt.name as package_type,
                ts.name as trip_style,
                st.name as season,
                bc.name as budget_category,
                GROUP_CONCAT(DISTINCT pa.name) as amenities,
                GROUP_CONCAT(DISTINCT pi.image_path) as gallery_images
            FROM tour_packages tp
            LEFT JOIN package_types pt ON tp.package_type_id = pt.id
            LEFT JOIN trip_styles ts ON tp.trip_style_id = ts.id
            LEFT JOIN seasons_tour st ON tp.season_id = st.id
            LEFT JOIN budget_categories bc ON tp.budget_category_id = bc.id
            LEFT JOIN package_amenity_relations par ON tp.id = par.package_id
            LEFT JOIN package_amenities pa ON par.amenity_id = pa.id
            LEFT JOIN package_images pi ON tp.id = pi.package_id
            WHERE tp.id = ?
            GROUP BY tp.id`,
            [packageId]
        );

        res.json({
            success: true,
            message: 'Tour package updated successfully',
            data: updatedPackage[0]
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating tour package',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Delete tour package
exports.deleteTourPackage = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const packageId = req.params.id;

        // Get package images
        const [images] = await connection.query(
            'SELECT featured_image FROM tour_packages WHERE id = ?',
            [packageId]
        );

        const [galleryImages] = await connection.query(
            'SELECT image_path FROM package_images WHERE package_id = ?',
            [packageId]
        );

        // Delete images from filesystem
        if (images[0]?.featured_image) {
            const featuredImagePath = path.join(__dirname, '../upload', images[0].featured_image);
            if (fs.existsSync(featuredImagePath)) {
                fs.unlinkSync(featuredImagePath);
            }
        }

        galleryImages.forEach(image => {
            const imagePath = path.join(__dirname, '../upload', image.image_path);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });

        // Delete from database (cascade will handle related records)
        await connection.query('DELETE FROM tour_packages WHERE id = ?', [packageId]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Tour package deleted successfully'
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error deleting tour package',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Special Offers Controllers
exports.createSpecialOffer = async (req, res) => {
    try {
        const packageId = req.params.id;
        const {
            title,
            description,
            start_date,
            end_date,
            discount_type,
            discount_value,
            promo_code,
            terms_and_conditions
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO package_offers (
                package_id, title, description, start_date, end_date,
                discount_type, discount_value, promo_code, terms_and_conditions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                packageId, title, description, start_date, end_date,
                discount_type, discount_value, promo_code, terms_and_conditions
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Special offer created successfully',
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating special offer',
            error: error.message
        });
    }
};

exports.getSpecialOffers = async (req, res) => {
    try {
        const [offers] = await pool.query(
            'SELECT * FROM package_offers WHERE package_id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            data: offers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching special offers',
            error: error.message
        });
    }
};

exports.updateSpecialOffer = async (req, res) => {
    try {
        const { id, offerId } = req.params;
        const updateData = req.body;

        await pool.query(
            `UPDATE package_offers SET ? WHERE id = ? AND package_id = ?`,
            [updateData, offerId, id]
        );

        res.json({
            success: true,
            message: 'Special offer updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating special offer',
            error: error.message
        });
    }
};

exports.deleteSpecialOffer = async (req, res) => {
    try {
        const { id, offerId } = req.params;

        await pool.query(
            'DELETE FROM package_offers WHERE id = ? AND package_id = ?',
            [offerId, id]
        );

        res.json({
            success: true,
            message: 'Special offer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting special offer',
            error: error.message
        });
    }
};

// Gallery Images Controllers
exports.addGalleryImages = async (req, res) => {
    try {
        const packageId = req.params.id;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded'
            });
        }

        const galleryValues = files.map(file => [
            packageId,
            file.filename,
            file.originalname
        ]);

        await pool.query(
            'INSERT INTO package_images (package_id, image_path, alt_text) VALUES ?',
            [galleryValues]
        );

        res.status(201).json({
            success: true,
            message: 'Gallery images added successfully',
            data: files.map(file => ({
                filename: file.filename,
                originalname: file.originalname
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding gallery images',
            error: error.message
        });
    }
};

exports.deleteGalleryImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        // Get image path
        const [image] = await pool.query(
            'SELECT image_path FROM package_images WHERE id = ? AND package_id = ?',
            [imageId, id]
        );

        if (!image[0]) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete image file
        const imagePath = path.join(__dirname, '../upload', image[0].image_path);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Delete from database
        await pool.query(
            'DELETE FROM package_images WHERE id = ? AND package_id = ?',
            [imageId, id]
        );

        res.json({
            success: true,
            message: 'Gallery image deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting gallery image',
            error: error.message
        });
    }
};

// Amenities Controllers
exports.addAmenities = async (req, res) => {
    try {
        const packageId = req.params.id;
        const { amenities } = req.body;

        if (!Array.isArray(amenities)) {
            return res.status(400).json({
                success: false,
                message: 'Amenities must be an array'
            });
        }

        // Delete existing amenities
        await pool.query(
            'DELETE FROM package_amenity_relations WHERE package_id = ?',
            [packageId]
        );

        // Add new amenities
        const amenityValues = amenities.map(amenityId => [packageId, amenityId]);
        await pool.query(
            'INSERT INTO package_amenity_relations (package_id, amenity_id) VALUES ?',
            [amenityValues]
        );

        res.json({
            success: true,
            message: 'Amenities updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating amenities',
            error: error.message
        });
    }
};

exports.removeAmenity = async (req, res) => {
    try {
        const { id, amenityId } = req.params;

        await pool.query(
            'DELETE FROM package_amenity_relations WHERE package_id = ? AND amenity_id = ?',
            [id, amenityId]
        );

        res.json({
            success: true,
            message: 'Amenity removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing amenity',
            error: error.message
        });
    }
}; 