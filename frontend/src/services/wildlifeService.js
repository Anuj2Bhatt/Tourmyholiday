import axios from 'axios';
import { API_URL } from '../config';

const API = `${API_URL}/api/wildlife`;
const MEDIA_API = `${API_URL}/api/wildlife-media`;

export const wildlifeService = {
    // Get all wildlife sanctuaries
    getAllSanctuaries: async () => {
        try {
            const response = await axios.get(API);
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format from server');
            }
                
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get single sanctuary by ID
    getSanctuaryById: async (id) => {
        try {
            const response = await axios.get(`${API}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new sanctuary
    createSanctuary: async (formData) => {
        try {
            const response = await axios.post(API, formData, {
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

    // Update sanctuary
    updateSanctuary: async (id, formData) => {
        try {
            const response = await axios.put(`${API}/${id}`, formData, {
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

    // Delete sanctuary
    deleteSanctuary: async (id) => {
        try {
            const response = await axios.delete(`${API}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Upload gallery images
    uploadGalleryImages: async (sanctuaryId, formData) => {
        try {
            const response = await axios.post(`${MEDIA_API}/${sanctuaryId}/gallery`, formData, {
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

    // Get gallery images
    getGalleryImages: async (sanctuaryId) => {
        try {
            const response = await axios.get(`${MEDIA_API}/${sanctuaryId}/gallery`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete gallery image
    deleteGalleryImage: async (sanctuaryId, imageId) => {
        try {
            const response = await axios.delete(`${MEDIA_API}/${sanctuaryId}/gallery/${imageId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Upload video
    uploadVideo: async (sanctuaryId, formData) => {
        try {
            const response = await axios.post(`${MEDIA_API}/${sanctuaryId}/videos`, formData, {
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

    // Get videos
    getVideos: async (sanctuaryId) => {
        try {
            const response = await axios.get(`${MEDIA_API}/${sanctuaryId}/videos`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete video
    deleteVideo: async (sanctuaryId, videoId) => {
        try {
            const response = await axios.delete(`${MEDIA_API}/${sanctuaryId}/videos/${videoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 