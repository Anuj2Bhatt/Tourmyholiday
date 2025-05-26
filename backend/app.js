const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from specific directories
app.use('/uploads/places', express.static(path.join(__dirname, 'uploads', 'places')));
app.use('/uploads/packages', express.static(path.join(__dirname, 'uploads', 'packages')));
app.use('/uploads/districts', express.static(path.join(__dirname, 'uploads', 'districts')));
app.use('/uploads/subdistricts', express.static(path.join(__dirname, 'uploads', 'subdistricts')));
app.use('/uploads/seasons', express.static(path.join(__dirname, 'uploads', 'seasons')));

// Add CORS and content type headers for all static files
app.use('/uploads', (req, res, next) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    
    const ext = path.extname(req.path).toLowerCase();
    if (ext === '.webp') {
        res.set('Content-Type', 'image/webp');
    } else if (ext === '.jpg' || ext === '.jpeg') {
        res.set('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
        res.set('Content-Type', 'image/png');
    } else if (ext === '.gif') {
        res.set('Content-Type', 'image/gif');
    }
    next();
});

// Debug middleware to log requests
app.use((req, res, next) => {
    // Only log API requests, not static file requests
    if (req.path.startsWith('/api')) {
        console.log('API Request:', {
            method: req.method,
            path: req.path,
            query: req.query
        });
    }
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Error Stack:', err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Import routes
const stateVillageRoutes = require('./routes/stateVillageRoutes');
const territoryVillageRoutes = require('./routes/territoryVillageRoutes');

// Register routes
app.use('/api/state-villages', stateVillageRoutes);
app.use('/api/territory-villages', territoryVillageRoutes);

module.exports = app; 