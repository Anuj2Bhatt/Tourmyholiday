const db = require('../db');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /api/villages:
 *   get:
 *     summary: Get all state villages with optional filters
 *     description: Retrieve a list of villages with optional filtering by state, district, or subdistrict
 *     tags: [Villages]
 *     parameters:
 *       - in: query
 *         name: state_id
 *         schema:
 *           type: integer
 *         description: Filter villages by state ID
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: integer
 *         description: Filter villages by district ID
 *       - in: query
 *         name: subdistrict_id
 *         schema:
 *           type: integer
 *         description: Filter villages by subdistrict ID
 *     responses:
 *       200:
 *         description: List of villages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Village'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */
// Get all state villages with filters
exports.getStateVillages = async (req, res) => {
  try {
    const { state_id, district_id, subdistrict_id } = req.query;
    let query = `
      SELECT v.*, 
        s.name as state_name,
        d.name as district_name,
        sd.name as subdistrict_name
      FROM villages v
      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN subdistricts sd ON v.subdistrict_id = sd.id
      WHERE 1=1
    `;
    const params = [];

    if (state_id) {
      query += ' AND v.state_id = ?';
      params.push(state_id);
    }
    if (district_id) {
      query += ' AND v.district_id = ?';
      params.push(district_id);
    }
    if (subdistrict_id) {
      query += ' AND v.subdistrict_id = ?';
      params.push(subdistrict_id);
    }

    query += ' ORDER BY v.name ASC';

    const [villages] = await db.query(query, params);

    // Get images for each village
    for (let village of villages) {
      const [images] = await db.query(
        'SELECT * FROM state_village_images WHERE village_id = ? ORDER BY display_order ASC',
        [village.id]
      );
      village.images = images;
    }

    res.json({
      success: true,
      data: villages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching villages',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/villages/{id}:
 *   get:
 *     summary: Get a single village by ID
 *     description: Retrieve detailed information about a specific village including its images
 *     tags: [Villages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Village ID
 *     responses:
 *       200:
 *         description: Village details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Village'
 *       404:
 *         description: Village not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Village not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */
// Get single state village with images
exports.getStateVillage = async (req, res) => {
  try {
    const { id } = req.params;

    // Get village details
    const [villages] = await db.query(`
      SELECT v.*, 
        s.name as state_name,
        d.name as district_name,
        sd.name as subdistrict_name
      FROM villages v
      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN subdistricts sd ON v.subdistrict_id = sd.id
      WHERE v.id = ?
    `, [id]);

    if (villages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    const village = villages[0];

    // Get village images
    const [images] = await db.query(
      'SELECT * FROM state_village_images WHERE village_id = ? ORDER BY display_order ASC',
      [id]
    );
    village.images = images;

    res.json({
      success: true,
      data: village
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching village',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/villages:
 *   post:
 *     summary: Create a new village
 *     description: Create a new village with all required information
 *     tags: [Villages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - state_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sample Village"
 *                 description: Name of the village
 *               slug:
 *                 type: string
 *                 example: "sample-village"
 *                 description: URL-friendly slug
 *               description:
 *                 type: string
 *                 example: "A beautiful village description"
 *               location:
 *                 type: string
 *                 example: "Located in the mountains"
 *               population:
 *                 type: integer
 *                 example: 5000
 *               main_occupation:
 *                 type: string
 *                 example: "Agriculture"
 *               cultural_significance:
 *                 type: string
 *                 example: "Rich cultural heritage"
 *               attractions:
 *                 type: string
 *                 example: "Temple, Lake, Mountains"
 *               how_to_reach:
 *                 type: string
 *                 example: "By road from nearest city"
 *               best_time_to_visit:
 *                 type: string
 *                 example: "March to June"
 *               featured_image:
 *                 type: string
 *                 example: "uploads/village-image.jpg"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *               meta_title:
 *                 type: string
 *                 example: "SEO Title"
 *               meta_description:
 *                 type: string
 *                 example: "SEO Description"
 *               meta_keywords:
 *                 type: string
 *                 example: "village, tourism, culture"
 *               highlights:
 *                 type: string
 *                 example: "Cultural heritage, Natural beauty"
 *               state_id:
 *                 type: integer
 *                 example: 1
 *               district_id:
 *                 type: integer
 *                 example: 1
 *               subdistrict_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Village created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Village created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */
// Create new state village
exports.createStateVillage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      slug,
      description,
      location,
      population,
      main_occupation,
      cultural_significance,
      attractions,
      how_to_reach,
      best_time_to_visit,
      featured_image,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      highlights,
      state_id,
      district_id,
      subdistrict_id
    } = req.body;

    // Stricter sanitization for featured_image
    let safeFeaturedImage = featured_image;
    if (
      !safeFeaturedImage ||
      safeFeaturedImage === 'undefined' ||
      safeFeaturedImage.startsWith('undefined/') ||
      safeFeaturedImage.includes('undefined/')
    ) {
      safeFeaturedImage = null;
    }
    // Debug log before saving


    const query = `
      INSERT INTO villages (
        name, slug, description, location, population,
        main_occupation, cultural_significance, attractions,
        how_to_reach, best_time_to_visit, featured_image,
        status, meta_title, meta_description, meta_keywords,
        highlights, state_id, district_id, subdistrict_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      name, slug, description, location, population,
      main_occupation, cultural_significance, attractions,
      how_to_reach, best_time_to_visit, safeFeaturedImage,
      status, meta_title, meta_description, meta_keywords,
      highlights, state_id, district_id, subdistrict_id
    ]);

    res.status(201).json({
      success: true,
      message: 'Village created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating village',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/villages/{id}:
 *   put:
 *     summary: Update a village
 *     description: Update an existing village's information
 *     tags: [Villages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Village ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Village Name"
 *               slug:
 *                 type: string
 *                 example: "updated-village-slug"
 *               description:
 *                 type: string
 *                 example: "Updated village description"
 *               location:
 *                 type: string
 *                 example: "Updated location"
 *               population:
 *                 type: integer
 *                 example: 6000
 *               main_occupation:
 *                 type: string
 *                 example: "Tourism"
 *               cultural_significance:
 *                 type: string
 *                 example: "Updated cultural significance"
 *               attractions:
 *                 type: string
 *                 example: "Updated attractions list"
 *               how_to_reach:
 *                 type: string
 *                 example: "Updated travel information"
 *               best_time_to_visit:
 *                 type: string
 *                 example: "Year round"
 *               featured_image:
 *                 type: string
 *                 example: "uploads/updated-village-image.jpg"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *               meta_title:
 *                 type: string
 *                 example: "Updated SEO Title"
 *               meta_description:
 *                 type: string
 *                 example: "Updated SEO Description"
 *               meta_keywords:
 *                 type: string
 *                 example: "updated, village, tourism"
 *               highlights:
 *                 type: string
 *                 example: "Updated highlights"
 *               state_id:
 *                 type: integer
 *                 example: 1
 *               district_id:
 *                 type: integer
 *                 example: 1
 *               subdistrict_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Village updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Village updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */
// Update state village
exports.updateStateVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      slug,
      description,
      location,
      population,
      main_occupation,
      cultural_significance,
      attractions,
      how_to_reach,
      best_time_to_visit,
      featured_image,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      highlights,
      state_id,
      district_id,
      subdistrict_id
    } = req.body;

    // Stricter sanitization for featured_image
    let safeFeaturedImage = featured_image;
    if (
      !safeFeaturedImage ||
      safeFeaturedImage === 'undefined' ||
      safeFeaturedImage.startsWith('undefined/') ||
      safeFeaturedImage.includes('undefined/')
    ) {
      safeFeaturedImage = null;
    }
    // Debug log before saving

    const query = `
      UPDATE villages SET
        name = ?, slug = ?, description = ?, location = ?,
        population = ?, main_occupation = ?, cultural_significance = ?,
        attractions = ?, how_to_reach = ?, best_time_to_visit = ?,
        featured_image = ?, status = ?, meta_title = ?,
        meta_description = ?, meta_keywords = ?, highlights = ?,
        state_id = ?, district_id = ?, subdistrict_id = ?
      WHERE id = ?
    `;

    await db.query(query, [
      name, slug, description, location, population,
      main_occupation, cultural_significance, attractions,
      how_to_reach, best_time_to_visit, safeFeaturedImage,
      status, meta_title, meta_description, meta_keywords,
      highlights, state_id, district_id, subdistrict_id, id
    ]);

    res.json({
      success: true,
      message: 'Village updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating village',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/villages/{id}:
 *   delete:
 *     summary: Delete a village
 *     description: Delete a village and all its associated images
 *     tags: [Villages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Village ID
 *     responses:
 *       200:
 *         description: Village and associated images deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Village and associated images deleted successfully
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/Error'
 */
// Delete state village
exports.deleteStateVillage = async (req, res) => {
  try {
    const { id } = req.params;

    // First get all images
    const [images] = await db.query(
      'SELECT image_path FROM state_village_images WHERE village_id = ?',
      [id]
    );

    // Delete village images from database
    await db.query('DELETE FROM state_village_images WHERE village_id = ?', [id]);

    // Delete village
    await db.query('DELETE FROM villages WHERE id = ?', [id]);

    // Delete image files
    const fs = require('fs');
    const path = require('path');
    for (const image of images) {
      const filePath = path.join(__dirname, '../../uploads', image.image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Village and associated images deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting village',
      error: error.message
    });
  }
}; 