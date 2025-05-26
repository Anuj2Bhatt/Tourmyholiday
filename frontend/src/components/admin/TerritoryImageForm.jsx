import React, { useState, useRef } from 'react';
import './TerritoryImageForm.css';

const TerritoryImageForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    image: null,
    alt_text: '',
    description: '',
    is_featured: false,
    display_order: 0
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  const validate = () => {
    const newErrors = {};
    if (!formData.image) newErrors.image = 'Please select an image.';
    if (!formData.alt_text || formData.alt_text.length < 3) newErrors.alt_text = 'Alt text should be at least 3 characters.';
    if (!formData.description || formData.description.length < 5) newErrors.description = 'Description should be at least 5 characters.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file' && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('image', formData.image);
      submitData.append('alt_text', formData.alt_text);
      submitData.append('description', formData.description);
      submitData.append('is_featured', formData.is_featured);
      submitData.append('display_order', formData.display_order);
      await onSubmit(submitData);
      setFormData({ image: null, alt_text: '', description: '', is_featured: false, display_order: 0 });
      setPreview(null);
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="territory-image-form-overlay">
      <div className="territory-image-form-container">
        <div className="territory-image-form-header">
          <h2>Add New Image</h2>
          <button className="territory-image-form-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="territory-image-form" autoComplete="off">
          <div className="territory-image-form-group">
            <label htmlFor="image">Image <span title="Required">*</span></label>
            <div
              className={`territory-image-dropzone${preview ? ' has-image' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              title="Click or drag an image here"
            >
              {preview ? (
                <div className="territory-image-preview">
                  <img src={preview} alt="Preview" />
                  <button type="button" className="remove-image-btn" onClick={e => { e.stopPropagation(); handleRemoveImage(); }}>Remove</button>
                </div>
              ) : (
                <span className="dropzone-text">Drag & drop or click to select an image (JPG, PNG, GIF, max 5MB)</span>
              )}
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
            </div>
            {errors.image && <div className="form-error">{errors.image}</div>}
            <div className="form-helper">Recommended: 800x600px, JPG/PNG/GIF, max 5MB.</div>
          </div>

          <div className="territory-image-form-group">
            <label htmlFor="alt_text">Alt Text <span title="Required">*</span></label>
            <input
              type="text"
              id="alt_text"
              name="alt_text"
              value={formData.alt_text}
              onChange={handleChange}
              placeholder="E.g. 'Sunset view of the territory'"
              required
            />
            {errors.alt_text && <div className="form-error">{errors.alt_text}</div>}
            <div className="form-helper">Describe the image for accessibility and SEO (min 3 characters).</div>
          </div>

          <div className="territory-image-form-group">
            <label htmlFor="description">Description <span title="Required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this image shows or why it's important."
              required
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
            <div className="form-helper">Give more context about the image (min 5 characters).</div>
          </div>

          <div className="territory-image-form-group">
            <label htmlFor="display_order">Display Order</label>
            <input
              type="number"
              id="display_order"
              name="display_order"
              value={formData.display_order}
              onChange={handleChange}
              min="0"
            />
            <div className="form-helper">Lower numbers appear first. Default is 0.</div>
          </div>

          <div className="territory-image-form-group checkbox">
            <label className="featured-checkbox-label">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
              />
              <span className="featured-checkbox-custom"></span>
              Featured Image
            </label>
            <div className="form-helper">Mark as featured to highlight this image.</div>
          </div>

          <div className="territory-image-form-actions">
            <button type="button" className="territory-image-form-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="territory-image-form-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerritoryImageForm; 