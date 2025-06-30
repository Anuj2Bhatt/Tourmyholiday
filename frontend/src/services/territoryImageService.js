import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const territoryImageService = {
  // Get all images for a territory
  getTerritoryImages: async (territoryId) => {
    try {
      const response = await axios.get(`${API_URL}/api/territory-images/by-territory/${territoryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;    
    }
  },

  // Add a new image
  addTerritoryImage: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/api/territory-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update an image
  updateTerritoryImage: async (imageId, formData) => {
    try {
      const response = await axios.put(`${API_URL}/api/territory-images/${imageId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete an image
  deleteTerritoryImage: async (imageId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/territory-images/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle featured status
  toggleFeatured: async (imageId) => {
    try {
      const response = await axios.patch(`${API_URL}/api/territory-images/${imageId}/feature`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update display order
  updateDisplayOrder: async (imageId, displayOrder) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/territory-images/${imageId}/order`,
        { display_order: displayOrder },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 