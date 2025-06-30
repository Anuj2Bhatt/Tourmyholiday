const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../../db');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads');
        // Create directory if it doesn't exist
        
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

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        fieldSize: 10 * 1024 * 1024 // 10MB per field
    },
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'itinerary_pdf') {
            if (file.mimetype === 'application/pdf') {
                return cb(null, true);
            } else {
                return cb(new Error('Only PDF files are allowed for itinerary!'));
            }
        }
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
});

// Get all packages
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.*, s.name as state_name
            FROM packages p
            LEFT JOIN states s ON p.state_id = s.id
            ORDER BY p.created_at DESC
        `;
        
        const [packages] = await pool.query(query);
        
        if (!packages || packages.length === 0) {
            return res.json([]);
        }
        
        // Format the response
        const formattedPackages = packages.map(pkg => ({
            ...pkg,
            image1: pkg.image1 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image1)}` : null,
            image2: pkg.image2 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image2)}` : null,
            image3: pkg.image3 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image3)}` : null,
            image4: pkg.image4 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image4)}` : null,
            image5: pkg.image5 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image5)}` : null,
            featured_image: pkg.featured_image ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.featured_image)}` : null,
            itinerary_pdf: pkg.itinerary_pdf ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.itinerary_pdf)}` : null
        }));
        
        res.json(formattedPackages);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching packages',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get packages for a specific state
router.get('/states/:stateName/packages', async (req, res) => {
    try {
        const { stateName } = req.params;
        
        // Get state ID
        const [states] = await pool.query('SELECT id FROM states WHERE route = ? OR name = ?', 
            ['/' + stateName, stateName]);
        
        if (states.length === 0) {
            return res.status(404).json({ message: 'State not found' });
        }
        
        const stateId = states[0].id;
        
        const query = `
            SELECT p.*, s.name as state_name
            FROM packages p
            LEFT JOIN states s ON p.state_id = s.id
            WHERE p.state_id = ? AND p.status = 'Public'
            ORDER BY p.created_at DESC
        `;
        
        const [packages] = await pool.query(query, [stateId]);
        
        // Format the response
        const formattedPackages = packages.map(pkg => ({
            ...pkg,
            image1: pkg.image1 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image1)}` : null,
            image2: pkg.image2 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image2)}` : null,
            image3: pkg.image3 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image3)}` : null,
            image4: pkg.image4 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image4)}` : null,
            image5: pkg.image5 ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.image5)}` : null,
            featured_image: pkg.featured_image ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.featured_image)}` : null,
            itinerary_pdf: pkg.itinerary_pdf ? `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(pkg.itinerary_pdf)}` : null
        }));
        
        res.json(formattedPackages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages' });
    }
});

// Get a single package
router.get('/packages/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const query = `
            SELECT p.*, s.name as state_name
            FROM packages p
            LEFT JOIN states s ON p.state_id = s.id
            WHERE p.slug = ? AND p.status = 'Public'
        `;
        
        const [packages] = await pool.query(query, [slug]);
        
        if (packages.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }
        
        // Format the response
        const package = packages[0];
        // Helper function to format image URL
        const formatImageUrl = (imagePath) => {
            if (!imagePath) return null;
            const url = `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(imagePath)}`;
            return url;
        };

        // Format all image URLs
        const formattedImages = {
            image1: formatImageUrl(package.image1),
            image2: formatImageUrl(package.image2),
            image3: formatImageUrl(package.image3),
            image4: formatImageUrl(package.image4),
            image5: formatImageUrl(package.image5),
            featured_image: formatImageUrl(package.featured_image)
        };
        
        // Update package with formatted URLs
        Object.assign(package, formattedImages);
        
        // Log final package data
        res.json(package);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching package' });
    }
});

// Helper to save base64 image string to file
function saveBase64Image(base64String, fileNamePrefix = 'image') {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    let ext = 'png';
    let data = base64String;
    if (matches) {
        ext = matches[1].split('/')[1];
        data = matches[2];
    }
    const buffer = Buffer.from(data, 'base64');
    const fileName = `${fileNamePrefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);
    fs.writeFileSync(filePath, buffer);
    return fileName;
}

