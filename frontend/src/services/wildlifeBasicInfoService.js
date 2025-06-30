import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const wildlifeBasicInfoService = {
  // Get all basic info records
  getAllBasicInfo: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wildlife-basic-info`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get basic info by sanctuary ID
  getBasicInfoBySanctuary: async (sanctuaryId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wildlife-basic-info/sanctuary/${sanctuaryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get basic info by record ID
  getBasicInfoById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wildlife-basic-info/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new basic info record
  createBasicInfo: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wildlife-basic-info`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update basic info record
  updateBasicInfo: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/wildlife-basic-info/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete basic info record
  deleteBasicInfo: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/wildlife-basic-info/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search basic info by sanctuary name
  searchBasicInfoByName: async (sanctuaryName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wildlife-basic-info/search/${sanctuaryName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default wildlifeBasicInfoService; 