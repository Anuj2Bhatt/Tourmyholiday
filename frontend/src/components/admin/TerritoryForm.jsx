import React, { useState, useEffect } from 'react';
import './TerritoryForm.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TerritoryForm = ({ isOpen, onClose, territory, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    capital: '',
    famous_for: '',
    preview_image: null,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    preview_image_url: null
  });

  const [originalData, setOriginalData] = useState(null);
  const [metaValidation, setMetaValidation] = useState({
    meta_title: { isValid: true, message: '', charCount: 0 },
    meta_description: { isValid: true, message: '', charCount: 0 },
    meta_keywords: { isValid: true, message: '', keywordCount: 0 }
  });

  const [backendErrors, setBackendErrors] = useState({});
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const META_TITLE_MIN = 50;
  const META_TITLE_MAX = 60;
  const META_DESC_MIN = 150;
  const META_DESC_MAX = 160;
  const MIN_KEYWORDS = 8;

  // Add image validation constants
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Add image validation function
  const validateImage = (file) => {
    if (!file) return { isValid: true };

    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        message: `Invalid file type. Allowed types: JPEG, PNG, WebP, GIF`
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        message: `File size should be less than 5MB`
      };
    }

    return { isValid: true };
  };

  const validateMetaFields = (fieldName, value) => {
    const validation = {
      meta_title: { ...metaValidation.meta_title },
      meta_description: { ...metaValidation.meta_description },
      meta_keywords: { ...metaValidation.meta_keywords }
    };

    // If a specific field is being validated
    if (fieldName) {
      const fieldValue = value || formData[fieldName];
      
      switch (fieldName) {
        case 'meta_title':
          validation.meta_title.charCount = fieldValue.length;
          if (fieldValue) {
            if (fieldValue.length < META_TITLE_MIN) {
              validation.meta_title = {
                ...validation.meta_title,
                isValid: false,
                message: `Meta title should be at least ${META_TITLE_MIN} characters (currently ${fieldValue.length})`
              };
            } else if (fieldValue.length > META_TITLE_MAX) {
              validation.meta_title = {
                ...validation.meta_title,
                isValid: false,
                message: `Meta title should not exceed ${META_TITLE_MAX} characters (currently ${fieldValue.length})`
              };
            } else {
              validation.meta_title = {
                ...validation.meta_title,
                isValid: true,
                message: ''
              };
            }
          }
          break;

        case 'meta_description':
          validation.meta_description.charCount = fieldValue.length;
          if (fieldValue) {
            if (fieldValue.length < META_DESC_MIN) {
              validation.meta_description = {
                ...validation.meta_description,
                isValid: false,
                message: `Meta description should be at least ${META_DESC_MIN} characters (currently ${fieldValue.length})`
              };
            } else if (fieldValue.length > META_DESC_MAX) {
              validation.meta_description = {
                ...validation.meta_description,
                isValid: false,
                message: `Meta description should not exceed ${META_DESC_MAX} characters (currently ${fieldValue.length})`
              };
            } else {
              validation.meta_description = {
                ...validation.meta_description,
                isValid: true,
                message: ''
              };
            }
          }
          break;

        case 'meta_keywords':
          if (fieldValue) {
            const keywords = fieldValue.split(',').map(k => k.trim()).filter(k => k);
            validation.meta_keywords.keywordCount = keywords.length;
            if (keywords.length < MIN_KEYWORDS) {
              validation.meta_keywords = {
                ...validation.meta_keywords,
                isValid: false,
                message: `Please add at least ${MIN_KEYWORDS} keywords (currently ${keywords.length})`
              };
            } else {
              validation.meta_keywords = {
                ...validation.meta_keywords,
                isValid: true,
                message: ''
              };
            }
          }
          break;
      }
    } else {
      // Validate all fields
      if (formData.meta_title) {
        validation.meta_title.charCount = formData.meta_title.length;
        if (formData.meta_title.length < META_TITLE_MIN) {
          validation.meta_title = {
            ...validation.meta_title,
            isValid: false,
            message: `Meta title should be at least ${META_TITLE_MIN} characters (currently ${formData.meta_title.length})`
          };
        } else if (formData.meta_title.length > META_TITLE_MAX) {
          validation.meta_title = {
            ...validation.meta_title,
            isValid: false,
            message: `Meta title should not exceed ${META_TITLE_MAX} characters (currently ${formData.meta_title.length})`
          };
        } else {
          validation.meta_title = {
            ...validation.meta_title,
            isValid: true,
            message: ''
          };
        }
      }

      if (formData.meta_description) {
        validation.meta_description.charCount = formData.meta_description.length;
        if (formData.meta_description.length < META_DESC_MIN) {
          validation.meta_description = {
            ...validation.meta_description,
            isValid: false,
            message: `Meta description should be at least ${META_DESC_MIN} characters (currently ${formData.meta_description.length})`
          };
        } else if (formData.meta_description.length > META_DESC_MAX) {
          validation.meta_description = {
            ...validation.meta_description,
            isValid: false,
            message: `Meta description should not exceed ${META_DESC_MAX} characters (currently ${formData.meta_description.length})`
          };
        } else {
          validation.meta_description = {
            ...validation.meta_description,
            isValid: true,
            message: ''
          };
        }
      }

      if (formData.meta_keywords) {
        const keywords = formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
        validation.meta_keywords.keywordCount = keywords.length;
        if (keywords.length < MIN_KEYWORDS) {
          validation.meta_keywords = {
            ...validation.meta_keywords,
            isValid: false,
            message: `Please add at least ${MIN_KEYWORDS} keywords (currently ${keywords.length})`
          };
        } else {
          validation.meta_keywords = {
            ...validation.meta_keywords,
            isValid: true,
            message: ''
          };
        }
      }
    }

    setMetaValidation(validation);
    return Object.values(validation).every(v => v.isValid);
  };

  useEffect(() => {
    if (territory) {
      const initialData = {
        title: territory.title || territory.name || '',
        slug: territory.slug || '',
        capital: territory.capital || territory.state_name || '',
        famous_for: territory.famous_for || '',
        preview_image: null,
        meta_title: territory.meta_title || '',
        meta_description: territory.meta_description || '',
        meta_keywords: territory.meta_keywords || '',
        preview_image_url: territory.preview_image || null
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setIsSlugEdited(true);
    } else {
      const emptyData = {
        title: '',
        slug: '',
        capital: '',
        famous_for: '',
        preview_image: null,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        preview_image_url: null
      };
      setFormData(emptyData);
      setOriginalData(null);
      setIsSlugEdited(false);
    }
  }, [territory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from title if not manually edited
    if (name === 'title' && !isSlugEdited) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Validate meta fields
    validateMetaFields(name, value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setBackendErrors(prev => ({
        ...prev,
        preview_image: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
      }));
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setBackendErrors(prev => ({
        ...prev,
        preview_image: 'File size too large. Maximum size is 5MB'
      }));
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        preview_image: file,
        preview_image_url: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendErrors({});

    // Create FormData
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('slug', formData.slug);
    formDataToSend.append('capital', formData.capital);
    formDataToSend.append('famous_for', formData.famous_for);
    formDataToSend.append('meta_title', formData.meta_title);
    formDataToSend.append('meta_description', formData.meta_description);
    formDataToSend.append('meta_keywords', formData.meta_keywords);

    // Only append image if it's a new file
    if (formData.preview_image instanceof File) {
      formDataToSend.append('preview_image', formData.preview_image);
    }

    try {
      let response;
      if (territory) {
        // Update existing territory
        response = await axios.put(`${API_URL}/api/territories/${territory.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new territory
        response = await axios.post(`${API_URL}/api/territories`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data.success) {
        toast.success(territory ? 'Territory updated successfully!' : 'Territory created successfully!');
        onSubmit(response.data.data);
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setBackendErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Error submitting form');
      }
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (formData.preview_image_url && formData.preview_image_url.startsWith('blob:')) {
        URL.revokeObjectURL(formData.preview_image_url);
      }
    };
  }, [formData.preview_image_url]);

  if (!isOpen) return null;

  return (
    <div className={`territory-form-overlay ${isOpen ? 'active' : ''}`}>
      <div className="territory-form-container">
        <div className="territory-form-header">
          <h2>{territory ? 'Edit Territory' : 'Add New Territory'}</h2>
          <button className="territory-form-close" onClick={onClose}>×</button>
        </div>

        {backendErrors.general && (
          <div className="backend-error-message">
            {backendErrors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="territory-form">
          <div className="territory-form-grid">
            <div className="territory-form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter territory title"
                className={backendErrors.title ? 'invalid' : ''}
              />
              {backendErrors.title && (
                <div className="validation-message error">
                  {backendErrors.title}
                </div>
              )}
            </div>

            <div className="territory-form-group">
              <label htmlFor="slug">Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                onFocus={() => setIsSlugEdited(true)}
                required
                placeholder="Enter territory slug"
                className={backendErrors.slug ? 'invalid' : ''}
              />
              {backendErrors.slug && (
                <div className="validation-message error">
                  {backendErrors.slug}
                </div>
              )}
            </div>

            <div className="territory-form-group">
              <label htmlFor="capital">Capital *</label>
              <input
                type="text"
                id="capital"
                name="capital"
                value={formData.capital}
                onChange={handleChange}
                required
                placeholder="Enter capital city"
                className={backendErrors.capital ? 'invalid' : ''}
              />
              {backendErrors.capital && (
                <div className="validation-message error">
                  {backendErrors.capital}
                </div>
              )}
            </div>

            <div className="territory-form-group">
              <label htmlFor="famous_for">Famous For</label>
              <textarea
                id="famous_for"
                name="famous_for"
                value={formData.famous_for}
                onChange={handleChange}
                placeholder="What is this territory famous for?"
                rows="4"
                className={backendErrors.famous_for ? 'invalid' : ''}
              />
              {backendErrors.famous_for && (
                <div className="validation-message error">
                  {backendErrors.famous_for}
                </div>
              )}
            </div>

            <div className="territory-form-group territory-image-upload">
              <label htmlFor="preview_image">Preview Image</label>
              <input
                type="file"
                id="preview_image"
                name="preview_image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {formData.preview_image_url && (
                <div className="territory-image-preview">
                  <img 
                    src={formData.preview_image_url} 
                    alt="Preview" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${API_URL}/uploads/placeholder.jpg`;
                    }}
                  />
                </div>
              )}
              {backendErrors.preview_image && (
                <div className="validation-message error">
                  {backendErrors.preview_image}
                </div>
              )}
            </div>

            <div className="territory-form-group">
              <label htmlFor="meta_title">
                Meta Title
                <span className="char-count">
                  ({metaValidation.meta_title.charCount}/{META_TITLE_MAX} characters)
                </span>
              </label>
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                placeholder="Enter meta title for SEO (50-60 characters)"
                className={!metaValidation.meta_title.isValid || backendErrors.meta_title ? 'invalid' : ''}
                maxLength={META_TITLE_MAX}
              />
              {!metaValidation.meta_title.isValid && (
                <div className="validation-message error">
                  {metaValidation.meta_title.message}
                </div>
              )}
              {backendErrors.meta_title && (
                <div className="validation-message error">
                  {backendErrors.meta_title}
                </div>
              )}
            </div>

            <div className="territory-form-group">
              <label htmlFor="meta_description">
                Meta Description
                <span className="char-count">
                  ({metaValidation.meta_description.charCount}/{META_DESC_MAX} characters)
                </span>
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                placeholder="Enter meta description for SEO (150-160 characters)"
                rows="3"
                className={!metaValidation.meta_description.isValid || backendErrors.meta_description ? 'invalid' : ''}
                maxLength={META_DESC_MAX}
              />
              {!metaValidation.meta_description.isValid && (
                <div className="validation-message error">
                  {metaValidation.meta_description.message}
                </div>
              )}
              {backendErrors.meta_description && (
                <div className="validation-message error">
                  {backendErrors.meta_description}
                </div>
              )}
            </div>

            <div className="territory-form-group">
              <label htmlFor="meta_keywords">
                Meta Keywords
                <span className="char-count">
                  ({metaValidation.meta_keywords.keywordCount} keywords, minimum {MIN_KEYWORDS} required)
                </span>
              </label>
              <input
                type="text"
                id="meta_keywords"
                name="meta_keywords"
                value={formData.meta_keywords}
                onChange={handleChange}
                placeholder="Enter comma-separated keywords (minimum 8 keywords)"
                className={!metaValidation.meta_keywords.isValid || backendErrors.meta_keywords ? 'invalid' : ''}
              />
              {!metaValidation.meta_keywords.isValid && (
                <div className="validation-message error">
                  {metaValidation.meta_keywords.message}
                </div>
              )}
              {backendErrors.meta_keywords && (
                <div className="validation-message error">
                  {backendErrors.meta_keywords}
                </div>
              )}
            </div>
          </div>

          <div className="territory-form-actions">
            <button type="button" className="territory-form-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="territory-form-submit">
              {territory ? 'Update Territory' : 'Add Territory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerritoryForm; 