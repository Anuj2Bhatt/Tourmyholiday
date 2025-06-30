import api from '../utils/axios';

const tourismService = {
  // Get all tourism packages with optional filters
  getAllPackages: async (params = {}) => {
    try {
      const response = await api.get('/api/tourism', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single package by ID
  getPackageById: async (id) => {
    try {
      const response = await api.get(`/api/tourism/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a package by slug
  getPackageBySlug: async (slug) => {
    try {
      const response = await api.get(`/api/tourism/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new tourism package
  createPackage: async (formData) => {
    try {
      const response = await api.post('/api/tourism', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing tourism package
  updatePackage: async (id, formData) => {
    try {
      const response = await api.put(`/api/tourism/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a tourism package
  deletePackage: async (id) => {
    try {
      const response = await api.delete(`/api/tourism/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default tourismService; 