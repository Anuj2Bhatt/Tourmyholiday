// API Configuration
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_URL = API_BASE;
export const API_BASE_URL = `${API_BASE}/api`;

// Debug logging
console.log('🔧 API Configuration:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_URL: API_URL,
  API_BASE_URL: API_BASE_URL
});
 
// Other configuration constants can be added here
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif']; 