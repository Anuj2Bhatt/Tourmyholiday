import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageStates.css';

const ManageStates = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [deletingStateId, setDeletingStateId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '',
    capital: '',
    activities: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    image: null,
    imagePreview: null,
    route: ''
  });
  const [activeTab, setActiveTab] = useState('states');
  const [selectedStateForImages, setSelectedStateForImages] = useState('');
  const [activeSeasonTab, setActiveSeasonTab] = useState('summer');
  const [seasonImages, setSeasonImages] = useState({
    summer: [],
    monsoon: [],
    autumn: [],
    winter: [],
    spring: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    image: null,
    location: '',
    alt: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/states');
      // Sort states by created_at in ascending order (oldest first)
      const sortedStates = response.data.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      setStates(sortedStates);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch states. Please check your connection and try again.');
      setLoading(false);
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
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('emoji', formData.emoji);
      formDataToSend.append('capital', formData.capital);
      formDataToSend.append('activities', formData.activities);
      formDataToSend.append('metaTitle', formData.metaTitle);
      formDataToSend.append('metaDescription', formData.metaDescription);
      formDataToSend.append('metaKeywords', formData.metaKeywords);
      formDataToSend.append('route', formData.route);
      
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      } else if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingState) {
        const response = await axios.put(`http://localhost:5000/api/states/${editingState.id}`, formDataToSend);
        setStates(states.map(state => state.id === editingState.id ? response.data : state));
      } else {
        const response = await axios.post('http://localhost:5000/api/states', formDataToSend);
        setStates([...states, response.data]);
      }

      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        emoji: '',
        capital: '',
        activities: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        image: null,
        imagePreview: null,
        route: ''
      });
      setEditingState(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save state. Please try again.');
    }
  };

  const handleEdit = (state) => {
    setFormData({
      name: state.name,
      description: state.description,
      emoji: state.emoji,
      capital: state.capital,
      activities: state.activities,
      metaTitle: state.meta_title || '',
      metaDescription: state.meta_description || '',
      metaKeywords: state.meta_keywords || '',
      image: state.image,
      imagePreview: state.image ? `http://localhost:5000${state.image}` : null,
      route: state.route || ''
    });
    setEditingState(state);
    setShowModal(true);
  };

  const handleDelete = async (stateId) => {
    if (!window.confirm('Are you sure you want to delete this state? This action cannot be undone.')) {
      return;
    }

    setDeletingStateId(stateId);
    setError(null);

    try {
      const response = await axios.delete(`http://localhost:5000/api/states/${stateId}`);
      
      if (response.data.message) {
        setStates(prevStates => prevStates.filter(state => state.id !== stateId));
        alert('State deleted successfully');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      let errorMessage = 'Failed to delete state. ';
      
      if (err.response) {
        errorMessage += err.response.data.error || err.response.data.message || 'Please try again.';
      } else if (err.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        errorMessage += err.message || 'Please try again.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeletingStateId(null);
    }
  };

  const handleAddNew = () => {
    setEditingState(null);
    setFormData({
      name: '',
      description: '',
      emoji: '',
      capital: '',
      activities: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      image: null,
      imagePreview: null,
      route: ''
    });
    setShowModal(true);
  };

  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFormData(prev => ({
        ...prev,
        image: file
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSeasonImageUpload = async (e, season) => {
    e.preventDefault();
    if (!uploadFormData.image || !selectedStateForImages) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', uploadFormData.image);
    formData.append('season', season);
    formData.append('stateId', selectedStateForImages);
    formData.append('location', uploadFormData.location);
    formData.append('alt', uploadFormData.alt);

    try {
      const response = await axios.post('http://localhost:5000/api/state-season-images', formData);
      setSeasonImages(prev => ({
        ...prev,
        [season]: [...prev[season], response.data]
      }));
      // Reset form and preview after successful upload
      setUploadFormData({
        image: null,
        location: '',
        alt: ''
      });
      setImagePreview(null);
      alert('Image uploaded successfully!');
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteSeasonImage = async (imageId, season) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/state-season-images/${imageId}`);
      setSeasonImages(prev => ({
        ...prev,
        [season]: prev[season].filter(img => img.id !== imageId)
      }));
      alert('Image deleted successfully!');
    } catch (error) {
      alert('Failed to delete image. Please try again.');
    }
  };

  const fetchSeasonImages = async (stateId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/state-season-images/${stateId}`);
      setSeasonImages(response.data);
    } catch (error) {
      }
  };

  useEffect(() => {
    if (selectedStateForImages) {
      fetchSeasonImages(selectedStateForImages);
    }
  }, [selectedStateForImages]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="manage-states">
      <div className="states-header">
        <div className="header-content">
          <div className="header-row">
            <h2>Manage States</h2>
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'states' ? 'active' : ''}`}
                onClick={() => setActiveTab('states')}
              >
                States
              </button>
              <button 
                className={`tab-btn ${activeTab === 'seasonImages' ? 'active' : ''}`}
                onClick={() => setActiveTab('seasonImages')}
              >
                Season Images
              </button>
            </div>
            {activeTab === 'states' && (
              <button className="add-state-btn" onClick={handleAddNew}>
                <span className="plus-icon">+</span>
                <span className="btn-text">Add New State</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'states' ? (
        <div className="states-list">
          {states.map(state => (
            <div key={state.id} className="state-card">
              <div className="state-image">
                {state.image ? (
                  <img 
                    src={state.image.startsWith('http') ? state.image : `http://localhost:5000${state.image}`}
                    alt={state.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="state-title">
                <h3>{state.emoji} {state.name}</h3>
              </div>
              <div className="state-actions">
                <button 
                  className="edit-btn" 
                  onClick={() => handleEdit(state)}
                  disabled={deletingStateId === state.id}
                >
                  Edit
                </button>
                <button 
                  className={`delete-btn ${deletingStateId === state.id ? 'deleting' : ''}`}
                  onClick={() => handleDelete(state.id)}
                  disabled={deletingStateId === state.id}
                >
                  {deletingStateId === state.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="season-images-section">
          <div className="state-selector">
            <label htmlFor="stateSelect">Select State:</label>
            <select 
              id="stateSelect"
              value={selectedStateForImages}
              onChange={(e) => setSelectedStateForImages(e.target.value)}
            >
              <option value="">Choose a state...</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>
                  {state.emoji} {state.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStateForImages && (
            <div className="season-images-container">
              <div className="season-tabs">
                <button 
                  className={`season-tab ${activeSeasonTab === 'summer' ? 'active' : ''}`}
                  onClick={() => setActiveSeasonTab('summer')}
                >
                  Summer
                </button>
                <button 
                  className={`season-tab ${activeSeasonTab === 'monsoon' ? 'active' : ''}`}
                  onClick={() => setActiveSeasonTab('monsoon')}
                >
                  Monsoon
                </button>
                <button 
                  className={`season-tab ${activeSeasonTab === 'autumn' ? 'active' : ''}`}
                  onClick={() => setActiveSeasonTab('autumn')}
                >
                  Autumn
                </button>
                <button 
                  className={`season-tab ${activeSeasonTab === 'winter' ? 'active' : ''}`}
                  onClick={() => setActiveSeasonTab('winter')}
                >
                  Winter
                </button>
                <button 
                  className={`season-tab ${activeSeasonTab === 'spring' ? 'active' : ''}`}
                  onClick={() => setActiveSeasonTab('spring')}
                >
                  Spring
                </button>
              </div>

              <div className="season-images-content">
                <div className="season-images-header">
                  <button 
                    className="add-image-btn"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <span className="plus-icon">+</span>
                    Add New Image
                  </button>
                </div>

                {seasonImages[activeSeasonTab]?.length > 0 ? (
                  <div className="season-images-grid">
                    {seasonImages[activeSeasonTab].map(image => (
                      <div key={image.id} className="season-image-card">
                        <img 
                          src={image.url.startsWith('http') ? image.url : `http://localhost:5000${image.url}`}
                          alt={`${activeSeasonTab} season image`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <button 
                          className="delete-image-btn"
                          onClick={() => handleDeleteSeasonImage(image.id, activeSeasonTab)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-images-message">
                    No images added yet. Click "Add New Image" to upload images for {activeSeasonTab} season.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingState ? 'Edit State' : 'Add New State'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <label htmlFor="name">State Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="emoji">State Emoji</label>
                <input
                  type="text"
                  id="emoji"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleInputChange}
                  placeholder="🏔️"
                />
              </div>

              <div className="form-section">
                <label htmlFor="capital">Capital City</label>
                <input
                  type="text"
                  id="capital"
                  name="capital"
                  value={formData.capital}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="activities">Popular Activities (comma-separated)</label>
                <input
                  type="text"
                  id="activities"
                  name="activities"
                  value={formData.activities}
                  onChange={handleInputChange}
                  placeholder="Trekking, River Rafting, Wildlife Safari"
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="metaTitle">Meta Title</label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="metaDescription">Meta Description</label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="metaKeywords">Meta Keywords (comma-separated)</label>
                <input
                  type="text"
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleInputChange}
                  placeholder="tourism, travel, adventure"
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="route">Route (URL Slug)</label>
                <input
                  type="text"
                  id="route"
                  name="route"
                  value={formData.route}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="image">State Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {formData.imagePreview && (
                  <div className="image-upload">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        image: null,
                        imagePreview: null
                      }))}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {editingState ? 'Save Changes' : 'Add State'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="upload-image-modal">
          <div className="upload-image-modal-content">
            <h2>Add New {activeSeasonTab.charAt(0).toUpperCase() + activeSeasonTab.slice(1)} Image</h2>
            <form onSubmit={(e) => {
              handleSeasonImageUpload(e, activeSeasonTab);
              setShowUploadModal(false);
            }} className="season-image-upload-form">
              <div className="season-form-group">
                <label htmlFor="image">Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  required
                />
                {imagePreview && (
                  <div className="season-image-preview">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-preview-btn"
                      onClick={() => {
                        setImagePreview(null);
                        setUploadFormData(prev => ({
                          ...prev,
                          image: null
                        }));
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="season-form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={uploadFormData.location}
                  onChange={handleUploadFormChange}
                  placeholder="Enter location (e.g., Kausani, Rishikesh)"
                  required
                />
              </div>

              <div className="season-form-group">
                <label htmlFor="alt">Alt Text</label>
                <input
                  type="text"
                  id="alt"
                  name="alt"
                  value={uploadFormData.alt}
                  onChange={handleUploadFormChange}
                  placeholder="Enter alt text for the image"
                  required
                />
              </div>

              <div className="season-modal-actions">
                <button 
                  type="submit" 
                  className="season-upload-btn"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
                <button
                  type="button"
                  className="season-cancel-btn"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFormData({
                      image: null,
                      location: '',
                      alt: ''
                    });
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStates; 