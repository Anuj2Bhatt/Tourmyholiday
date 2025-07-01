const { body, validationResult } = require('express-validator');

const validateAccommodation = (req, res, next) => {
  try {
    const {
      name,
      category_id,
      location,
      address,
      phone_number,
      description,
      accommodation_type,
      price_per_night,
      total_rooms,
      available_rooms,
      check_in_time,
      check_out_time,
      slug
    } = req.body;

    // Basic validations
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!category_id) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }
    if (!phone_number) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!accommodation_type) {
      return res.status(400).json({ message: 'Accommodation type is required' });
    }
    if (!price_per_night) {
      return res.status(400).json({ message: 'Price per night is required' });
    }
    if (!total_rooms) {
      return res.status(400).json({ message: 'Total rooms is required' });
    }
    if (!available_rooms) {
      return res.status(400).json({ message: 'Available rooms is required' });
    }
    if (!check_in_time) {
      return res.status(400).json({ message: 'Check-in time is required' });
    }
    if (!check_out_time) {
      return res.status(400).json({ message: 'Check-out time is required' });
    }
    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' });
    }

    // Phone number validation
    if (!/^\+91[0-9]{10}$/.test(phone_number)) {
      return res.status(400).json({ message: 'Phone number must start with +91 followed by 10 digits' });
    }

    // Star rating validation
    if (req.body.star_rating && (req.body.star_rating < 0 || req.body.star_rating > 5)) {
      return res.status(400).json({ message: 'Star rating must be between 0 and 5' });
    }

    // Rooms validation
    if (total_rooms <= 0) {
      return res.status(400).json({ message: 'Total rooms must be greater than 0' });
    }
    if (available_rooms > total_rooms) {
      return res.status(400).json({ message: 'Available rooms cannot be greater than total rooms' });
    }

    // Type-specific validations
    if (accommodation_type === 'tent') {
      if (!req.body.tent_capacity || req.body.tent_capacity <= 0) {
        return res.status(400).json({ message: 'Valid tent capacity is required' });
      }
      if (!req.body.tent_type) {
        return res.status(400).json({ message: 'Tent type is required' });
      }
    }

    if (accommodation_type === 'resort') {
      if (!req.body.resort_category) {
        return res.status(400).json({ message: 'Resort category is required' });
      }
    }

    next();
  } catch (error) { 
     
    res.status(500).json({ message: 'Error validating accommodation data' });
  }
};

// Sanitize and validate input
const sanitizeInput = (req, res, next) => {
  // Remove any script tags or dangerous content
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  next();
};

// Validate file upload
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }
  
  const files = req.files || [req.file];
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  for (const file of files) {
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only images are allowed.' 
      });
    }
    
    if (file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 5MB.' 
      });
    }
  }
  
  next();
};

// Validate ID parameter
const validateId = (req, res, next) => {
  const id = req.params.id || req.params.territoryId || req.params.stateId || req.params.districtId;
  
  if (id && !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  next();
};

// Validate slug
const validateSlug = (req, res, next) => {
  const slug = req.body.slug || req.params.slug;
  
  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ 
      error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' 
    });
  }
  
  next();
};

// Check validation results
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

module.exports = {
  validateAccommodation,
  sanitizeInput,
  validateFileUpload,
  validateId,
  validateSlug,
  checkValidationResult
}; 