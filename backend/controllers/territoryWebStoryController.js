const db = require('../config/database');
const path = require('path');
const fs = require('fs');

const territoryWebStoryController = {
    // Get all web stories for a territory
    getTerritoryWebStories: async (req, res) => {
        try {
            const { territory_id } = req.params;
            
            // First get all districts for this territory
            const [districts] = await db.query(
                'SELECT id FROM territory_districts WHERE territory_id = ?',
                [territory_id]
            );
            
            if (districts.length === 0) {
                return res.json([]);
            }

            const districtIds = districts.map(d => d.id);
            
            // Then get all web stories for these districts
            const query = `
                SELECT tws.*, 
                       td.name as district_name,
                       GROUP_CONCAT(
                           JSON_OBJECT(
                               'id', twsi.id,
                               'image_url', twsi.image_url,
                               'alt_text', twsi.alt_text,
                               'description', twsi.description,
                               'image_order', twsi.image_order
                           )
                       ) as images
                FROM territory_web_stories tws
                LEFT JOIN territory_districts td ON tws.territory_district_id = td.id
                LEFT JOIN territory_web_story_images twsi ON tws.id = twsi.story_id
                WHERE tws.territory_district_id IN (?)
                GROUP BY tws.id, td.name
                ORDER BY tws.created_at DESC
            `;
            
            const [stories] = await db.query(query, [districtIds]);
            
            // Parse the images JSON string
            stories.forEach(story => {
                if (story.images) {
                    story.images = JSON.parse(`[${story.images}]`);
                } else {
                    story.images = [];
                }
            });

            res.json(stories);
        } catch (error) {
            console.error('Error fetching territory web stories:', error);
            res.status(500).json({ error: 'Failed to fetch territory web stories' });
        }
    },

    // Get single web story
    getTerritoryWebStory: async (req, res) => {
        try {
            const { id } = req.params;
            const query = `
                SELECT tws.*, 
                       GROUP_CONCAT(
                           JSON_OBJECT(
                               'id', twsi.id,
                               'image_url', twsi.image_url,
                               'alt_text', twsi.alt_text,
                               'description', twsi.description,
                               'image_order', twsi.image_order
                           )
                       ) as images
                FROM territory_web_stories tws
                LEFT JOIN territory_web_story_images twsi ON tws.id = twsi.story_id
                WHERE tws.id = ?
                GROUP BY tws.id
            `;
            
            const [stories] = await db.query(query, [id]);
            
            if (stories.length === 0) {
                return res.status(404).json({ error: 'Web story not found' });
            }

            const story = stories[0];
            if (story.images) {
                story.images = JSON.parse(`[${story.images}]`);
            } else {
                story.images = [];
            }

            res.json(story);
        } catch (error) {
            console.error('Error fetching territory web story:', error);
            res.status(500).json({ error: 'Failed to fetch territory web story' });
        }
    },

    // Create new web story
    createTerritoryWebStory: async (req, res) => {
        console.log('=== Starting createTerritoryWebStory ===');
        try {
            // Log the complete request
            console.log('Request body:', req.body);
            console.log('Request files:', req.files);
            console.log('Request headers:', req.headers);
            console.log('Raw request body:', JSON.stringify(req.body, null, 2));

            // Validate required fields
            const requiredFields = ['territory_district_id', 'title', 'slug'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                console.error('Available fields:', Object.keys(req.body));
                return res.status(400).json({ 
                    error: 'Missing required fields', 
                    fields: missingFields,
                    availableFields: Object.keys(req.body)
                });
            }

            const {
                territory_district_id,
                title,
                slug,
                description,
                meta_title,
                meta_description,
                meta_keywords
            } = req.body;

            console.log('Parsed request data:', {
                territory_district_id,
                title,
                slug,
                description,
                meta_title,
                meta_description,
                meta_keywords
            });

            // Validate territory_district_id exists
            console.log('Validating territory_district_id:', territory_district_id);
            const [district] = await db.query(
                'SELECT id FROM territory_districts WHERE id = ?',
                [territory_district_id]
            );

            if (district.length === 0) {
                console.error('Invalid territory_district_id:', territory_district_id);
                return res.status(400).json({ 
                    error: 'Invalid territory district ID',
                    providedId: territory_district_id
                });
            }

            console.log('District validation successful:', district[0]);

            // Handle featured image upload
            let featured_image = null;
            if (req.files && req.files.featured_image) {
                const file = req.files.featured_image;
                const fileName = `${Date.now()}-${file.name}`;
                const uploadPath = path.join(__dirname, '../uploads', fileName);
                await file.mv(uploadPath);
                featured_image = `uploads/${fileName}`;
                console.log('Featured image saved:', featured_image);
            }

            // Insert web story
            console.log('Attempting to insert web story...');
            const insertQuery = `
                INSERT INTO territory_web_stories (
                    territory_district_id, title, slug, 
                    featured_image, meta_title, meta_description, meta_keywords
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            console.log('SQL Query:', insertQuery);
            console.log('Query Parameters:', [
                territory_district_id, title, slug, 
                featured_image, meta_title, meta_description, meta_keywords
            ]);

            const [result] = await db.query(
                insertQuery,
                [territory_district_id, title, slug, 
                 featured_image, meta_title, meta_description, meta_keywords]
            );

            if (!result.insertId) {
                throw new Error('Failed to insert web story - no insertId returned');
            }

            console.log('Web story inserted with ID:', result.insertId);
            const storyId = result.insertId;

            // Handle story images
            if (req.files && req.files.images) {
                const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
                const altTexts = req.body.alt_texts ? req.body.alt_texts.split(',') : [];
                const descriptions = req.body.descriptions ? req.body.descriptions.split(',') : [];

                console.log('Processing images:', {
                    imageCount: images.length,
                    altTexts,
                    descriptions
                });

                for (let i = 0; i < images.length; i++) {
                    const file = images[i];
                    const fileName = `${Date.now()}-${file.name}`;
                    const uploadPath = path.join(__dirname, '../uploads', fileName);
                    await file.mv(uploadPath);

                    const imageInsertQuery = `
                        INSERT INTO territory_web_story_images (
                            story_id, image_url, alt_text, description, image_order
                        ) VALUES (?, ?, ?, ?, ?)
                    `;
                    
                    console.log('Inserting image:', {
                        storyId,
                        fileName,
                        altText: altTexts[i] || '',
                        description: descriptions[i] || '',
                        order: i
                    });

                    await db.query(
                        imageInsertQuery,
                        [storyId, `uploads/${fileName}`, altTexts[i] || '', descriptions[i] || '', i]
                    );
                    console.log('Image saved:', fileName);
                }
            }

            console.log('=== Web story creation completed successfully ===');
            res.json({ 
                success: true, 
                message: 'Territory web story created successfully',
                storyId 
            });
        } catch (error) {
            console.error('=== Error in createTerritoryWebStory ===');
            console.error('Error details:', {
                message: error.message,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState,
                code: error.code,
                stack: error.stack
            });
            
            // Check for specific database errors
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    error: 'A web story with this slug already exists' 
                });
            }
            
            if (error.code === 'ER_NO_REFERENCED_ROW') {
                return res.status(400).json({ 
                    error: 'Invalid territory district ID' 
                });
            }

            res.status(500).json({ 
                error: 'Failed to create territory web story',
                details: error.message
            });
        }
    },

    // Update web story
    updateTerritoryWebStory: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                slug,
                description,
                meta_title,
                meta_description,
                meta_keywords
            } = req.body;

            // Handle featured image update
            let featured_image = req.body.existing_featured_image;
            if (req.files && req.files.featured_image) {
                const file = req.files.featured_image;
                const fileName = `${Date.now()}-${file.name}`;
                const uploadPath = path.join(__dirname, '../uploads', fileName);
                await file.mv(uploadPath);
                featured_image = `uploads/${fileName}`;

                // Delete old featured image if exists
                if (req.body.existing_featured_image) {
                    const oldImagePath = path.join(__dirname, '..', req.body.existing_featured_image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }

            // Update web story
            await db.query(
                `UPDATE territory_web_stories SET 
                    title = ?, slug = ?, featured_image = ?, 
                    meta_title = ?, meta_description = ?, meta_keywords = ?
                WHERE id = ?`,
                [title, slug, featured_image, 
                 meta_title, meta_description, meta_keywords, id]
            );

            res.json({ 
                success: true, 
                message: 'Territory web story updated successfully' 
            });
        } catch (error) {
            console.error('Error updating territory web story:', error);
            res.status(500).json({ error: 'Failed to update territory web story' });
        }
    },

    // Delete web story
    deleteTerritoryWebStory: async (req, res) => {
        try {
            const { id } = req.params;

            // Get all images to delete
            const [images] = await db.query(
                'SELECT image_url FROM territory_web_story_images WHERE story_id = ?',
                [id]
            );

            // Get featured image
            const [story] = await db.query(
                'SELECT featured_image FROM territory_web_stories WHERE id = ?',
                [id]
            );

            // Delete images from filesystem
            for (const image of images) {
                const imagePath = path.join(__dirname, '..', image.image_url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Delete featured image if exists
            if (story[0] && story[0].featured_image) {
                const featuredImagePath = path.join(__dirname, '..', story[0].featured_image);
                if (fs.existsSync(featuredImagePath)) {
                    fs.unlinkSync(featuredImagePath);
                }
            }

            // Delete from database (cascade will handle image records)
            await db.query('DELETE FROM territory_web_stories WHERE id = ?', [id]);

            res.json({ 
                success: true, 
                message: 'Territory web story deleted successfully' 
            });
        } catch (error) {
            console.error('Error deleting territory web story:', error);
            res.status(500).json({ error: 'Failed to delete territory web story' });
        }
    },

    // Get story schema
    getTerritoryWebStorySchema: async (req, res) => {
        try {
            const { id } = req.params;
            const [story] = await db.query(
                'SELECT * FROM territory_web_stories WHERE id = ?',
                [id]
            );

            if (story.length === 0) {
                return res.status(404).json({ error: 'Web story not found' });
            }

            // Generate schema
            const schema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": story[0].title,
                "description": story[0].meta_description,
                "image": story[0].featured_image ? 
                    `http://localhost:5000/${story[0].featured_image}` : null,
                "datePublished": story[0].created_at,
                "dateModified": story[0].updated_at,
                "keywords": story[0].meta_keywords
            };

            res.json(schema);
        } catch (error) {
            console.error('Error generating story schema:', error);
            res.status(500).json({ error: 'Failed to generate story schema' });
        }
    },

    // Upload image for a web story
    uploadTerritoryWebStoryImage: async (req, res) => {
        try {
            const { storyId } = req.params;
            const { alt_text, description, image_order } = req.body;

            if (!req.files || !req.files.image) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            const file = req.files.image;
            const fileName = `${Date.now()}-${file.name}`;
            const uploadPath = path.join(__dirname, '../uploads', fileName);
            await file.mv(uploadPath);

            const [result] = await db.query(
                `INSERT INTO territory_web_story_images (
                    story_id, image_url, alt_text, description, image_order
                ) VALUES (?, ?, ?, ?, ?)`,
                [storyId, `uploads/${fileName}`, alt_text || '', description || '', image_order || 0]
            );

            res.json({
                success: true,
                message: 'Image uploaded successfully',
                imageId: result.insertId,
                imageUrl: `uploads/${fileName}`
            });
        } catch (error) {
            console.error('Error uploading territory web story image:', error);
            res.status(500).json({ error: 'Failed to upload image' });
        }
    },

    // Delete image from a web story
    deleteTerritoryWebStoryImage: async (req, res) => {
        try {
            const { storyId, imageId } = req.params;

            // Get image URL before deleting
            const [images] = await db.query(
                'SELECT image_url FROM territory_web_story_images WHERE id = ? AND story_id = ?',
                [imageId, storyId]
            );

            if (images.length === 0) {
                return res.status(404).json({ error: 'Image not found' });
            }

            // Delete image file
            const imagePath = path.join(__dirname, '..', images[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            // Delete from database
            await db.query(
                'DELETE FROM territory_web_story_images WHERE id = ? AND story_id = ?',
                [imageId, storyId]
            );

            res.json({ success: true, message: 'Image deleted successfully' });
        } catch (error) {
            console.error('Error deleting territory web story image:', error);
            res.status(500).json({ error: 'Failed to delete image' });
        }
    },

    // Update image details
    updateTerritoryWebStoryImage: async (req, res) => {
        try {
            const { storyId, imageId } = req.params;
            const { alt_text, description, image_order } = req.body;

            // Update image details
            await db.query(
                `UPDATE territory_web_story_images 
                SET alt_text = ?, description = ?, image_order = ?
                WHERE id = ? AND story_id = ?`,
                [alt_text, description, image_order, imageId, storyId]
            );

            res.json({ success: true, message: 'Image updated successfully' });
        } catch (error) {
            console.error('Error updating territory web story image:', error);
            res.status(500).json({ error: 'Failed to update image' });
        }
    },

    // Reorder images
    reorderTerritoryWebStoryImages: async (req, res) => {
        try {
            const { storyId } = req.params;
            const { imageOrders } = req.body; // Array of { id, order } objects

            // Update each image's order
            for (const { id, order } of imageOrders) {
                await db.query(
                    'UPDATE territory_web_story_images SET image_order = ? WHERE id = ? AND story_id = ?',
                    [order, id, storyId]
                );
            }

            res.json({ success: true, message: 'Images reordered successfully' });
        } catch (error) {
            console.error('Error reordering territory web story images:', error);
            res.status(500).json({ error: 'Failed to reorder images' });
        }
    }
};

module.exports = territoryWebStoryController; 