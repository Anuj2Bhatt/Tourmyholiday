import axios from '../utils/axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const territoryHistoryService = {
    // Get all territory history entries
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/territory-history`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },  

    // Get territory history by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/territory-history/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get territory history by slug
    getBySlug: async (slug) => {
        try {
            const response = await axios.get(`${API_URL}/territory-history/slug/${slug}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new territory history
    create: async (historyData) => {
        try {
            const response = await axios.post(`${API_URL}/territory-history`, historyData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update territory history
    update: async (id, historyData) => {
        try {
            const response = await axios.put(`${API_URL}/territory-history/${id}`, historyData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete territory history
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/territory-history/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}; 