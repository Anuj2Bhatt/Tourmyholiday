const db = require('../db');
const fs = require('fs');
const path = require('path');

const wildlifeMediaController = {
    // Upload gallery images
    uploadGalleryImages: async (req, res) => {
        try {
            const { sanctuaryId } = req.params;
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No images uploaded'
                });
            }

            // Check if sanctuary exists
            const [sanctuary] = await db.query(
                'SELECT id FROM wildlife_sanctuaries WHERE id = ?',
                [sanctuaryId]
            );

            if (sanctuary.length === 0) {
                // Delete uploaded files if sanctuary doesn't exist
                files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
                return res.status(404).json({
                    success: false,
                    message: 'Wildlife sanctuary not found'
                });
            }

            // Insert images into database
            const imagePromises = files.map(file => {
                return db.query(
                    'INSERT INTO wildlife_gallery_images (wildlife_sanctuary_id, image_path, image_name, alt_text, sort_order) VALUES (?, ?, ?, ?, ?)',
                    [
                        sanctuaryId,
                        file.filename,
                        file.originalname,
                        file.originalname, // Use original filename as alt text
                        0 // Default sort order
                    ]
                );
            });

            await Promise.all(imagePromises);

            res.status(201).json({
                success: true,
                message: `${files.length} images uploaded successfully`,
                data: {
                    uploadedCount: files.length,
                    files: files.map(file => ({
                        filename: file.filename,
                        originalName: file.originalname,
                        size: file.size
                    }))
                }
            });

        } catch (error) {
            
            // Clean up uploaded files on error
            if (req.files) {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to upload images',
                error: error.message
            });
        }
    },

    // Get gallery images for a sanctuary
    getGalleryImages: async (req, res) => {
        try {
            const { sanctuaryId } = req.params;

            const [images] = await db.query(
                `SELECT 
                    id,
                    image_path,
                    image_name,
                    alt_text,
                    sort_order,
                    is_active,
                    created_at
                FROM wildlife_gallery_images 
                WHERE wildlife_sanctuary_id = ? AND is_active = 1 
                ORDER BY sort_order ASC, created_at ASC`,
                [sanctuaryId]
            );

            res.json({
                success: true,
                data: images,
                count: images.length
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch gallery images',
                error: error.message
            });
        }
    },

    // Delete gallery image
    deleteGalleryImage: async (req, res) => {
        try {
            const { sanctuaryId, imageId } = req.params;

            // Get image details before deletion
            const [image] = await db.query(
                'SELECT image_path FROM wildlife_gallery_images WHERE id = ? AND wildlife_sanctuary_id = ?',
                [imageId, sanctuaryId]
            );

            if (image.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Image not found'
                });
            }

            // Delete from database
            await db.query(
                'DELETE FROM wildlife_gallery_images WHERE id = ? AND wildlife_sanctuary_id = ?',
                [imageId, sanctuaryId]
            );

            // Delete file from uploads folder
            const filePath = path.join(__dirname, '..', 'uploads', image[0].image_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            res.json({
                success: true,
                message: 'Image deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete image',
                error: error.message
            });
        }
    },

    // Upload video
    uploadVideo: async (req, res) => {
        try {
            const { sanctuaryId } = req.params;
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No video uploaded'
                });
            }

            // Check if sanctuary exists
            const [sanctuary] = await db.query(
                'SELECT id FROM wildlife_sanctuaries WHERE id = ?',
                [sanctuaryId]
            );

            if (sanctuary.length === 0) {
                // Delete uploaded file if sanctuary doesn't exist
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: 'Wildlife sanctuary not found'
                });
            }

            // Insert video into database
            const [result] = await db.query(
                'INSERT INTO wildlife_videos (wildlife_sanctuary_id, video_path, video_name, video_title, video_description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    sanctuaryId,
                    file.filename,
                    file.originalname,
                    file.originalname, // Use original filename as title
                    '', // Empty description
                    0 // Default sort order
                ]
            );

            res.status(201).json({
                success: true,
                message: 'Video uploaded successfully',
                data: {
                    id: result.insertId,
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size
                }
            });

        } catch (error) {
            
            // Clean up uploaded file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to upload video',
                error: error.message
            });
        }
    },

    // Get videos for a sanctuary
    getVideos: async (req, res) => {
        try {
            const { sanctuaryId } = req.params;

            const [videos] = await db.query(
                `SELECT 
                    id,
                    video_path,
                    video_name,
                    video_title,
                    video_description,
                    video_duration,
                    thumbnail_path,
                    sort_order,
                    is_active,
                    created_at
                FROM wildlife_videos 
                WHERE wildlife_sanctuary_id = ? AND is_active = 1 
                ORDER BY sort_order ASC, created_at ASC`,
                [sanctuaryId]
            );

            res.json({
                success: true,
                data: videos,
                count: videos.length
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch videos',
                error: error.message
            });
        }
    },

    // Delete video
    deleteVideo: async (req, res) => {
        try {
            const { sanctuaryId, videoId } = req.params;

            // Get video details before deletion
            const [video] = await db.query(
                'SELECT video_path FROM wildlife_videos WHERE id = ? AND wildlife_sanctuary_id = ?',
                [videoId, sanctuaryId]
            );

            if (video.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Video not found'
                });
            }

            // Delete from database
            await db.query(
                'DELETE FROM wildlife_videos WHERE id = ? AND wildlife_sanctuary_id = ?',
                [videoId, sanctuaryId]
            );

            // Delete file from uploads folder
            const filePath = path.join(__dirname, '..', 'uploads', video[0].video_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            res.json({
                success: true,
                message: 'Video deleted successfully'
            });

        } catch (error) {   
            res.status(500).json({
                success: false,
                message: 'Failed to delete video',
                error: error.message
            });
        }
    }
};

module.exports = wildlifeMediaController; 