// Add a new package (POST /api/packages)
router.post('/', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }, { name: 'image5', maxCount: 1 }, { name: 'featured_image', maxCount: 1 }, { name: 'itinerary_pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { package_name, slug, description, meta_title, meta_description, meta_keywords, state_id, itinerary, status, price, quad_price, double_price, triple_price, duration, location, category, hotels, sightseeing, meals, transfer, note, inclusion, exclusion, visa_requirement, faq } = req.body;
        
        // Parse itinerary if it's a string
        let parsedItinerary = [];
        if (typeof itinerary === 'string') {
            try {
                // Only parse if it's not empty and looks like JSON
                if (itinerary.trim() && (itinerary.trim().startsWith('[') || itinerary.trim().startsWith('{'))) {
                    const parsed = JSON.parse(itinerary);
                    // Validate that it's an array
                    if (Array.isArray(parsed)) {
                        parsedItinerary = parsed;
                    } else {
                        }
                } else {
                    }
                } catch (e) {
                }
        } else if (Array.isArray(itinerary)) {
            parsedItinerary = itinerary;
        }
        // Handle images
        let image1 = null, image2 = null, image3 = null, image4 = null, image5 = null, featured_image = null, itinerary_pdf = null;

        if (req.files) {
            // Handle each image separately
            if (req.files['image1']) image1 = req.files['image1'][0].filename;
            if (req.files['image2']) image2 = req.files['image2'][0].filename;
            if (req.files['image3']) image3 = req.files['image3'][0].filename;
            if (req.files['image4']) image4 = req.files['image4'][0].filename;
            if (req.files['image5']) image5 = req.files['image5'][0].filename;
            if (req.files['featured_image']) featured_image = req.files['featured_image'][0].filename;
            if (req.files['itinerary_pdf']) itinerary_pdf = req.files['itinerary_pdf'][0].filename;
        }

        // Handle base64 images if no file upload
        if (!image1 && req.body.base64Image1) image1 = saveBase64Image(req.body.base64Image1, 'image1');
        if (!image2 && req.body.base64Image2) image2 = saveBase64Image(req.body.base64Image2, 'image2');
        if (!image3 && req.body.base64Image3) image3 = saveBase64Image(req.body.base64Image3, 'image3');
        if (!image4 && req.body.base64Image4) image4 = saveBase64Image(req.body.base64Image4, 'image4');
        if (!image5 && req.body.base64Image5) image5 = saveBase64Image(req.body.base64Image5, 'image5');
        if (!featured_image && req.body.base64FeaturedImage) featured_image = saveBase64Image(req.body.base64FeaturedImage, 'featured');

        const query = `
            INSERT INTO packages (
                package_name, slug, description, meta_title, meta_description, meta_keywords, 
                state_id, status, price, quad_price, double_price, triple_price, 
                duration, location, category, hotels, sightseeing, meals, transfer, note, 
                inclusion, exclusion, visa_requirement, faq, image1, image2, image3, image4, 
                image5, featured_image, itinerary_pdf, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await pool.query(query, [
            package_name, slug, description, meta_title, meta_description, meta_keywords,
            state_id, status, price, quad_price, double_price,
            triple_price, duration, location, category, hotels, sightseeing, meals, transfer,
            note, inclusion, exclusion, visa_requirement, faq, image1, image2, image3, image4,
            image5, featured_image, itinerary_pdf
        ]);

        res.status(201).json({ id: result.insertId, message: 'Package added successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error adding package', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

// Update a package (PUT /api/packages/:id)
router.put('/:id', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }, { name: 'image5', maxCount: 1 }, { name: 'featured_image', maxCount: 1 }, { name: 'itinerary_pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { id } = req.params;
        // First get the existing package data
        const [existingPackage] = await pool.query('SELECT * FROM packages WHERE id = ?', [id]);
        if (existingPackage.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const { package_name, slug, description, meta_title, meta_description, meta_keywords, state_id, itinerary, status, price, quad_price, double_price, triple_price, duration, location, category, hotels, sightseeing, meals, transfer, note, inclusion, exclusion, visa_requirement, faq } = req.body;

        // Parse itinerary if it's a string
        let parsedItinerary = [];
        if (typeof itinerary === 'string') {
            try {
                // Only parse if it's not empty and looks like JSON
                if (itinerary.trim() && (itinerary.trim().startsWith('[') || itinerary.trim().startsWith('{'))) {
                    const parsed = JSON.parse(itinerary);
                    // Validate that it's an array
                    if (Array.isArray(parsed)) {
                        parsedItinerary = parsed;
                    } else {
                        parsedItinerary = existingPackage[0].itinerary ? JSON.parse(existingPackage[0].itinerary) : [];
                    }
        } else {
                    parsedItinerary = existingPackage[0].itinerary ? JSON.parse(existingPackage[0].itinerary) : [];
                }
                } catch (e) {
                parsedItinerary = existingPackage[0].itinerary ? JSON.parse(existingPackage[0].itinerary) : [];
            }
        } else if (Array.isArray(itinerary)) {
            parsedItinerary = itinerary;
        }
        // Handle images
        let image1 = existingPackage[0].image1;
        let image2 = existingPackage[0].image2;
        let image3 = existingPackage[0].image3;
        let image4 = existingPackage[0].image4;
        let image5 = existingPackage[0].image5;
        let featured_image = existingPackage[0].featured_image;
        let itinerary_pdf = existingPackage[0].itinerary_pdf;

        if (req.files) {
            // Update only the images that were uploaded
            if (req.files['image1']) image1 = req.files['image1'][0].filename;
            if (req.files['image2']) image2 = req.files['image2'][0].filename;
            if (req.files['image3']) image3 = req.files['image3'][0].filename;
            if (req.files['image4']) image4 = req.files['image4'][0].filename;
            if (req.files['image5']) image5 = req.files['image5'][0].filename;
            if (req.files['featured_image']) featured_image = req.files['featured_image'][0].filename;
            if (req.files['itinerary_pdf']) itinerary_pdf = req.files['itinerary_pdf'][0].filename;
        }

        // Handle base64 images if no file upload
        if (!image1 && req.body.base64Image1) image1 = saveBase64Image(req.body.base64Image1, 'image1');
        if (!image2 && req.body.base64Image2) image2 = saveBase64Image(req.body.base64Image2, 'image2');
        if (!image3 && req.body.base64Image3) image3 = saveBase64Image(req.body.base64Image3, 'image3');
        if (!image4 && req.body.base64Image4) image4 = saveBase64Image(req.body.base64Image4, 'image4');
        if (!image5 && req.body.base64Image5) image5 = saveBase64Image(req.body.base64Image5, 'image5');
        if (!featured_image && req.body.base64FeaturedImage) featured_image = saveBase64Image(req.body.base64FeaturedImage, 'featured');

        const query = `
UPDATE packages SET 
package_name = ?, 
slug = ?, 
description = ?, 
meta_title = ?, 
meta_description = ?, 
meta_keywords = ?, 
state_id = ?, 
status = ?, 
price = ?, 
quad_price = ?, 
double_price = ?, 
triple_price = ?, 
duration = ?, 
location = ?, 
category = ?, 
hotels = ?, 
sightseeing = ?, 
meals = ?, 
transfer = ?, 
note = ?, 
inclusion = ?, 
exclusion = ?, 
visa_requirement = ?, 
faq = ?, 
image1 = ?, 
image2 = ?, 
image3 = ?, 
image4 = ?, 
image5 = ?, 
featured_image = ?, 
itinerary_pdf = ? 
WHERE id = ?
`;

        const [result] = await pool.query(query, [
            package_name, slug, description, meta_title, meta_description, meta_keywords,
            state_id, status, price, quad_price, double_price,
            triple_price, duration, location, category, hotels, sightseeing, meals, transfer,
            note, inclusion, exclusion, visa_requirement, faq, image1, image2, image3, image4,
            image5, featured_image, itinerary_pdf, id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json({ message: 'Package updated successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating package', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

// Delete a package (DELETE /api/packages/:id)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM packages WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting package', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
});

module.exports = router; 