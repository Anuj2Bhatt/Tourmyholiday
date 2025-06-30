import axios from '../utils/axios';

const API_BASE_URL = '/api/wildlife-flora';

// Wildlife Flora Service
const wildlifeFloraService = {
    // Get all wildlife flora items
    getAllItems: async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data;
        } catch (error) {
            throw error;    
        }
    },

    // Get wildlife flora items grouped by sanctuary
    getAllItemsGroupedBySanctuary: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/grouped-by-sanctuary`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get wildlife flora items by sanctuary
    getItemsBySanctuary: async (sanctuaryId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/sanctuary/${sanctuaryId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get wildlife flora items by category
    getItemsByCategory: async (category) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/category/${category}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get single wildlife flora item
    getItemById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new wildlife flora item
    createItem: async (formData) => {
        try {
            const response = await axios.post(API_BASE_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update wildlife flora item
    updateItem: async (id, formData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete wildlife flora item
    deleteItem: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete all wildlife flora items for a sanctuary
    deleteAllBySanctuary: async (sanctuaryId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/sanctuary/${sanctuaryId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Upload additional image
    uploadAdditionalImage: async (itemId, formData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${itemId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete additional image
    deleteAdditionalImage: async (imageId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/images/${imageId}`);
            return response.data;
        } catch (error) {   
            throw error;
        }
    },

    // Helper function to prepare form data for item creation/update
    prepareFormData: (itemData, imageFile = null) => {
        const formData = new FormData();
        
        // Add basic fields
        formData.append('sanctuary_id', itemData.sanctuary_id);
        formData.append('category', itemData.category);
        formData.append('name', itemData.name);
        formData.append('description', itemData.description || '');
        formData.append('sort_order', itemData.sort_order || 0);
        formData.append('is_active', itemData.is_active !== undefined ? itemData.is_active : true);
        
        // Add image if provided
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        return formData;
    },

    // Helper function to prepare form data for additional image upload
    prepareImageFormData: (imageFile, altText = '', sortOrder = 0) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('alt_text', altText);
        formData.append('sort_order', sortOrder);
        return formData;
    }
};

export default wildlifeFloraService; 