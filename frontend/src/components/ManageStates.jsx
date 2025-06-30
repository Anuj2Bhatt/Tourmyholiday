import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageStates.css';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';

const ManageStates = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: null,
    emoji: '',
    capital: '',
    activities: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: []
  });

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/states');
      setStates(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch states');
      setLoading(false);
      toast.error('Failed to fetch states');
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('emoji', formData.emoji || '');
      formDataToSend.append('capital', formData.capital || '');
      formDataToSend.append('activities', JSON.stringify(formData.activities || []));
      formDataToSend.append('meta_title', formData.meta_title || '');
      formDataToSend.append('meta_description', formData.meta_description || '');
      formDataToSend.append('meta_keywords', JSON.stringify(formData.meta_keywords || []));
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingState) {
        await axios.put(`http://localhost:5000/api/states/${editingState.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('State updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/states', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('State added successfully');
      }
      
      await fetchStates();
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save state';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (stateId) => {
    if (!window.confirm('Are you sure you want to delete this state?')) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/states/${stateId}`);
      toast.success('State deleted successfully');
      await fetchStates(); // Refresh the list after deletion
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete state';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (state = null) => {
    if (state) {
      setEditingState(state);
      setFormData({
        name: state.name || '',
        description: state.description || '',
        image: null,
        imagePreview: state.image || null,
        emoji: state.emoji || '',
        capital: state.capital || '',
        activities: JSON.parse(state.activities || '[]'),
        meta_title: state.meta_title || '',
        meta_description: state.meta_description || '',
        meta_keywords: JSON.parse(state.meta_keywords || '[]')
      });
    } else {
      setEditingState(null);
      setFormData({
        name: '',
        description: '',
        image: null,
        imagePreview: null,
        emoji: '',
        capital: '',
        activities: [],
        meta_title: '',
        meta_description: '',
        meta_keywords: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingState(null);
    setFormData({
      name: '',
      description: '',
      image: null,
      imagePreview: null,
      emoji: '',
      capital: '',
      activities: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: []
    });
  };

  if (loading && !states.length) {
    return <LoadingSpinner />;
  }

  if (error && !states.length) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="states-section">
      <div className="section-header">
        <h1>Manage States</h1>
        <button className="add-state-btn" onClick={() => openModal()}>
          Add New State
        </button>
      </div>

      <div className="states-grid">
        {states.map(state => (
          <div key={state.id} className="state-card">
            <img 
              src={state.image?.startsWith('http') ? state.image : `http://localhost:5000${state.image}`}
              alt={state.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-state.jpg';
              }}
            />
            <div className="state-info">
              <h3>{state.name} {state.emoji}</h3>
              <p className="capital">{state.capital}</p>
              <p>{state.description}</p>
            </div>
            <div className="state-actions">
              <button onClick={() => openModal(state)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(state.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingState ? 'Edit State' : 'Add New State'}</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group">
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

              <div className="form-group">
                <label htmlFor="emoji">Emoji</label>
                <input
                  type="text"
                  id="emoji"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleInputChange}
                  placeholder="🏔️"
                />
              </div>

              <div className="form-group">
                <label htmlFor="capital">Capital</label>
                <input
                  type="text"
                  id="capital"
                  name="capital"
                  value={formData.capital}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="activities">Activities (comma-separated)</label>
                <input
                  type="text"
                  id="activities"
                  name="activities"
                  value={formData.activities.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    activities: e.target.value.split(',').map(item => item.trim())
                  }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="meta_title">Meta Title</label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="meta_description">Meta Description</label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="meta_keywords">Meta Keywords (comma-separated)</label>
                <input
                  type="text"
                  id="meta_keywords"
                  name="meta_keywords"
                  value={formData.meta_keywords.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    meta_keywords: e.target.value.split(',').map(item => item.trim())
                  }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">State Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : (editingState ? 'Update' : 'Add')} State
                </button>
                <button type="button" onClick={closeModal} className="cancel-btn">
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