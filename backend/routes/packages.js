const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
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
        console.log('Fetching packages...');
        
        const query = `
            SELECT p.*, s.name as state_name
            FROM packages p
            LEFT JOIN states s ON p.state_id = s.id
            ORDER BY p.created_at DESC
        `;
        
        const [packages] = await db.query(query);
        
        if (!packages || packages.length === 0) {
            return res.json([]);
        }
        
        // Format the response
        const formattedPackages = packages.map(pkg => ({
            ...pkg,
            image1: pkg.image1 ? `http://localhost:5000/uploads/${path.basename(pkg.image1)}` : null,
            image2: pkg.image2 ? `http://localhost:5000/uploads/${path.basename(pkg.image2)}` : null,
            image3: pkg.image3 ? `http://localhost:5000/uploads/${path.basename(pkg.image3)}` : null,
            image4: pkg.image4 ? `http://localhost:5000/uploads/${path.basename(pkg.image4)}` : null,
            image5: pkg.image5 ? `http://localhost:5000/uploads/${path.basename(pkg.image5)}` : null,
            featured_image: pkg.featured_image ? `http://localhost:5000/uploads/${path.basename(pkg.featured_image)}` : null,
            itinerary_pdf: pkg.itinerary_pdf ? `http://localhost:5000/uploads/${path.basename(pkg.itinerary_pdf)}` : null
        }));
        
        res.json(formattedPackages);
    } catch (error) {
        console.error('Error fetching packages:', error);
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
        const [states] = await db.query('SELECT id FROM states WHERE route = ? OR name = ?', 
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
        
        const [packages] = await db.query(query, [stateId]);
        
        // Format the response
        const formattedPackages = packages.map(pkg => ({
            ...pkg,
            image1: pkg.image1 ? `http://localhost:5000/uploads/${path.basename(pkg.image1)}` : null,
            image2: pkg.image2 ? `http://localhost:5000/uploads/${path.basename(pkg.image2)}` : null,
            image3: pkg.image3 ? `http://localhost:5000/uploads/${path.basename(pkg.image3)}` : null,
            image4: pkg.image4 ? `http://localhost:5000/uploads/${path.basename(pkg.image4)}` : null,
            image5: pkg.image5 ? `http://localhost:5000/uploads/${path.basename(pkg.image5)}` : null,
            featured_image: pkg.featured_image ? `http://localhost:5000/uploads/${path.basename(pkg.featured_image)}` : null,
            itinerary_pdf: pkg.itinerary_pdf ? `http://localhost:5000/uploads/${path.basename(pkg.itinerary_pdf)}` : null
        }));
        
        res.json(formattedPackages);
    } catch (error) {
        console.error('Error fetching state packages:', error);
        res.status(500).json({ message: 'Error fetching packages' });
    }
});

