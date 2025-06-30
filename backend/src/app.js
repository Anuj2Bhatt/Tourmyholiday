const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const tourismRoutes = require('./routes/tourismRoutes');
const territoryImageRoutes = require('./routes/territoryImageRoutes');
const masterDataRoutes = require('./routes/masterDataRoutes');

// Routes
app.use('/api/tourism', tourismRoutes);
app.use('/api/territory-images', territoryImageRoutes);
app.use('/api', masterDataRoutes);

module.exports = app; 