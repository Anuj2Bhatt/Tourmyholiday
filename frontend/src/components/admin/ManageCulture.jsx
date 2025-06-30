import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Editor } from '@tinymce/tinymce-react';
import './ManageCulture.css';

const ManageCulture = () => {
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true); // Show form by default
  const [editingCulture, setEditingCulture] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    state_name: '',
    region: '',
    category: '',
    population: '',
    language: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch cultures on component mount
  useEffect(() => {
    fetchCultures();
  }, []);

  const fetchCultures = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/india-culture');
      setCultures(response.data);
    } catch (error) {
      setError('Failed to fetch India cultures');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      state_name: '',
      region: '',
      category: '',
      population: '',
      language: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingCulture(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate meta fields
    const keywords = formData.meta_keywords ? formData.meta_keywords.split(/[,\n]/).filter(k => k.trim()) : [];
    
    if (formData.meta_title && formData.meta_title.length > 50) {
      setError('Meta title must be 50 characters or less');
      return;
    }
    
    if (formData.meta_description && formData.meta_description.length > 160) {
      setError('Meta description must be 160 characters or less');
      return;
    }
    
    if (formData.meta_description && formData.meta_description.length < 150) {
      if (!window.confirm('Meta description is less than 150 characters. This may affect SEO. Continue anyway?')) {
        return;
      }
    }
    
    if (keywords.length < 8) {
      setError('Minimum 8 keywords required');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (imageFile) {
        formDataToSend.append('featured_image', imageFile);
      }

      if (editingCulture) {
        await api.put(`/api/india-culture/${editingCulture.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post('/api/india-culture', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setShowForm(false);
      resetForm();
      fetchCultures();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save India culture');
    }
  };

  const handleEdit = (culture) => {
    setEditingCulture(culture);
    setFormData({
      title: culture.title || '',
      slug: culture.slug || '',
      description: culture.description || '',
      state_name: culture.state_name || '',
      region: culture.region || '',
      category: culture.category || '',
      population: culture.population || '',
      language: culture.language || '',
      meta_title: culture.meta_title || '',
      meta_description: culture.meta_description || '',
      meta_keywords: culture.meta_keywords || ''
    });
    setImagePreview(culture.featured_image ? `http://localhost:5000/uploads/${culture.featured_image}` : null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this India culture?')) {
      try {
        await api.delete(`/api/india-culture/${id}`);
        fetchCultures();
      } catch (error) {
        setError('Failed to delete India culture');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const handleAddNew = () => {
    setShowForm(true);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Loading India cultures...</div>;
  }

  return (
    <div className="manage-culture">
      <div className="culture-header">
        <h2>Manage India Culture</h2>
        {!showForm && (
          <button 
            className="add-culture-btn"
            onClick={handleAddNew}
          >
            + Add New India Culture
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="culture-form-section">
          <h3>{editingCulture ? 'Edit India Culture' : 'Add New India Culture'}</h3>
          <form onSubmit={handleSubmit} className="culture-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="slug">Slug *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <Editor
                apiKey="m5tpfu2byudniwkqc4ba5djkgsypw5ewcjwltepff4t1ffh6" // You'll need to get a free API key from TinyMCE
                value={formData.description}
                onEditorChange={handleEditorChange}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state_name">State Name</label>
                <input
                  type="text"
                  id="state_name"
                  name="state_name"
                  value={formData.state_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Rajasthan, Kerala"
                />
              </div>

              <div className="form-group">
                <label htmlFor="region">Region *</label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Region</option>
                  <option value="North India">North India</option>
                  <option value="South India">South India</option>
                  <option value="East India">East India</option>
                  <option value="West India">West India</option>
                  <option value="Central India">Central India</option>
                  <option value="Northeast India">Northeast India</option>
                  <option value="Union Territories">Union Territories</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="festivals">Festivals</option>
                  <option value="traditions">Traditions</option>
                  <option value="cuisine">Cuisine</option>
                  <option value="art">Art & Craft</option>
                  <option value="music">Music & Dance</option>
                  <option value="religion">Religion & Spirituality</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="history">Historical</option>
                  <option value="architecture">Architecture</option>
                  <option value="clothing">Clothing & Fashion</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="population">Population</label>
                <input
                  type="text"
                  id="population"
                  name="population"
                  value={formData.population}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.5 million, 50,000"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="language">Primary Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                placeholder="e.g., Hindi, Tamil, Bengali, Gujarati"
              />
            </div>

            <div className="form-group">
              <label htmlFor="featured_image">Featured Image</label>
              <input
                type="file"
                id="featured_image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview-culture">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="meta_title">Meta Title (Max 50 characters)</label>
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleInputChange}
                maxLength={50}
                placeholder="Enter meta title (max 50 characters)"
              />
              <div className="character-count">
                {formData.meta_title.length}/50 characters
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="meta_description">Meta Description (150-160 characters)</label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                rows="3"
                maxLength={160}
                placeholder="Enter meta description (150-160 characters recommended)"
              />
              <div className="character-count">
                {formData.meta_description.length}/160 characters
                {formData.meta_description.length < 150 && formData.meta_description.length > 0 && (
                  <span className="warning"> (Recommended: 150+ characters)</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="meta_keywords">Meta Keywords (Minimum 8 keywords, separated by comma or enter)</label>
              <textarea
                id="meta_keywords"
                name="meta_keywords"
                value={formData.meta_keywords}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter at least 8 keywords separated by comma or enter"
              />
              <div className="character-count">
                Keywords: {formData.meta_keywords ? formData.meta_keywords.split(/[,\n]/).filter(k => k.trim()).length : 0} keywords
                {formData.meta_keywords && formData.meta_keywords.split(/[,\n]/).filter(k => k.trim()).length < 8 && (
                  <span className="warning"> (Minimum 8 keywords required)</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingCulture ? 'Update India Culture' : 'Add India Culture'}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && cultures.length > 0 && (
        <div className="cultures-list">
          <div className="cultures-table-container">
            <table className="cultures-table">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Featured Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Region</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cultures.map((culture, index) => (
                  <tr key={culture.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="culture-image-cell">
                        {culture.featured_image ? (
                          <img 
                            src={`http://localhost:5000/uploads/${culture.featured_image}`} 
                            alt={culture.title}
                            onError={(e) => {
                              e.target.src = '/images/no-image.png';
                            }}
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="culture-title-cell">
                        <strong>{culture.title}</strong>
                        <div className="culture-slug">/{culture.slug}</div>
                      </div>
                    </td>
                    <td>
                      <div className="culture-description-cell" 
                           dangerouslySetInnerHTML={{ __html: culture.description?.substring(0, 100) + '...' }}>
                      </div>
                    </td>
                    <td>
                      <span className="region-badge">{culture.region}</span>
                    </td>
                    <td>
                      <span className="category-badge">{culture.category}</span>
                    </td>
                    <td>
                      <div className="culture-actions-cell">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(culture)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(culture.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!showForm && cultures.length === 0 && (
        <div className="no-cultures">
          <p>No India cultures found. Add your first culture entry!</p>
        </div>
      )}
    </div>
  );
};

export default ManageCulture; 