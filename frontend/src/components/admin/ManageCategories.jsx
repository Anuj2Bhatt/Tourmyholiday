import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageCategories.css';

const API_URL = 'http://localhost:5000';

const ACCOMMODATION_TYPES = [
  'hotel',
  'tent',
  'resort',
  'homestay',
  'hostel',
  'guesthouse',
  'cottage'
];

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    is_active: true,
    type: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}/${imagePath}`;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    }, [categories]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/hotel-categories`);
      setCategories(response.data);
    } catch (error) {
      setError('Error fetching categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.url) {
        setFormData(prev => ({
          ...prev,
          image: response.data.url
        }));
        setError('');
      } else {
        throw new Error('No URL received from server');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create the data object to send
      const submitData = {
        name: formData.name,
        is_active: formData.is_active,
        image: formData.image,
        type: formData.type
      };

      if (editingId) {
        // For update
        await axios.put(`${API_URL}/api/hotel-categories/${editingId}`, submitData);
        setSuccess('Category updated successfully');
      } else {
        // For create
        if (!formData.image) {
          setError('Please upload an image');
          return;
        }
        await axios.post(`${API_URL}/api/hotel-categories`, submitData);
        setSuccess('Category added successfully');
      }
      
      setFormData({ name: '', image: '', is_active: true, type: '' });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving category');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      image: category.image,
      is_active: category.is_active,
      type: category.type || ''
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API_URL}/api/hotel-categories/${id}`);
        setSuccess('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        setError('Error deleting category');
      }
    }
  };

  return (
    <div className="manage-categories">
      <div className="categories-header">
        <h2>Manage Categories</h2>
        <button 
          className="add-new-btn"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', image: '', is_active: true, type: '' });
          }}
        >
          Add New Category
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingId ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Category Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type:</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  {ACCOMMODATION_TYPES.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="image-preview"
                  />
                )}
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleInputChange}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  {editingId ? 'Update Category' : 'Add Category'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="categories-table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Image</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id}>
                <td>{index + 1}</td>
                <td>
                  <img 
                    src={getImageUrl(category.image)} 
                    alt={category.name} 
                    className="category-table-image"
                  />
                </td>
                <td>{category.name}</td>
                <td>{category.type ? category.type.charAt(0).toUpperCase() + category.type.slice(1) : '-'}</td>
                <td>{category.is_active ? 'Active' : 'Inactive'}</td>
                <td>{new Date(category.updated_at).toLocaleString()}</td>
                <td>
                  <div className="table-actions">
                    <button 
                      onClick={() => handleEdit(category)} 
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)} 
                      className="delete-btn"
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
  );
};

export default ManageCategories; 