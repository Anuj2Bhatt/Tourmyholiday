const StateEducationInstitution = require('../models/StateEducationInstitution');
const StateHealthcareInstitution = require('../models/StateHealthcareInstitution');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Direct upload to uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Upload middleware for single image
const uploadSingle = upload.single('featured_image');

// Upload middleware for multiple images
const uploadMultiple = upload.array('gallery_images', 10);

// Helper function to delete old images
const deleteOldImage = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(__dirname, '..', 'uploads', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

const educationHealthcareController = {
  // Create new education institution
  async createEducationInstitution(req, res) {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const institutionData = {
          ...req.body,
          featured_image: req.file ? req.file.filename : null,
          gallery_images: []
        };

        const id = await StateEducationInstitution.create(institutionData);
        res.status(201).json({ id, message: 'Education institution created successfully' });
      } catch (error) {
        // Delete uploaded file if database operation fails
        if (req.file) {
          deleteOldImage(req.file.filename);
        }
        res.status(500).json({ error: error.message });
      }
    });
  },

  // Create new healthcare institution
  async createHealthcareInstitution(req, res) {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const institutionData = {
          ...req.body,
          featured_image: req.file ? req.file.filename : null,
          gallery_images: []
        };

        const id = await StateHealthcareInstitution.create(institutionData);
        res.status(201).json({ id, message: 'Healthcare institution created successfully' });
      } catch (error) {
        // Delete uploaded file if database operation fails
        if (req.file) {
          deleteOldImage(req.file.filename);
        }
        res.status(500).json({ error: error.message });
      }
    });
  },

  // Upload gallery images for education institution
  async uploadEducationGallery(req, res) {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { id } = req.params;
        const institution = await StateEducationInstitution.findById(id);
        
        if (!institution) {
          // Delete uploaded files if institution not found
          req.files.forEach(file => deleteOldImage(file.filename));
          return res.status(404).json({ error: 'Institution not found' });
        }

        const newImages = req.files.map(file => file.filename);
        const updatedGallery = [...institution.gallery_images, ...newImages];

        await StateEducationInstitution.update(id, { gallery_images: updatedGallery });
        res.json({ message: 'Gallery images uploaded successfully' });
      } catch (error) {
        // Delete uploaded files if operation fails
        req.files.forEach(file => deleteOldImage(file.filename));
        res.status(500).json({ error: error.message });
      }
    });
  },

  // Upload gallery images for healthcare institution
  async uploadHealthcareGallery(req, res) {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { id } = req.params;
        const institution = await StateHealthcareInstitution.findById(id);
        
        if (!institution) {
          // Delete uploaded files if institution not found
          req.files.forEach(file => deleteOldImage(file.filename));
          return res.status(404).json({ error: 'Institution not found' });
        }

        const newImages = req.files.map(file => file.filename);
        const updatedGallery = [...institution.gallery_images, ...newImages];

        await StateHealthcareInstitution.update(id, { gallery_images: updatedGallery });
        res.json({ message: 'Gallery images uploaded successfully' });
      } catch (error) {
        // Delete uploaded files if operation fails
        req.files.forEach(file => deleteOldImage(file.filename));
        res.status(500).json({ error: error.message });
      }
    });
  },

  // Get education institutions by subdistrict
  async getEducationInstitutions(req, res) {
    try {
      const { subdistrictId } = req.params;
      const institutions = await StateEducationInstitution.findBySubdistrict(subdistrictId);
      res.json(institutions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get healthcare institutions by subdistrict
  async getHealthcareInstitutions(req, res) {
    try {
      const { subdistrictId } = req.params;
      const institutions = await StateHealthcareInstitution.findBySubdistrict(subdistrictId);
      res.json(institutions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update education institution
  async updateEducationInstitution(req, res) {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { id } = req.params;
        const institution = await StateEducationInstitution.findById(id);
        
        if (!institution) {
          if (req.file) deleteOldImage(req.file.filename);
          return res.status(404).json({ error: 'Institution not found' });
        }

        const updateData = {
          ...req.body,
          featured_image: req.file ? req.file.filename : institution.featured_image
        };

        // Delete old featured image if new one is uploaded
        if (req.file && institution.featured_image) {
          deleteOldImage(institution.featured_image);
        }

        const success = await StateEducationInstitution.update(id, updateData);
        if (success) {
          res.json({ message: 'Education institution updated successfully' });
        } else {
          if (req.file) deleteOldImage(req.file.filename);
          res.status(404).json({ error: 'Institution not found' });
        }
      } catch (error) {
        if (req.file) deleteOldImage(req.file.filename);
        res.status(500).json({ error: error.message });
      }
    });
  },

  // Update healthcare institution
  async updateHealthcareInstitution(req, res) {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { id } = req.params;
        const institution = await StateHealthcareInstitution.findById(id);
        
        if (!institution) {
          if (req.file) deleteOldImage(req.file.filename);
          return res.status(404).json({ error: 'Institution not found' });
        }

        const updateData = {
          ...req.body,
          featured_image: req.file ? req.file.filename : institution.featured_image
        };

        // Delete old featured image if new one is uploaded
        if (req.file && institution.featured_image) {
          deleteOldImage(institution.featured_image);
        }

        const success = await StateHealthcareInstitution.update(id, updateData);
        if (success) {
          res.json({ message: 'Healthcare institution updated successfully' });
        } else {
          if (req.file) deleteOldImage(req.file.filename);
          res.status(404).json({ error: 'Institution not found' });
        }
      } catch (error) {
        if (req.file) deleteOldImage(req.file.filename);
        res.status(500).json({ error: error.message });
      }
    });
  },

  // Delete education institution
  async deleteEducationInstitution(req, res) {
    try {
      const { id } = req.params;
      const institution = await StateEducationInstitution.findById(id);
      
      if (!institution) {
        return res.status(404).json({ error: 'Institution not found' });
      }

      // Delete featured image
      if (institution.featured_image) {
        deleteOldImage(institution.featured_image);
      }

      // Delete gallery images
      institution.gallery_images.forEach(image => deleteOldImage(image));

      const success = await StateEducationInstitution.delete(id);
      if (success) {
        res.json({ message: 'Education institution deleted successfully' });
      } else {
        res.status(404).json({ error: 'Institution not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete healthcare institution
  async deleteHealthcareInstitution(req, res) {
    try {
      const { id } = req.params;
      const institution = await StateHealthcareInstitution.findById(id);
      
      if (!institution) {
        return res.status(404).json({ error: 'Institution not found' });
      }

      // Delete featured image
      if (institution.featured_image) {
        deleteOldImage(institution.featured_image);
      }

      // Delete gallery images
      institution.gallery_images.forEach(image => deleteOldImage(image));

      const success = await StateHealthcareInstitution.delete(id);
      if (success) {
        res.json({ message: 'Healthcare institution deleted successfully' });
      } else {
        res.status(404).json({ error: 'Institution not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = educationHealthcareController; 