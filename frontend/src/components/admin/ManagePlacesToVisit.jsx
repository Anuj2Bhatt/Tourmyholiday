import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ManagePlacesToVisit.css';

const ManagePlacesToVisit = () => {
  const [places, setPlaces] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    location: '',
    description: '',
    content: '',
    bestTimeToVisit: '',
    entryFee: '',
    timings: '',
    featured: false,
    featuredImage: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchPlaces = useCallback(async () => {
    if (!selectedState) return;
    
    try {
      setLoading(true);
      // Find the state object
      const state = states.find(s => {
        const stateRoute = s.route ? s.route.replace(/^\//, '') : '';
        return stateRoute === selectedState;
      });
      
      if (!state) {
        throw new Error(`State not found for identifier: ${selectedState}`);
      }
      
      // Use state ID in the API endpoint
      const url = `http://localhost:5000/api/places/states/${state.id}/places`;
      const response = await axios.get(url);
      if (response.data.success && Array.isArray(response.data.data)) {
        setPlaces(response.data.data);
        if (response.data.data.length === 0) {
      } else {
        setError('Received invalid data format from server');
      }
    }
      
      
    } finally {
      setLoading(false);
    }
  }, [selectedState, states]);

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchPlaces();
    }
  }, [selectedState, fetchPlaces]);

  const fetchStates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/states');
      // Log each state's details
      response.data.forEach(state => {
        state.route = state.route.replace(/\s+/g, '-');
        state.formattedRoute = state.route ? state.route.replace(/^\//, '') : null;
      });
      
      setStates(response.data);
    } catch (err) {
      setError(`Failed to fetch states: ${err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      // Auto-generate slug from title
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 60);
      
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: generatedSlug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        featuredImage: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
        // Find the selected state object
        const state = states.find(s => {
            const stateRoute = s.route ? s.route.replace(/^\//, '') : '';
            return stateRoute === selectedState;
        });

        if (!state) {
            throw new Error(`State "${selectedState}" not found. Please select a valid state.`);
        }

        const formDataToSend = new FormData();
        
        // Add all form fields to FormData
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                if (key === 'featured') {
                    formDataToSend.append(key, formData[key] ? '1' : '0');
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            }
        });

        // Use state ID in the URL
        const url = isEditing
            ? `http://localhost:5000/api/places/states/${state.id}/places/${editingId}`
            : `http://localhost:5000/api/places/states/${state.id}/places`;

        const response = await axios[isEditing ? 'put' : 'post'](url, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            setSuccess(isEditing ? 'Place updated successfully' : 'Place added successfully');
            resetForm();
            fetchPlaces();
            setShowForm(false);
        } else {
            throw new Error(response.data.message || 'Failed to save place');
        }
    } catch (err) {
        
        const errorMessage = err.response?.data?.message || err.message || 'Failed to save place';
        setError(`Error: ${errorMessage}`);
    } finally {
        setLoading(false);
    }
};

  const handleEdit = (place) => {
    setIsEditing(true);
    setEditingId(place.id);
    setFormData({
      title: place.title || place.name,
      slug: place.slug || '',
      location: place.location,
      description: place.description,
      content: place.content || '',
      bestTimeToVisit: place.bestTimeToVisit || '',
      entryFee: place.entryFee || '',
      timings: place.timings || '',
      featured: place.featured || false,
      featuredImage: null
    });
    setImagePreview(place.featured_image_url || place.featured_image);
    setShowForm(true);
  };

  const handleDelete = async (placeId) => {
    if (!window.confirm('Are you sure you want to delete this place?')) {
      return;
    }

    try {
      setLoading(true);
      // Find the selected state object
      const state = states.find(s => s.route ? s.route.replace(/^\//, '') === selectedState : false);
      if (!state) {
        throw new Error('State not found');
      }
      
      const url = `http://localhost:5000/api/places/states/${state.id}/places/${placeId}`;
      await axios.delete(url);
      setSuccess('Place deleted successfully');
      fetchPlaces();
    } catch (err) {
      setError('Failed to delete place');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      location: '',
      description: '',
      content: '',
      bestTimeToVisit: '',
      entryFee: '',
      timings: '',
      featured: false,
      featuredImage: null
    });
    setImagePreview(null);
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="manage-places-container">
      <div className="places-header">
        <h2>Manage Places to Visit</h2>
        <div className="header-controls">
          <select 
            value={selectedState} 
            onChange={(e) => {
              const value = e.target.value;
              // Only log the selected state
              const selectedStateObj = states.find(s => {
                const stateRoute = s.route ? s.route.replace(/^\//, '') : '';
                return stateRoute === value;
              });
              
              if (selectedStateObj) {
                }
              
              setSelectedState(value);
            }}
            className="state-select"
          >
            <option value="">Select a State</option>
            {states.map(state => {
              const value = state.route ? state.route.replace(/^\//, '') : '';
              // Remove the logging from here
              return (
                <option 
                  key={state.id} 
                  value={value}
                >
                  {state.name}
                </option>
              );
            })}
          </select>
          {!showForm && (
            <button 
              className="add-new-btn"
              onClick={handleAddNew}
              disabled={loading || !selectedState}
            >
              + Add New
            </button>
          )}
        </div>
      </div>

      {error && <div className="manage-places-error-message">{error}</div>}
      {success && <div className="manage-places-success-message">{success}</div>}

      {selectedState && (
        <>
          {showForm ? (
            <div className="manage-places-form">
              <div className="manage-places-form-header">
                <h3>{isEditing ? 'Edit Place' : 'Add New Place'}</h3>
                <button type="button" onClick={resetForm} className="manage-places-close-btn">×</button>
              </div>

              <form onSubmit={handleSubmit} className="manage-places-form-content">
                <div className="manage-places-form-grid">
                  <div className="manage-places-form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter place title"
                    />
                  </div>

                  <div className="manage-places-form-group">
                    <label>Slug:</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      maxLength={60}
                      placeholder="Enter URL slug"
                    />
                    <small>Maximum 60 characters</small>
                  </div>

                  <div className="manage-places-form-group">
                    <label>Location:</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="manage-places-form-group full-width">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter short description"
                      rows="3"
                    />
                  </div>

                  <div className="manage-places-form-group full-width">
                    <label>Content:</label>
                    <ReactQuill
                      value={formData.content}
                      onChange={handleContentChange}
                      className="manage-places-quill"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image'],
                          ['clean']
                        ]
                      }}
                      placeholder="Write detailed content about the place..."
                    />
                  </div>

                  <div className="manage-places-form-group">
                    <label>Best Time to Visit:</label>
                    <input
                      type="text"
                      name="bestTimeToVisit"
                      value={formData.bestTimeToVisit}
                      onChange={handleInputChange}
                      placeholder="e.g., October to March"
                    />
                  </div>

                  <div className="manage-places-form-group">
                    <label>Entry Fee:</label>
                    <input
                      type="text"
                      name="entryFee"
                      value={formData.entryFee}
                      onChange={handleInputChange}
                      placeholder="e.g., ₹100 per person"
                    />
                  </div>

                  <div className="manage-places-form-group">
                    <label>Timings:</label>
                    <input
                      type="text"
                      name="timings"
                      value={formData.timings}
                      onChange={handleInputChange}
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                    />
                  </div>

                  <div className="manage-places-form-group">
                    <label className="manage-places-checkbox-label">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          featured: e.target.checked
                        }))}
                      />
                      <span>Featured Place</span>
                    </label>
                    <small>Featured places will be highlighted on the website</small>
                  </div>

                  <div className="manage-places-form-group full-width">
                    <label>Featured Image:</label>
                    <div className="manage-places-image-upload">
                      <div className="manage-places-file-input-wrapper">
                        <input
                          type="file"
                          name="featuredImage"
                          onChange={handleImageChange}
                          accept="image/*"
                          required={!isEditing}
                          className="manage-places-file-input"
                          id="featured-image-input"
                        />
                        <label htmlFor="featured-image-input" className="manage-places-file-input-label">
                          <span className="manage-places-file-input-icon">📁</span>
                          <span>Choose Image</span>
                        </label>
                      </div>
                      {imagePreview && (
                        <div className="manage-places-image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                    </div>
                    <small>Recommended size: 1200x800 pixels</small>
                  </div>
                </div>

                <div className="manage-places-form-buttons">
                  <button type="submit" className="manage-places-submit-btn" disabled={loading}>
                    {loading ? 'Saving...' : isEditing ? 'Update Place' : 'Add Place'}
                  </button>
                  <button type="button" onClick={resetForm} className="manage-places-cancel-btn" disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="manage-places-table-container">
              <table className="manage-places-table">
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Place Name</th>
                    <th>Location</th>
                    <th>Featured Image</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {places.map((place, index) => (
                    <tr key={place.id}>
                      <td>{index + 1}</td>
                      <td>{place.title}</td>
                      <td>{place.location}</td>
                      <td>
                        <img 
                          src={place.featured_image_url || 'https://via.placeholder.com/50x50?text=No+Image'} 
                          alt={place.title}
                          className="manage-places-table-thumbnail"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                          }}
                        />
                      </td>
                      <td>
                        <span className="manage-places-status-badge published">
                          Active
                        </span>
                      </td>
                      <td>
                        <span className="manage-places-featured-status">
                          {place.featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleEdit(place)} 
                          className="manage-places-edit-btn"
                          disabled={loading}
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDelete(place.id)} 
                          className="manage-places-delete-btn"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {places.length === 0 && (
                    <tr>
                      <td colSpan="8" className="manage-places-no-data">
                        No places found. Click "Add New" to add places.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManagePlacesToVisit; 