// Get a single package
router.get('/packages/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('Fetching package with slug:', slug);
        
        const query = `
            SELECT p.*, s.name as state_name
            FROM packages p
            LEFT JOIN states s ON p.state_id = s.id
            WHERE p.slug = ? AND p.status = 'Public'
        `;
        
        const [packages] = await db.query(query, [slug]);
        
        if (packages.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }
        
        // Format the response
        const package = packages[0];
        console.log('Raw package data:', package);
        
        // Helper function to format image URL
        const formatImageUrl = (imagePath) => {
            if (!imagePath) return null;
            const url = `http://localhost:5000/uploads/${path.basename(imagePath)}`;
            console.log('Formatted image URL:', url);
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
        
        console.log('Formatted images:', formattedImages);
        
        // Update package with formatted URLs
        Object.assign(package, formattedImages);
        
        // Log final package data
        console.log('Final package data:', package);
        
        res.json(package);
    } catch (error) {
        console.error('Error fetching package:', error);
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
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    fs.writeFileSync(filePath, buffer);
    return fileName;
}

// Create a new package
router.post('/', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'image5', maxCount: 1 },
    { name: 'featured_image', maxCount: 1 },
    { name: 'itinerary_pdf', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('=== Starting Package Creation ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        // Handle file uploads
        const images = [];
        const imageFields = ['image1', 'image2', 'image3', 'image4', 'image5'];
        
        // Log each image field
        imageFields.forEach(field => {
            console.log(`Processing ${field}:`, req.files?.[field]?.[0]);
            if (req.files && req.files[field] && req.files[field][0]) {
                const filename = req.files[field][0].filename;
                console.log(`Saving ${field} as:`, filename);
                images.push(filename);
            } else {
                console.log(`No file uploaded for ${field}`);
                images.push(null);
            }
        });

        // Handle featured image
        const featuredImageFile = req.files && req.files['featured_image'] && req.files['featured_image'][0]
            ? req.files['featured_image'][0].filename
            : null;
        
        console.log('Final images array:', images);
        console.log('Featured image:', featuredImageFile);

        // Extract other fields
        const {
            package_name,
            location,
            category,
            price,
            quad_price,
            double_price,
            slug,
            duration,
            description,
            itinerary,
            hotels,
            sightseeing,
            meals,
            transfer,
            note,
            inclusion,
            exclusion,
            visa_requirement,
            faq,
            meta_title,
            meta_description,
            meta_keywords,
            state_id,
            status
        } = req.body;

        // Parse itinerary if it's a string
        let parsedItinerary = itinerary;
        if (typeof itinerary === 'string') {
            try {
                parsedItinerary = JSON.parse(itinerary);
            } catch (e) {
                console.error('Error parsing itinerary:', e);
                parsedItinerary = null;
            }
        }
        // Parse hotels if it's a string
        let parsedHotels = hotels;
        if (typeof hotels === 'string') {
            try {
                parsedHotels = JSON.parse(hotels);
            } catch (e) {
                console.error('Error parsing hotels:', e);
                parsedHotels = null;
            }
        }

        // Validate required fields
        if (!package_name || !location || !category || !category.trim() || !price) {
            return res.status(400).json({
                message: 'Missing required fields',
                error: 'Package name, location, category and price are required'
            });
        }

        const query = `
            INSERT INTO packages (
                package_name, location, category, price, quad_price, double_price,
                slug, duration, description, image1, image2, image3, image4, image5, featured_image,
                itinerary, hotels, sightseeing, meals, transfer, note, inclusion, exclusion,
                visa_requirement, faq, meta_title, meta_description, meta_keywords,
                state_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            package_name, location, category, price, quad_price, double_price,
            slug, duration, description, images[0], images[1], images[2], images[3], images[4], featuredImageFile,
            parsedItinerary ? JSON.stringify(parsedItinerary) : null,
            parsedHotels ? JSON.stringify(parsedHotels) : null,
            sightseeing, meals, transfer, note, inclusion, exclusion,
            visa_requirement, faq, meta_title, meta_description, meta_keywords,
            (state_id && state_id !== '' ? state_id : null),
            status || 'Public'
        ];

        console.log('Executing query with values:', values);
        const [result] = await db.query(query, values);
        console.log('Package created successfully with ID:', result.insertId);

        res.status(201).json({
            message: 'Package created successfully',
            packageId: result.insertId
        });
    } catch (error) {
        console.error('Error creating package:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Error creating package',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update a package
router.put('/:id', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'image5', maxCount: 1 },
    { name: 'featured_image', maxCount: 1 },
    { name: 'itinerary_pdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        // Handle file uploads
        const images = [];
        const imageFields = ['image1', 'image2', 'image3', 'image4', 'image5'];
        imageFields.forEach(field => {
            if (req.files && req.files[field] && req.files[field][0]) {
                images.push(req.files[field][0].filename);
            } else {
                images.push(null);
            }
        });
        // Handle featured image
        const featuredImageFile = req.files && req.files['featured_image'] && req.files['featured_image'][0]
            ? req.files['featured_image'][0].filename
            : null;
        const {
            package_name,
            location,
            category,
            price,
            quad_price,
            double_price,
            slug,
            duration,
            description,
            itinerary,
            hotels,
            sightseeing,
            meals,
            transfer,
            note,
            inclusion,
            exclusion,
            visa_requirement,
            faq,
            meta_title,
            meta_description,
            meta_keywords,
            state_id,
            status
        } = req.body;

        // Parse itinerary if it's a string
        let parsedItinerary = itinerary;
        if (typeof itinerary === 'string') {
            try {
                parsedItinerary = JSON.parse(itinerary);
            } catch (e) {
                console.error('Error parsing itinerary:', e);
                parsedItinerary = null;
            }
        }
        // Parse hotels if it's a string
        let parsedHotels = hotels;
        if (typeof hotels === 'string') {
            try {
                parsedHotels = JSON.parse(hotels);
            } catch (e) {
                console.error('Error parsing hotels:', e);
                parsedHotels = null;
            }
        }

        const query = `
            UPDATE packages SET
                package_name = ?,
                location = ?,
                category = ?,
                price = ?,
                quad_price = ?,
                double_price = ?,
                slug = ?,
                duration = ?,
                description = ?,
                image1 = COALESCE(?, image1),
                image2 = COALESCE(?, image2),
                image3 = COALESCE(?, image3),
                image4 = COALESCE(?, image4),
                image5 = COALESCE(?, image5),
                featured_image = COALESCE(?, featured_image),
                itinerary = ?,
                hotels = ?,
                sightseeing = ?,
                meals = ?,
                transfer = ?,
                note = ?,
                inclusion = ?,
                exclusion = ?,
                visa_requirement = ?,
                faq = ?,
                meta_title = ?,
                meta_description = ?,
                meta_keywords = ?,
                state_id = ?,
                status = ?,
                updated_at = NOW()
            WHERE id = ?
        `;
        const values = [
            package_name, location, category, price, quad_price, double_price,
            slug, duration, description, images[0] || null, images[1] || null,
            images[2] || null, images[3] || null, images[4] || null, featuredImageFile,
            parsedItinerary ? JSON.stringify(parsedItinerary) : null,
            parsedHotels ? JSON.stringify(parsedHotels) : null,
            sightseeing, meals, transfer, note, inclusion, exclusion,
            visa_requirement, faq, meta_title, meta_description, meta_keywords,
            (state_id && state_id !== '' ? state_id : null),
            status, id
        ];
        await db.query(query, values);
        res.json({ message: 'Package updated successfully' });
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ message: 'Error updating package' });
    }
});

// Delete a package
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Attempting to delete package with ID:', id);
        
        // First check if package exists
        const [packages] = await db.query('SELECT * FROM packages WHERE id = ?', [id]);
        
        if (packages.length === 0) {
            console.log('Package not found with ID:', id);
            return res.status(404).json({ message: 'Package not found' });
        }
        
        // Get package images before deleting
        const package = packages[0];
        const images = [package.image1, package.image2, package.image3, package.image4, package.image5];
        
        // Delete package from database
        console.log('Deleting package from database...');
        await db.query('DELETE FROM packages WHERE id = ?', [id]);
        
        // Delete associated images
        console.log('Deleting associated images...');
        images.forEach(image => {
            if (image) {
                const imagePath = path.join(__dirname, '..', 'uploads', image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log('Deleted image:', image);
                }
            }
        });
        
        console.log('Package deleted successfully');
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ 
            message: 'Error deleting package',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Test route to create a sample package
router.post('/test-create', async (req, res) => {
    try {
        console.log('=== Creating Test Package ===');
        
        const query = `
            INSERT INTO packages (
                package_name, location, category, price, quad_price, double_price,
                slug, duration, description, image1, image2, image3, image4, image5,
                hotels, sightseeing, meals, transfer, note, inclusion, exclusion,
                visa_requirement, faq, meta_title, meta_description, meta_keywords,
                state_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            'Kedarnath Yatra Package', // package_name
            'Kedarnath', // location
            'Pilgrimage', // category
            '15000', // price
            '14000', // quad_price
            '16000', // double_price
            'kedarnath-yatra-package', // slug
            '3 Days 2 Nights', // duration
            'Experience the divine journey to Kedarnath Temple, one of the holiest Hindu shrines. This package includes comfortable accommodation, delicious meals, and all necessary arrangements for a memorable pilgrimage.', // description
            null, // image1
            null, // image2
            null, // image3
            null, // image4
            null, // image5
            'Hotel Kedarnath Heights\nHotel Shivlinga\nHotel Himalayan View', // hotels
            'Kedarnath Temple\nGaurikund\nSonprayag\nTriyuginarayan Temple', // sightseeing
            'Breakfast, Lunch, Dinner\nVegetarian Meals\nEvening Tea/Snacks', // meals
            'Airport Pickup & Drop\nLocal Transportation\nHelicopter Service (Optional)', // transfer
            'Please carry warm clothes and necessary medications.\nAltitude: 3,583 meters above sea level.', // note
            'Accommodation\nMeals\nTransportation\nGuide Services\nTemple Entry\nBasic First Aid', // inclusion
            'Airfare\nPersonal Expenses\nOptional Activities\nInsurance\nTips', // exclusion
            'No visa required for Indian citizens', // visa_requirement
            'What is the best time to visit Kedarnath?\nIs helicopter service available?\nWhat should I pack for the trip?', // faq
            'Kedarnath Yatra Package - Complete Pilgrimage Tour', // meta_title
            'Experience the divine journey to Kedarnath Temple with our complete pilgrimage package. Includes accommodation, meals, and all necessary arrangements.', // meta_description
            'kedarnath, pilgrimage, temple, uttarakhand, char dham, yatra', // meta_keywords
            1, // state_id (assuming Uttarakhand has ID 1)
            'Public' // status
        ];

        console.log('Executing query with values:', values);
        const [result] = await db.query(query, values);
        console.log('Test package created successfully with ID:', result.insertId);

        res.status(201).json({
            message: 'Test package created successfully',
            packageId: result.insertId
        });
    } catch (error) {
        console.error('Error creating test package:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Error creating test package',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 