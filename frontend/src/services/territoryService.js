import axios from 'axios';
import path from 'path-browserify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get filename from path
const getFilename = (filepath) => {
    if (!filepath) return null;
    // Handle both forward and backward slashes
    const parts = filepath.split(/[\/\\]/);
    return parts[parts.length - 1];
};

export const territoryService = {
    // Get all territories
    async getAllTerritories() {
        try {
            console.log('Fetching territories from:', `${API_URL}/api/territories`);
            const response = await axios.get(`${API_URL}/api/territories`);
            console.log('Territories API Response:', response);
            
            // Check if response has data
            if (!response.data) {
                console.error('No data in response');
                return { success: false, data: [] };
            }

            // If response.data is already an array, return it
            if (Array.isArray(response.data)) {
                return { success: true, data: response.data };
            }

            // If response.data has a data property that's an array, use that
            if (response.data.data && Array.isArray(response.data.data)) {
                // Process image URLs
                const territories = response.data.data.map(territory => ({
                    ...territory,
                    preview_image: territory.preview_image ? 
                        `${API_URL}/uploads/${getFilename(territory.preview_image)}` : 
                        null
                }));
                return { success: true, data: territories };
            }

            // If we can't find an array, return empty array
            console.error('No array found in response:', response.data);
            return { success: true, data: [] };
        } catch (error) {
            console.error('Error fetching territories:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    // Get single territory
    getTerritory: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/api/territories/${id}`);
            if (response.data.success) {
                // Process image URL
                const territory = {
                    ...response.data.data,
                    preview_image: response.data.data.preview_image ? 
                        `${API_URL}/uploads/${getFilename(response.data.data.preview_image)}` : 
                        null
                };
                return { success: true, data: territory };
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new territory
    async createTerritory(formData) {
        try {
            // Log FormData contents for debugging
            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            const response = await axios.post(`${API_URL}/api/territories`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                // Process image URL
                const territory = {
                    ...response.data.data,
                    preview_image: response.data.data.preview_image ? 
                        `${API_URL}/uploads/${getFilename(response.data.data.preview_image)}` : 
                        null
                };
                return { success: true, data: territory };
            }
            return response.data;
        } catch (error) {
            console.error('Error creating territory:', error);
            if (error.response?.data?.errors) {
                return { success: false, errors: error.response.data.errors };
            }
            throw error;
        }
    },

    // Update territory
    async updateTerritory(id, formData) {
        try {
            // Log FormData contents for debugging
            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            // Ensure all required fields are present
            const requiredFields = ['title', 'slug', 'capital'];
            const missingFields = requiredFields.filter(field => !formData.get(field));
            
            if (missingFields.length > 0) {
                return {
                    success: false,
                    errors: missingFields.map(field => ({
                        path: field,
                        msg: `${field} is required`
                    }))
                };
            }

            const response = await axios.put(`${API_URL}/api/territories/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                // Process image URL
                const territory = {
                    ...response.data.data,
                    preview_image: response.data.data.preview_image ? 
                        `${API_URL}/uploads/${getFilename(response.data.data.preview_image)}` : 
                        null
                };
                return { success: true, data: territory };
            }
            return response.data;
        } catch (error) {
            console.error('Error in updateTerritory:', error.response?.data || error);
            if (error.response?.data?.errors) {
                return { success: false, errors: error.response.data.errors };
            }
            throw error;
        }
    },

    // Delete territory
    async deleteTerritory(id) {
        try {
            const response = await axios.delete(`${API_URL}/api/territories/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting territory:', error);
            throw error;
        }
    },

    getTerritoryBySlug: async (slug) => {
        try {
            const response = await axios.get(`${API_URL}/api/territories/slug/${slug}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error fetching territory'
            };
        }
    }
}; 