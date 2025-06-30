const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Get the correct image URL for display
 * @param {string} imagePath - The image path from backend
 * @param {string} fallbackImage - Fallback image URL if image fails to load
 * @returns {string} - Complete image URL
 */
export const getImageUrl = (imagePath, fallbackImage = '/placeholder-image.jpg') => {
  if (!imagePath) return fallbackImage;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // If path already contains 'uploads', don't add it again
  if (cleanPath.startsWith('uploads/')) {
    return `${API_URL}/${cleanPath}`;
  }
  
  // Add uploads prefix if not present
  return `${API_URL}/uploads/${cleanPath}`;
};

/**
 * Get a proper placeholder image URL
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = () => {
  // Use a reliable placeholder service or local image
  return 'https://via.placeholder.com/300x200/cccccc/666666?text=No+Image';
};

/**
 * Get image component with error handling
 * @param {string} imagePath - The image path from backend
 * @param {string} alt - Alt text for image
 * @param {string} fallbackImage - Fallback image URL
 * @param {object} style - Additional styles
 * @returns {JSX.Element} - Image component
 */
export const ImageWithFallback = ({ 
  imagePath, 
  alt = 'Image', 
  fallbackImage = null,
  style = {},
  className = '',
  ...props 
}) => {
  const handleError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = fallbackImage || getPlaceholderImage();
  };

  return (
    <img
      src={getImageUrl(imagePath, fallbackImage || getPlaceholderImage())}
      alt={alt}
      onError={handleError}
      style={style}
      className={className}
      {...props}
    />
  );
}; 