const Culture = require('../models/Culture');
const TerritoryCulture = require('../models/TerritoryCulture');
const path = require('path');
const fs = require('fs').promises;

// Helper function to handle image upload
const handleImageUpload = async (file) => {
  if (!file) return null;
  
  // Generate unique filename
  const timestamp = Date.now();
  const originalName = file.originalname;
  const extension = path.extname(originalName);
  const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${extension}`;
  
  // Save to uploads folder
  const uploadPath = path.join(__dirname, '../uploads', filename);
  await fs.writeFile(uploadPath, file.buffer);
  
  return filename;
};

// Helper function to delete old image
const deleteOldImage = async (imagePath) => {
  if (!imagePath) return;
  
  try {
    const fullPath = path.join(__dirname, '../uploads', imagePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting old image:', error);
  }
};

// State Culture Controllers
exports.createCulture = async (req, res) => {
  try {
    const { title, slug, description, meta_title, meta_description, meta_keywords, subdistrict_id } = req.body;
    
    // Check if slug exists
    const slugExists = await Culture.checkSlugExists(slug);
    if (slugExists) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    
    // Handle image upload
    const featured_image = req.file ? await handleImageUpload(req.file) : null;
    
    const cultureData = {
      subdistrict_id,
      title,
      slug,
      description,
      featured_image,
      meta_title,
      meta_description,
      meta_keywords
    };
    
    const id = await Culture.create(cultureData);
    res.status(201).json({ id, message: 'Culture created successfully' });
  } catch (error) {
    console.error('Error creating culture:', error);
    res.status(500).json({ message: 'Error creating culture' });
  }
};

exports.updateCulture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, description, meta_title, meta_description, meta_keywords } = req.body;
    
    // Check if slug exists (excluding current record)
    const slugExists = await Culture.checkSlugExists(slug, id);
    if (slugExists) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    
    // Get current culture to check for image
    const currentCulture = await Culture.getById(id);
    if (!currentCulture) {
      return res.status(404).json({ message: 'Culture not found' });
    }
    
    // Handle image upload
    let featured_image = currentCulture.featured_image;
    if (req.file) {
      // Delete old image if exists
      if (featured_image) {
        await deleteOldImage(featured_image);
      }
      featured_image = await handleImageUpload(req.file);
    }
    
    const cultureData = {
      title,
      slug,
      description,
      featured_image,
      meta_title,
      meta_description,
      meta_keywords
    };
    
    const success = await Culture.update(id, cultureData);
    if (success) {
      res.json({ message: 'Culture updated successfully' });
    } else {
      res.status(404).json({ message: 'Culture not found' });
    }
  } catch (error) {
    console.error('Error updating culture:', error);
    res.status(500).json({ message: 'Error updating culture' });
  }
};

exports.deleteCulture = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get culture to delete image
    const culture = await Culture.getById(id);
    if (culture && culture.featured_image) {
      await deleteOldImage(culture.featured_image);
    }
    
    const success = await Culture.delete(id);
    if (success) {
      res.json({ message: 'Culture deleted successfully' });
    } else {
      res.status(404).json({ message: 'Culture not found' });
    }
  } catch (error) {
    console.error('Error deleting culture:', error);
    res.status(500).json({ message: 'Error deleting culture' });
  }
};

exports.getCulturesBySubdistrict = async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const cultures = await Culture.getBySubdistrict(subdistrictId);
    res.json(cultures);
  } catch (error) {
    console.error('Error fetching cultures:', error);
    res.status(500).json({ message: 'Error fetching cultures' });
  }
};

// Territory Culture Controllers
exports.createTerritoryCulture = async (req, res) => {
  try {
    const { title, slug, description, meta_title, meta_description, meta_keywords, territory_subdistrict_id } = req.body;
    
    // Check if slug exists
    const slugExists = await TerritoryCulture.checkSlugExists(slug);
    if (slugExists) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    
    // Handle image upload
    const featured_image = req.file ? await handleImageUpload(req.file) : null;
    
    const cultureData = {
      territory_subdistrict_id,
      title,
      slug,
      description,
      featured_image,
      meta_title,
      meta_description,
      meta_keywords
    };
    
    const id = await TerritoryCulture.create(cultureData);
    res.status(201).json({ id, message: 'Territory culture created successfully' });
  } catch (error) {
    console.error('Error creating territory culture:', error);
    res.status(500).json({ message: 'Error creating territory culture' });
  }
};

exports.updateTerritoryCulture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, description, meta_title, meta_description, meta_keywords } = req.body;
    
    // Check if slug exists (excluding current record)
    const slugExists = await TerritoryCulture.checkSlugExists(slug, id);
    if (slugExists) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    
    // Get current culture to check for image
    const currentCulture = await TerritoryCulture.getById(id);
    if (!currentCulture) {
      return res.status(404).json({ message: 'Territory culture not found' });
    }
    
    // Handle image upload
    let featured_image = currentCulture.featured_image;
    if (req.file) {
      // Delete old image if exists
      if (featured_image) {
        await deleteOldImage(featured_image);
      }
      featured_image = await handleImageUpload(req.file);
    }
    
    const cultureData = {
      title,
      slug,
      description,
      featured_image,
      meta_title,
      meta_description,
      meta_keywords
    };
    
    const success = await TerritoryCulture.update(id, cultureData);
    if (success) {
      res.json({ message: 'Territory culture updated successfully' });
    } else {
      res.status(404).json({ message: 'Territory culture not found' });
    }
  } catch (error) {
    console.error('Error updating territory culture:', error);
    res.status(500).json({ message: 'Error updating territory culture' });
  }
};

exports.deleteTerritoryCulture = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get culture to delete image
    const culture = await TerritoryCulture.getById(id);
    if (culture && culture.featured_image) {
      await deleteOldImage(culture.featured_image);
    }
    
    const success = await TerritoryCulture.delete(id);
    if (success) {
      res.json({ message: 'Territory culture deleted successfully' });
    } else {
      res.status(404).json({ message: 'Territory culture not found' });
    }
  } catch (error) {
    console.error('Error deleting territory culture:', error);
    res.status(500).json({ message: 'Error deleting territory culture' });
  }
};

exports.getTerritoryCulturesBySubdistrict = async (req, res) => {
  try {
    const { subdistrictId } = req.params;
    const cultures = await TerritoryCulture.getBySubdistrict(subdistrictId);
    res.json(cultures);
  } catch (error) {
    console.error('Error fetching territory cultures:', error);
    res.status(500).json({ message: 'Error fetching territory cultures' });
  }
}; 