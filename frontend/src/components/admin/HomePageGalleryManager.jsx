import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePageGalleryManager.css';

const HomePageGalleryManager = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    altText: '',
    image: null
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/gallery');
      // Ensure all image URLs are absolute
      const formattedImages = response.data.map(img => ({
        ...img,
        image_path: img.image_path.startsWith('http') ? img.image_path : `http://localhost:5000${img.image_path}`
      }));
      setImages(formattedImages);
    } catch (error) {
      setError('Failed to fetch images');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('altText', formData.altText);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (selectedImage) {
        // Update existing image
        await axios.put(`http://localhost:5000/api/gallery/${selectedImage.id}`, formDataToSend, config);
      } else {
        // Add new image
        await axios.post('http://localhost:5000/api/gallery', formDataToSend, config);
      }

      // Reset form and refresh images
      setFormData({
        title: '',
        description: '',
        altText: '',
        image: null
      });
      setSelectedImage(null);
      setPreviewUrl(null);
      await fetchImages();
    } catch (error) {
      setError('Failed to save image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (image) => {
    setSelectedImage(image);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      altText: image.alt_text || '',
      image: null
    });
    // Ensure the preview URL is absolute
    const previewUrl = image.image_path.startsWith('http') ? image.image_path : `http://localhost:5000${image.image_path}`;
    setPreviewUrl(previewUrl);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await axios.delete(`http://localhost:5000/api/gallery/${id}`);
        await fetchImages();
      } catch (error) {
        setError('Failed to delete image');
      }
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setFormData({
      title: '',
      description: '',
      altText: '',
      image: null
    });
    setPreviewUrl(null);
  };

  return (
    <div className="homepage-gallery-manager">
      <h2>Manage Home Page Gallery</h2>
      
      {error && <div className="homepage-gallery-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="homepage-gallery-form">
        <div className="homepage-gallery-form-preview">
          <div className="homepage-gallery-form-section">
            <div className="homepage-gallery-form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter image title"
              />
            </div>
            
            <div className="homepage-gallery-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Enter image description"
                rows="4"
              />
            </div>
            
            <div className="homepage-gallery-form-group">
              <label htmlFor="altText">Alt Text</label>
              <input
                type="text"
                id="altText"
                name="altText"
                value={formData.altText}
                onChange={handleInputChange}
                required
                placeholder="Enter alt text for accessibility"
              />
            </div>
            
            <div className="homepage-gallery-form-group">
              <label htmlFor="image" className="homepage-gallery-upload-label">
                <span className="homepage-gallery-upload-icon">📁</span>
                {formData.image ? 'Change Image' : 'Choose Image'}
              </label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                required={!selectedImage}
                className="homepage-gallery-file-input"
              />
            </div>
            
            <div className="homepage-gallery-form-actions">
              <button type="submit" className="homepage-gallery-submit-btn" disabled={isLoading}>
                {isLoading ? 'Saving...' : selectedImage ? 'Update Image' : 'Add Image'}
              </button>
              
              {selectedImage && (
                <button type="button" className="homepage-gallery-cancel-btn" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div className="homepage-gallery-preview-section">
            <h3>Image Preview</h3>
            {previewUrl ? (
              <div className="homepage-gallery-image-preview">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            ) : (
              <div className="homepage-gallery-no-preview">
                <span className="homepage-gallery-preview-icon">🖼️</span>
                <p>No image selected</p>
              </div>
            )}
          </div>
        </div>
      </form>
      
      <div className="homepage-gallery-grid">
        {images.map(image => (
          <div key={image.id} className="homepage-gallery-item">
            <div className="homepage-gallery-image">
              <img 
                src={image.image_path} 
                alt={image.alt_text || image.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            <div className="homepage-gallery-info">
              <h3>{image.title}</h3>
              <p>{image.description}</p>
            </div>
            <div className="homepage-gallery-actions">
              <button onClick={() => handleEdit(image)} className="homepage-gallery-edit-btn">
                <span className="homepage-gallery-btn-icon">✏️</span> Edit
              </button>
              <button onClick={() => handleDelete(image.id)} className="homepage-gallery-delete-btn">
                <span className="homepage-gallery-btn-icon">🗑️</span> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePageGalleryManager; 