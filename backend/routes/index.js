const express = require('express');
const router = express.Router();

// API index route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TourMyHoliday API',
    version: '1.0.0',
    endpoints: {
      states: '/api/states',
      stateHistory: '/api/state-history',
      gallery: '/api/gallery',
      articles: '/api/articles',
      uploads: '/uploads',
      places: {
        list: '/api/states/:stateId/places',
        single: '/api/places/:id',
        create: '/api/states/:stateId/places',
        update: '/api/states/:stateId/places/:id',
        delete: '/api/states/:stateId/places/:id'
      }
    },
    documentation: 'API documentation will be available here'
  });
});

module.exports = router; 