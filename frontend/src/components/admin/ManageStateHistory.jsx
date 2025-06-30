import React, { useState, useEffect } from 'react';
import './ManageStateHistory.css';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { territoryHistoryService } from '../../services/territoryHistoryService';

const API_URL = 'http://localhost:5000';

const ManageStateHistory = () => {
  const [states, setStates] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [stateHistoryList, setStateHistoryList] = useState([]);
  const [territoryHistoryList, setTerritoryHistoryList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [historyType, setHistoryType] = useState('state'); // 'state' or 'territory'
  const [form, setForm] = useState({
    title: '',
    content: '',
    image: '',
    slug: '',
    status: '',
    package_id: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    territory_id: '',
    state_id: '',
    isUploading: false
  });

  useEffect(() => {
    fetchStates();
    fetchTerritories();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/states`);
      let statesArray = [];
      
      // Handle different response formats
      if (response.data.success && Array.isArray(response.data.data)) {
        statesArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        statesArray = response.data;
      }

      // Sort states by name
      statesArray.sort((a, b) => a.name.localeCompare(b.name));
      
      setStates(statesArray);
    } catch (error) {
      setStates([]);
    }
  };

  const fetchTerritories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/territories`);
      let territoriesArray = [];
      
      // Handle different response formats
      if (response.data.success && Array.isArray(response.data.data)) {
        territoriesArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        territoriesArray = response.data;
      }

      // Log the territories array for debugging
      // Ensure we have valid territory objects with required fields
      territoriesArray = territoriesArray.filter(territory => 
        territory && 
        typeof territory === 'object' && 
        territory.id && 
        territory.title
      );

      // Sort territories by title instead of name
      territoriesArray.sort((a, b) => a.title.localeCompare(b.title));
      
      if (!Array.isArray(territoriesArray)) {
        setTerritories([]);
        return;
      }

      setTerritories(territoriesArray);
    } catch (error) {
      setTerritories([]);
    }
  };

  const fetchHistoryData = async (entity, type) => {
    try {
      let response;

      if (type === 'state') {
        response = await axios.get(`${API_URL}/api/state-history`, {
          params: { state_id: entity.id }
        });
      } else {
        // Use territory history service for territory history
        response = await territoryHistoryService.getAll({ territory_id: entity.id });
      }

      // Handle different response formats
      let historyData = [];
      
      if (type === 'state') {
        if (Array.isArray(response.data)) {
          historyData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          historyData = response.data.data;
        }
      } else {
        // Territory history service already returns data in the correct format
        historyData = response.data || [];
      }

      // Ensure all history items have required fields
      historyData = historyData.map(item => ({
        id: item.id,
        title: item.title || '',
        content: item.content || '',
        image: item.image || '',
        slug: item.slug || '',
        status: item.status || '',
        meta_title: item.meta_title || '',
        meta_description: item.meta_description || '',
        meta_keywords: item.meta_keywords || '',
        state_id: type === 'state' ? entity.id : null,
        territory_id: type === 'territory' ? entity.id : null
      }));

      if (type === 'state') {
        setStateHistoryList(historyData);
      } else {
        setTerritoryHistoryList(historyData);
      }
    } catch (error) {
      if (type === 'state') {
        setStateHistoryList([]);
      } else {
        setTerritoryHistoryList([]);
      }
    }
  };

  // Function to generate slug from title
  const generateSlug = (title) => {
    if (!title) return '';
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
    return slug;
  };

  // Update slug when title changes
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const newSlug = generateSlug(newTitle);
    setForm(prev => ({
      ...prev,
      title: newTitle,
      slug: newSlug
    }));
  };

  const handleEdit = (item) => {
    setForm(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    const entity = historyType === 'state' ? selectedState : selectedTerritory;
    setForm({ 
      title: '', 
      content: '', 
      image: '', 
      slug: '', 
      status: '', 
      package_id: '', 
      meta_title: '', 
      meta_description: '', 
      meta_keywords: '',
      state_id: historyType === 'state' ? entity.id : '',
      territory_id: historyType === 'territory' ? entity.id : '',
      isUploading: false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this history entry?')) {
      return;
    }

    try {
      const entity = historyType === 'state' ? selectedState : selectedTerritory;
      let response;

      if (historyType === 'state') {
        response = await axios.delete(`${API_URL}/api/state-history/${id}`);
      } else {
        // Use territory history service for territory history
        response = await territoryHistoryService.delete(id);
      }

      if (response.data.success) {
        // Refresh the history list
        await fetchHistoryData(entity, historyType);
      } else {
        throw new Error(response.data.error || `Failed to delete ${historyType} history`);
      }
    } catch (error) {
      alert(`Failed to delete ${historyType} history: ` + (error.response?.data?.error || error.message));
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Debug: Log file info
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        alert('File size too large. Maximum size is 5MB');
        return;
    }

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('image', file);

        // Show loading state
        setForm(prev => ({ ...prev, isUploading: true }));

        // Choose endpoint based on history type
        const endpoint = historyType === 'state' 
            ? `${API_URL}/api/state-history/upload-image`
            : `${API_URL}/api/territory-history/upload-image`;

        // Upload image
        const response = await axios.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (!response.data || !response.data.url) {
            throw new Error('No URL received from server');
        }

        // Update form with uploaded image URL
        setForm(prev => ({
            ...prev,
            image: response.data.url,
            isUploading: false
        }));
    } catch (error) {
        setForm(prev => ({ ...prev, isUploading: false }));
        alert('Failed to upload image: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleStateChange = async (e) => {
    const stateId = parseInt(e.target.value);
    if (!stateId) {
      setSelectedState(null);
      setStateHistoryList([]);
      return;
    }

    const state = states.find(s => s.id === stateId);
    if (!state) {
      alert('Please select a valid state');
      return;
    }

    setSelectedState(state);
    setSelectedTerritory(null); // Reset territory selection
    setHistoryType('state');
    setStateHistoryList([]); // Clear existing history
    setTerritoryHistoryList([]); // Clear territory history

    try {
      // Fetch state history using query parameters
      const response = await axios.get(`${API_URL}/api/state-history`, {
        params: {
          state_id: state.id,
          sort: 'desc' // Sort by newest first
        }
      });
      
      let historyData = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        historyData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        historyData = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        historyData = response.data.data;
      }

      // Filter history data to ensure it belongs to the selected state
      historyData = historyData.filter(item => item.state_id === state.id);

      // Sort by newest first
      historyData.sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at));

      // Ensure all history items have required fields
      historyData = historyData.map(item => ({
        id: item.id,
        title: item.title || '',
        content: item.content || '',
        image: item.image || '',
        slug: item.slug || '',
        status: item.status || '',
        meta_title: item.meta_title || '',
        meta_description: item.meta_description || '',
        meta_keywords: item.meta_keywords || '',
        state_id: item.state_id || state.id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setStateHistoryList(historyData);
    } catch (error) {
      setStateHistoryList([]);
      alert('Failed to fetch state history: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleTerritoryChange = (e) => {
    const territoryId = parseInt(e.target.value);
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) {
      alert('Please select a valid territory');
      return;
    }
    setSelectedTerritory(territory);
    setSelectedState(null); // Reset state selection
    setHistoryType('territory');
    // Reset history lists
    setStateHistoryList([]);
    setTerritoryHistoryList([]);
    // Fetch territory history
    fetchHistoryData(territory, 'territory');
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!form.title || !form.content) {
        alert('Title and content are required');
        return;
      }

      const entity = historyType === 'state' ? selectedState : selectedTerritory;
      if (!entity || !entity.id) {
        alert(`Please select a ${historyType} first`);
        return;
      }

      // Prepare history data
      const historyData = {
        ...form,
        state_id: historyType === 'state' ? entity.id : null,
        territory_id: historyType === 'territory' ? entity.id : null,
        slug: generateSlug(form.title),
        image: form.image || null
      };

      let response;
      if (historyType === 'state') {
        const endpoint = `${API_URL}/api/state-history`;
        if (form.id && form.id !== 'dummy-1') {
          response = await axios.put(`${endpoint}/${form.id}`, historyData);
        } else {
          response = await axios.post(endpoint, historyData);
        }
      } else {
        // Use territory history service for territory history
        if (form.id && form.id !== 'dummy-1') {
          response = await territoryHistoryService.update(form.id, historyData);
        } else {
          response = await territoryHistoryService.create(historyData);
        }
      }

      // Refresh history data
      await fetchHistoryData(entity, historyType);
      setShowModal(false);
    } catch (error) {
      alert(`Failed to save ${historyType} history: ` + (error.response?.data?.error || error.message));
    }
  };

  // Get the current history list based on type
  const currentHistoryList = historyType === 'state' ? stateHistoryList : territoryHistoryList;
  const selectedEntity = historyType === 'state' ? selectedState : selectedTerritory;

  return (
    <div className="history-dashboard-bg">
      <div className="history-dashboard-card">
        <div className="history-header-row">
          <h2>Manage {historyType === 'state' ? 'State' : 'Territory'} History</h2>
          {selectedEntity && (
            <button className="add-btn" onClick={handleAddNew}>+ Add New</button>
          )}
        </div>
        <div style={{ marginBottom: 20, display: 'flex', gap: '20px' }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 16, color: '#333333'}}>Select State: </label>
            <select
              value={selectedState?.id || ''}
              onChange={handleStateChange}
              style={{ minWidth: '200px', padding: '8px', borderRadius: '4px' }}
            >
              <option value="">-- Select State --</option>
              {states && states.length > 0 ? (
                states.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))
              ) : (
                <option value="" disabled>No states available</option>
              )}
            </select>
            {states.length === 0 && (
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Loading states...
              </small>
            )}
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 16, color: '#333333'}}>Select Territory: </label>
            <select
              value={selectedTerritory?.id || ''}
              onChange={handleTerritoryChange}
              style={{ minWidth: '200px', padding: '8px', borderRadius: '4px' }}
            >
              <option value="">-- Select Territory --</option>
              {territories && territories.length > 0 ? (
                territories.map(territory => {
                  // Debug log
                  return (
                    <option key={territory.id} value={territory.id}>
                      {territory.title || 'Unnamed Territory'}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>No territories available</option>
              )}
            </select>
            {territories.length === 0 && (
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                {territories === null ? 'Loading territories...' : 'No territories found'}
              </small>
            )}
          </div>
        </div>
        {selectedEntity && (
          <div style={{ overflowX: "auto" }}>
            <table className="states-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentHistoryList && currentHistoryList.length > 0 ? (
                  currentHistoryList.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>{item.title}</td>
                      <td>
                        <div style={{ 
                          maxWidth: '300px', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No content'}
                        </div>
                      </td>
                      <td>
                        {item.image ? (
                          <img 
                            src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`} 
                            alt={item.title} 
                            style={{
                              maxWidth: '100px',
                              maxHeight: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-state.jpg';
                            }}
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>
                      <td>{item.status || 'Not Set'}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                      </td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      {selectedEntity ? `No history data available for ${selectedEntity.name}` : 'Please select a state or territory'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h3 style={{marginBottom: '24px'}}>{form.id ? 'Edit History' : 'Add New History'}</h3>

              <div className="form-section">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={form.title}
                  onChange={handleTitleChange}
                />
              </div>
              <div className="form-section">
                <label>Slug (Auto-generated from title)</label>
                <input
                  type="text"
                  placeholder="Slug"
                  value={form.slug}
                  disabled
                  style={{ backgroundColor: '#f5f5f5' }}
                />
                {form.title.length > 50 && (
                  <small style={{ color: 'red' }}>Title is too long. Slug will be truncated to 50 characters.</small>
                )}
              </div>
              <div className="form-section">
                <label>Featured Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={form.isUploading}
                />
                {form.isUploading && (
                  <div className="upload-progress">
                    Uploading image...
                  </div>
                )}
                {form.image && (
                  <div className="image-preview-container">
                    <img 
                      src={form.image.startsWith('http') ? form.image : `http://localhost:5000${form.image}`} 
                      alt="Preview" 
                      className="image-preview"
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '150px',
                        objectFit: 'cover',
                        marginTop: '10px',
                        borderRadius: '4px'
                      }}
                    />
                    <button 
                      className="remove-image-btn"
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      style={{ marginLeft: '10px' }}
                      disabled={form.isUploading}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
              <div className="form-section">
                <label>Status</label>
                <select
                  value={form.status || ''}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="">-- Choose Status --</option>
                  <option value="Public">Public</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="form-section">
                <label>Package</label>
                <select
                  value={form.package_id || ''}
                  onChange={e => setForm({ ...form, package_id: e.target.value })}
                >
                  <option value="">-- Choose Package --</option>
                  {/* Example: Replace with your actual packages */}
                  <option value="1">Chakrata Tour Package</option>
                </select>
              </div>
              <div className="form-section">
                <label>Description</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={form.content}
                  config={{
                    ckfinder: {
                      uploadUrl: 'http://localhost:5000/api/upload'
                    }
                  }}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setForm({ ...form, content: data });
                  }}
                />
              </div>
              <div className="form-section">
                <label>Meta Title</label>
                <input
                  type="text"
                  placeholder="Meta Title"
                  value={form.meta_title || ''}
                  onChange={e => setForm({ ...form, meta_title: e.target.value })}
                />
              </div>
              <div className="form-section">
                <label>Meta Description</label>
                <textarea
                  placeholder="Meta Description"
                  value={form.meta_description || ''}
                  onChange={e => setForm({ ...form, meta_description: e.target.value })}
                  style={{ minHeight: 60 }}
                />
              </div>
              <div className="form-section">
                <label>Meta Keywords</label>
                <textarea
                  placeholder="Meta Keywords (comma separated)"
                  value={form.meta_keywords || ''}
                  onChange={e => setForm({ ...form, meta_keywords: e.target.value })}
                  style={{ minHeight: 60 }}
                />
              </div>

              <div className="modal-actions">
                <button className="save-btn" onClick={handleSave}>Save</button>
                <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStateHistory;
