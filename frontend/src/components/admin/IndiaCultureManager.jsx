import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Editor } from '@tinymce/tinymce-react';
import './IndiaCultureManager.css';

const IndiaCultureManager = () => {
  const [activeTab, setActiveTab] = useState('manage-culture');
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

  // Basic Information states
  const [showBasicInfoForm, setShowBasicInfoForm] = useState(false);
  const [basicInfoList, setBasicInfoList] = useState([]);
  const [basicInfoData, setBasicInfoData] = useState({
    culture_id: '',
    info_title: '',
    info_type: '',
    info_description: '',
    info_source: '',
    info_importance: '',
    info_tags: ''
  });
  const [editingInfoId, setEditingInfoId] = useState(null);

  // Fetch cultures on component mount
  useEffect(() => {
    if (activeTab === 'manage-culture') {
      fetchCultures();
    } else if (activeTab === 'basic-info') {
      fetchBasicInfo();
    }
  }, [activeTab]);

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

  const fetchBasicInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/india-culture-info');
      setBasicInfoList(response.data.data || response.data);
    } catch (error) {
      setError('Failed to fetch culture information');
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

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInfoId) {
        // Update existing info
        await api.put(`/api/india-culture-info/${editingInfoId}`, basicInfoData);
      } else {
        // Create new info
        await api.post('/api/india-culture-info', basicInfoData);
      }
      setShowBasicInfoForm(false);
      setEditingInfoId(null);
      setBasicInfoData({
        culture_id: '',
        info_title: '',
        info_type: '',
        info_description: '',
        info_source: '',
        info_importance: '',
        info_tags: ''
      });
      fetchBasicInfo();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save culture information');
    }
  };

  const handleBasicInfoCancel = () => {
    setShowBasicInfoForm(false);
    setEditingInfoId(null);
    setBasicInfoData({
      culture_id: '',
      info_title: '',
      info_type: '',
      info_description: '',
      info_source: '',
      info_importance: '',
      info_tags: ''
    });
  };

  const handleEditBasicInfo = (info) => {
    setBasicInfoData({
      culture_id: info.culture_id,
      info_title: info.info_title,
      info_type: info.info_type,
      info_description: info.info_description,
      info_source: info.info_source,
      info_importance: info.info_importance,
      info_tags: info.info_tags
    });
    setEditingInfoId(info.id);
    setShowBasicInfoForm(true);
  };

  const handleDeleteBasicInfo = async (id) => {
    if (window.confirm('Are you sure you want to delete this culture information?')) {
      try {
        await api.delete(`/api/india-culture-info/${id}`);
        fetchBasicInfo();
      } catch (error) {
        setError('Failed to delete culture information');
      }
    }
  };

  const renderManageCultureTab = () => {
    if (loading) {
      return <div className="loading">Loading India cultures...</div>;
    }

    return (
      <div className="manage-culture-tab">
        <div className="culture-header">
          <h3>Manage India Cultures</h3>
          {!showForm && (
            <button 
              className="add-culture-btn"
              onClick={handleAddNew}
            >
              + Add New Culture
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
            <h4>{editingCulture ? 'Edit India Culture' : 'Add New India Culture'}</h4>
            
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
                <label htmlFor="description">Description *</label>
                <Editor
                  apiKey="m5tpfu2byudniwkqc4ba5djkgsypw5ewcjwltepff4t1ffh6"
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
                  {editingCulture ? 'Update Culture' : 'Add Culture'}
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

  const renderBasicInfoTab = () => {
    return (
      <div className="basic-info-tab">
        <div className="basic-info-header">
          <h3>Basic Information</h3>
          {!showBasicInfoForm && (
            <button 
              className="add-basic-info-btn"
              onClick={() => setShowBasicInfoForm(true)}
            >
              + Add New Information
            </button>
          )}
        </div>

        {showBasicInfoForm && (
          <div className="basic-info-form-section">
            <h4>{editingInfoId ? 'Edit Basic Information' : 'Add Basic Information for Culture'}</h4>
            <form onSubmit={handleBasicInfoSubmit} className="basic-info-form">
              <div className="form-group">
                <label htmlFor="culture_select">Select Culture *</label>
                <select
                  id="culture_select"
                  name="culture_id"
                  value={basicInfoData.culture_id}
                  onChange={handleBasicInfoChange}
                  required
                >
                  <option value="">Choose a culture...</option>
                  {cultures.map((culture) => (
                    <option key={culture.id} value={culture.id}>
                      {culture.title} - {culture.region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="info_title">Information Title *</label>
                  <input
                    type="text"
                    id="info_title"
                    name="info_title"
                    value={basicInfoData.info_title}
                    onChange={handleBasicInfoChange}
                    placeholder="e.g., Traditional Customs, Historical Background"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="info_type">Information Type</label>
                  <select
                    id="info_type"
                    name="info_type"
                    value={basicInfoData.info_type}
                    onChange={handleBasicInfoChange}
                  >
                    <option value="">Select Type</option>
                    <option value="customs">Customs & Traditions</option>
                    <option value="history">Historical Background</option>
                    <option value="festivals">Festivals & Celebrations</option>
                    <option value="cuisine">Cuisine & Food</option>
                    <option value="art">Art & Craft</option>
                    <option value="music">Music & Dance</option>
                    <option value="religion">Religious Practices</option>
                    <option value="lifestyle">Lifestyle & Daily Life</option>
                    <option value="architecture">Architecture</option>
                    <option value="clothing">Clothing & Fashion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="info_description">Information Description *</label>
                <Editor
                  apiKey="m5tpfu2byudniwkqc4ba5djkgsypw5ewcjwltepff4t1ffh6"
                  value={basicInfoData.info_description}
                  onEditorChange={(content) => setBasicInfoData(prev => ({
                    ...prev,
                    info_description: content
                  }))}
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
                  <label htmlFor="info_source">Source/Reference</label>
                  <input
                    type="text"
                    id="info_source"
                    name="info_source"
                    value={basicInfoData.info_source}
                    onChange={handleBasicInfoChange}
                    placeholder="e.g., Historical records, Local elders"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="info_importance">Importance Level</label>
                  <select
                    id="info_importance"
                    name="info_importance"
                    value={basicInfoData.info_importance}
                    onChange={handleBasicInfoChange}
                  >
                    <option value="">Select Importance</option>
                    <option value="high">High Importance</option>
                    <option value="medium">Medium Importance</option>
                    <option value="low">Low Importance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="info_tags">Tags (comma separated)</label>
                <input
                  type="text"
                  id="info_tags"
                  name="info_tags"
                  value={basicInfoData.info_tags}
                  onChange={handleBasicInfoChange}
                  placeholder="e.g., traditional, festival, food, art"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingInfoId ? 'Update Information' : 'Add Information'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleBasicInfoCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!showBasicInfoForm && (
          <div className="basic-info-content">
            <p>Add detailed information about specific aspects of Indian cultures. Select a culture and provide additional details about their customs, traditions, history, and more.</p>
            {basicInfoList.length > 0 && (
              <div className="basic-info-table-container">
                <table className="basic-info-table">
                  <thead>
                    <tr>
                      <th>Sr No</th>
                      <th>Culture</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Importance</th>
                      <th>Tags</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {basicInfoList.map((info, index) => (
                      <tr key={info.id}>
                        <td>{index + 1}</td>
                        <td>{info.culture_title || '-'}</td>
                        <td>{info.info_title}</td>
                        <td>{info.info_type || '-'}</td>
                        <td>
                          <span className={`importance-badge ${info.info_importance}`}>{info.info_importance || '-'}</span>
                        </td>
                        <td>{info.info_tags}</td>
                        <td>
                          <div className="info-actions">
                            <button className="edit-btn" onClick={() => handleEditBasicInfo(info)}>
                              Edit
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteBasicInfo(info.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="india-culture-manager">
      <div className="manager-header">
        <h2>India Culture Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="manager-tabs">
        <button 
          className={`manager-tab-btn ${activeTab === 'manage-culture' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage-culture')}
        >
          🏛️ Manage Culture
        </button>
        <button 
          className={`manager-tab-btn ${activeTab === 'basic-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic-info')}
        >
          ℹ️ Basic Information
        </button>
      </div>

      {/* Tab Content */}
      <div className="manager-content">
        {activeTab === 'manage-culture' && renderManageCultureTab()}
        {activeTab === 'basic-info' && renderBasicInfoTab()}
      </div>
    </div>
  );
};

export default IndiaCultureManager; 