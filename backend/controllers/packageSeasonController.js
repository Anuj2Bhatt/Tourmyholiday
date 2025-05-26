const PackageSeason = require('../models/PackageSeason');
const PackageSeasonImage = require('../models/PackageSeasonImage');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Upload to root uploads folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'season-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
        }
    }
}).single('image');

// Controller methods
const packageSeasonController = {
    // Create a new season for a package
    async createSeason(req, res) {
        try {
            const seasonData = {
                package_id: req.params.packageId,
                ...req.body
            };
            const seasonId = await PackageSeason.create(seasonData);
            res.status(201).json({ 
                success: true, 
                message: 'Season created successfully',
                seasonId 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error creating season',
                error: error.message 
            });
        }
    },

    // Update a season
    async updateSeason(req, res) {
        try {
            const seasonData = {
                package_id: req.params.packageId,
                season: req.params.season,
                ...req.body
            };
            const updated = await PackageSeason.update(seasonData);
            if (updated) {
                res.json({ 
                    success: true, 
                    message: 'Season updated successfully' 
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Season not found' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error updating season',
                error: error.message 
            });
        }
    },

    // Get all seasons for a package
    async getSeasons(req, res) {
        try {
            const seasons = await PackageSeason.getByPackageId(req.params.packageId);
            const imageCounts = await PackageSeasonImage.getImageCountBySeason(req.params.packageId);
            
            // Combine season data with image counts
            const seasonsWithCounts = seasons.map(season => {
                const imageCount = imageCounts.find(count => count.season === season.season);
                return {
                    ...season,
                    image_count: imageCount ? imageCount.image_count : 0
                };
            });

            res.json({ 
                success: true, 
                seasons: seasonsWithCounts 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching seasons',
                error: error.message 
            });
        }
    },

    // Get a specific season
    async getSeason(req, res) {
        try {
            // Convert season to proper case (first letter uppercase, rest lowercase)
            const season = req.params.season.charAt(0).toUpperCase() + req.params.season.slice(1).toLowerCase();
            
            const seasonData = await PackageSeason.getByPackageAndSeason(
                req.params.packageId,
                season
            );
            if (seasonData) {
                const images = await PackageSeasonImage.getByPackageAndSeason(
                    req.params.packageId,
                    season
                );
                res.json({ 
                    success: true, 
                    season: { ...seasonData, images } 
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Season not found' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching season',
                error: error.message 
            });
        }
    },

    // Delete a season
    async deleteSeason(req, res) {
        try {
            // First delete all images for this season
            await PackageSeasonImage.deleteByPackageAndSeason(
                req.params.packageId,
                req.params.season
            );
            
            // Then delete the season
            const deleted = await PackageSeason.delete(
                req.params.packageId,
                req.params.season
            );

            if (deleted) {
                res.json({ 
                    success: true, 
                    message: 'Season deleted successfully' 
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Season not found' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error deleting season',
                error: error.message 
            });
        }
    },

    // Toggle season active status
    async toggleActive(req, res) {
        try {
            const toggled = await PackageSeason.toggleActive(
                req.params.packageId,
                req.params.season
            );
            if (toggled) {
                res.json({ 
                    success: true, 
                    message: 'Season status toggled successfully' 
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Season not found' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error toggling season status',
                error: error.message 
            });
        }
    },

    // Upload an image for a season
    async uploadImage(req, res) {
        try {
            console.log('Upload request received:', {
                packageId: req.params.packageId,
                season: req.params.season,
                file: req.file,
                body: req.body
            });

            // Convert season to proper case
            const season = req.params.season.charAt(0).toUpperCase() + req.params.season.slice(1).toLowerCase();
            
            if (!req.file) {
                console.error('No file uploaded');
                return res.status(400).json({
                    success: false,
                    message: 'No image file uploaded'
                });
            }

            try {
                const imageData = {
                    package_id: req.params.packageId,
                    season: season,
                    image_path: `uploads/${req.file.filename}`,
                    alt_text: req.body.alt_text || '',
                    description: req.body.description || ''
                };

                console.log('Creating image with data:', imageData);

                const imageId = await PackageSeasonImage.create(imageData);
                console.log('Image created with ID:', imageId);
                
                // Get the created image
                const image = await PackageSeasonImage.getById(imageId, req.params.packageId);
                console.log('Retrieved image:', image);
                
                if (!image) {
                    throw new Error('Failed to retrieve created image');
                }

                // Format the image path for the response
                const formattedImage = {
                    ...image,
                    image_path: `http://localhost:5000/uploads/${image.image_path.replace(/^uploads[\\/]/, '')}`
                };
                
                res.status(201).json({
                    success: true,
                    message: 'Image uploaded successfully',
                    image: formattedImage
                });
            } catch (error) {
                console.error('Database error:', error);
                // If database operation fails, delete the uploaded file
                if (req.file) {
                    try {
                        await fs.unlink(req.file.path);
                        console.log('Deleted uploaded file after database error');
                    } catch (unlinkError) {
                        console.error('Error deleting uploaded file:', unlinkError);
                    }
                }
                throw error;
            }
        } catch (error) {
            console.error('Controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading image',
                error: error.message
            });
        }
    },

    // Delete season image
    async deleteImage(req, res) {
        try {
            const image = await PackageSeasonImage.getById(
                req.params.imageId,
                req.params.packageId
            );

            if (!image) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Image not found' 
                });
            }

            // Delete from database
            const deleted = await PackageSeasonImage.delete(
                req.params.imageId,
                req.params.packageId
            );

            if (deleted) {
                // Delete file from uploads folder
                try {
                    await fs.unlink(path.join('uploads', image.image_path));
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
                res.json({ 
                    success: true, 
                    message: 'Image deleted successfully' 
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Image not found' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Error deleting image',
                error: error.message 
            });
        }
    },

    // Update season image
    async updateImage(req, res) {
        try {
            const imageData = {
                id: req.params.imageId,
                package_id: req.params.packageId,
                alt_text: req.body.alt_text,
                description: req.body.description
            };

            // If new image is uploaded
            if (req.file) {
                // Get old image data
                const oldImage = await PackageSeasonImage.getById(
                    req.params.imageId,
                    req.params.packageId
                );

                if (oldImage) {
                    // Delete old file
                    try {
                        await fs.unlink(path.join('uploads', oldImage.image_path));
                    } catch (unlinkError) {
                        console.error('Error deleting old file:', unlinkError);
                    }
                }

                imageData.image_path = req.file.filename;
            }

            const updated = await PackageSeasonImage.update(imageData);
            if (updated) {
                res.json({ 
                    success: true, 
                    message: 'Image updated successfully',
                    image_path: imageData.image_path
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Image not found' 
                });
            }
        } catch (error) {
            // Delete the uploaded file if database operation fails
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }
            res.status(500).json({ 
                success: false, 
                message: 'Error updating image',
                error: error.message 
            });
        }
    },

    // Get all images for a specific season
    async getSeasonImages(req, res) {
        try {
            // Convert season to proper case
            const season = req.params.season.charAt(0).toUpperCase() + req.params.season.slice(1).toLowerCase();
            
            const images = await PackageSeasonImage.getByPackageAndSeason(
                req.params.packageId,
                season
            );
            
            // Format image URLs
            const formattedImages = images.map(image => ({
                ...image,
                image_path: `http://localhost:5000/uploads/${image.image_path.replace(/^uploads[\\/]/, '')}`
            }));

            res.json({
                success: true,
                images: formattedImages
            });
        } catch (error) {
            console.error('Error fetching season images:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching season images',
                error: error.message 
            });
        }
    },

    // Get all images for a package
    async getImages(req, res) {
        try {
            const images = await PackageSeasonImage.getByPackageId(req.params.packageId);
            
            // Format image URLs
            const formattedImages = images.map(image => ({
                ...image,
                image_path: `http://localhost:5000/uploads/${image.image_path.replace(/^uploads[\\/]/, '')}`
            }));

            res.json(formattedImages);
        } catch (error) {
            console.error('Error fetching package images:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching images',
                error: error.message 
            });
        }
    }
};

module.exports = packageSeasonController; 