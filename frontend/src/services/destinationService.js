import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all destinations
export const getDestinations = async () => {
  try {
    const response = await axios.get(`${API_URL}/destinations`);
    return response.data;
  } catch (error) {
    throw error;    
  }
};

// Get a single destination by slug
export const getDestinationBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_URL}/destinations/${slug}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new destination
export const createDestination = async (destinationData) => {
  try {
    // Create FormData object for file upload
    const formData = new FormData();
    
    // Append all text fields
    Object.keys(destinationData).forEach(key => {
      if (key === 'featuredImage' && destinationData[key] instanceof File) {
        formData.append('featuredImage', destinationData[key]);
      } else if (key !== 'featuredImage') {
        // Convert arrays and objects to JSON strings
        const value = typeof destinationData[key] === 'object' 
          ? JSON.stringify(destinationData[key])
          : destinationData[key];
        formData.append(key, value);
      }
    });

    const response = await axios.post(`${API_URL}/destinations`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing destination
export const updateDestination = async (id, destinationData) => {
  try {
    // Create FormData object for file upload
    const formData = new FormData();
    
    // Append all text fields
    Object.keys(destinationData).forEach(key => {
      if (key === 'featuredImage' && destinationData[key] instanceof File) {
        formData.append('featuredImage', destinationData[key]);
      } else if (key !== 'featuredImage') {
        // Convert arrays and objects to JSON strings
        const value = typeof destinationData[key] === 'object' 
          ? JSON.stringify(destinationData[key])
          : destinationData[key];
        formData.append(key, value);
      }
    });

    const response = await axios.put(`${API_URL}/destinations/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a destination
export const deleteDestination = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/destinations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get trending destinations
export const getTrendingDestinations = async (limit = 6) => {
  try {
    const response = await axios.get(`${API_URL}/destinations/trending?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search destinations
export const searchDestinations = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/destinations/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {   
    throw error;
  }
}; 