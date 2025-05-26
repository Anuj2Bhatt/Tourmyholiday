const TerritoryImage = require('../models/TerritoryImage');
const Territory = require('../models/Territory');
const { ApiResponse } = require('../utils/ApiResponse');

// Get all images for a territory
exports.getTerritoryImages = async (req, res) => {
  try {
    const { territoryId } = req.params;
    const images = await TerritoryImage.getByTerritoryId(territoryId);
    return res.json(new ApiResponse(true, 'Territory images fetched successfully', images));
  } catch (error) {
    console.error('Error fetching territory images:', error);
    return res.status(500).json(new ApiResponse(false, 'Error fetching territory images'));
  }
};

// Add a new image for a territory
exports.addTerritoryImage = async (req, res) => {
  try {
    const { territory_id, alt_text, description, is_featured, display_order } = req.body;
    
    if (!req.file) {
      return res.status(400).json(new ApiResponse(false, 'Image file is required'));
    }

    // Check if territory exists
    const territory = await Territory.getById(territory_id);
    if (!territory) {
      return res.status(404).json(new ApiResponse(false, 'Territory not found'));
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    const imageData = {
      territory_id,
      image_url: imageUrl,
      alt_text,
      description,
      is_featured: is_featured === 'true',
      display_order: display_order || 0
    };

    const newImage = await TerritoryImage.create(imageData);
    return res.status(201).json(new ApiResponse(true, 'Image added successfully', newImage));
  } catch (error) {
    console.error('Error adding territory image:', error);
    return res.status(500).json(new ApiResponse(false, 'Error adding territory image'));
  }
};

// Update an existing image
exports.updateTerritoryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { alt_text, description, is_featured, display_order } = req.body;
    
    const image = await TerritoryImage.getById(imageId);
    if (!image) {
      return res.status(404).json(new ApiResponse(false, 'Image not found'));
    }

    const updateData = {
      alt_text: alt_text || image.alt_text,
      description: description || image.description,
      is_featured: is_featured === 'true' ? true : image.is_featured,
      display_order: display_order || image.display_order
    };

    // If new image file is uploaded
    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    }

    const updatedImage = await TerritoryImage.update(imageId, updateData);
    return res.json(new ApiResponse(true, 'Image updated successfully', updatedImage));
  } catch (error) {
    console.error('Error updating territory image:', error);
    return res.status(500).json(new ApiResponse(false, 'Error updating territory image'));
  }
};

// Delete an image
exports.deleteTerritoryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const image = await TerritoryImage.getById(imageId);
    if (!image) {
      return res.status(404).json(new ApiResponse(false, 'Image not found'));
    }

    await TerritoryImage.delete(imageId);
    return res.json(new ApiResponse(true, 'Image deleted successfully'));
  } catch (error) {
    console.error('Error deleting territory image:', error);
    return res.status(500).json(new ApiResponse(false, 'Error deleting territory image'));
  }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const image = await TerritoryImage.getById(imageId);
    if (!image) {
      return res.status(404).json(new ApiResponse(false, 'Image not found'));
    }

    const updatedImage = await TerritoryImage.toggleFeatured(imageId);
    return res.json(new ApiResponse(true, 'Featured status updated successfully', updatedImage));
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return res.status(500).json(new ApiResponse(false, 'Error updating featured status'));
  }
};

// Update display order
exports.updateDisplayOrder = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { display_order } = req.body;
    
    if (!display_order && display_order !== 0) {
      return res.status(400).json(new ApiResponse(false, 'Display order is required'));
    }

    const image = await TerritoryImage.getById(imageId);
    if (!image) {
      return res.status(404).json(new ApiResponse(false, 'Image not found'));
    }

    const updatedImage = await TerritoryImage.updateDisplayOrder(imageId, display_order);
    return res.json(new ApiResponse(true, 'Display order updated successfully', updatedImage));
  } catch (error) {
    console.error('Error updating display order:', error);
    return res.status(500).json(new ApiResponse(false, 'Error updating display order'));
  }
}; 