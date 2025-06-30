import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ManageVideos.css';

const ENTITY_TYPES = [
  { value: 'package', label: 'Package' },
  { value: 'state', label: 'State' },
  { value: 'territory', label: 'Territory' },
  { value: 'territory_district', label: 'Territory District' },
  { value: 'district', label: 'District' },
  { value: 'subdistrict', label: 'Subdistrict' },
];

const API_BASE_URL = 'http://localhost:5000';

const ManageVideos = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [entityType, setEntityType] = useState('package');
  const [entityId, setEntityId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // State for entity lists
  const [packages, setPackages] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [territoryDistricts, setTerritoryDistricts] = useState([]);

  // State for videos
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedTerritoryId, setSelectedTerritoryId] = useState(null);

  // Fetch all entities on mount
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoading(true);
        const [pkgRes, stateRes, distRes, subdistRes, territoryRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/packages`),
          axios.get(`${API_BASE_URL}/api/states`),
          axios.get(`${API_BASE_URL}/api/districts`),
          axios.get(`${API_BASE_URL}/api/subdistricts`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/api/territories`).catch(() => ({ data: { data: [] } }))
        ]);
        
        // Ensure we're setting arrays for all entities
        setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
        setStates(Array.isArray(stateRes.data) ? stateRes.data : []);
        setDistricts(Array.isArray(distRes.data) ? distRes.data : []);
        setSubdistricts(Array.isArray(subdistRes.data) ? subdistRes.data : []);
        // Handle territories data which comes in { data: [...] } format
        setTerritories(Array.isArray(territoryRes.data?.data) ? territoryRes.data.data : []);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch entities. Please try again later.');
        setLoading(false);
        // Initialize empty arrays in case of error
        setPackages([]);
        setStates([]);
        setDistricts([]);
        setSubdistricts([]);
        setTerritories([]);
        setTerritoryDistricts([]);
      }
    };
    fetchEntities();
  }, []);

  // Fetch territory districts when territory is selected
  useEffect(() => {
    const fetchTerritoryDistricts = async () => {
      if (entityType === 'territory_district' && selectedTerritoryId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/territory-districts/territory/${selectedTerritoryId}`);
          setTerritoryDistricts(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
          setTerritoryDistricts([]);
        }
      }
    };
    fetchTerritoryDistricts();
  }, [selectedTerritoryId, entityType]);

  // Fetch videos for selected entity (useCallback)
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/videos`, {
        params: {
          entity_type: entityType,
          entity_id: entityId
        }
      });
      setVideos(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch videos. Please try again later.');
      setLoading(false);
    }
  }, [entityType, entityId]);

  // Fetch videos when entity changes
  useEffect(() => {
    if (entityId) {
      fetchVideos();
    }
  }, [entityId, fetchVideos]);

  // Handle entity type change
  const handleEntityTypeChange = (e) => {
    const newType = e.target.value;
    setEntityType(newType);
    setEntityId('');
    if (newType !== 'territory_district') {
      setSelectedTerritoryId(null);
    }
  };

  // Handle territory selection
  const handleTerritoryChange = (e) => {
    const territoryId = e.target.value;
    setSelectedTerritoryId(territoryId);
    setEntityId('');
  };

  // Get entity options based on type
  const getEntityOptions = () => {
    // Ensure we're working with arrays
    const safeTerritories = Array.isArray(territories) ? territories : [];
    const safeTerritoryDistricts = Array.isArray(territoryDistricts) ? territoryDistricts : [];
    const safePackages = Array.isArray(packages) ? packages : [];
    const safeStates = Array.isArray(states) ? states : [];
    const safeDistricts = Array.isArray(districts) ? districts : [];
    const safeSubdistricts = Array.isArray(subdistricts) ? subdistricts : [];

    switch (entityType) {
      case 'package': return safePackages.map(p => ({ value: p.id, label: p.package_name || p.name || p.title }));
      case 'state': return safeStates.map(s => ({ value: s.id, label: s.name || s.package_name || s.title }));
      case 'territory': return safeTerritories.map(t => ({ value: t.id, label: t.title || t.name }));
      case 'territory_district': return safeTerritoryDistricts.map(d => ({ value: d.id, label: d.name }));
      case 'district': return safeDistricts.map(d => ({ value: d.id, label: d.name || d.package_name || d.title }));
      case 'subdistrict': return safeSubdistricts.map(s => ({ value: s.id, label: s.title || s.name || s.package_name }));
      default: return [];
    }
  };

  // Add video handler
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!youtubeUrl || !entityId) {
      setError('Please fill all fields');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/videos`, {
        youtube_url: youtubeUrl,
        entity_type: entityType,
        entity_id: entityId,
      });
      setSuccess('Video added successfully!');
      setYoutubeUrl('');
      setShowAddModal(false);
      fetchVideos();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add video. Please try again.');
    }
  };

  // Delete video handler
  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/videos/${id}`);
      setSuccess('Video deleted successfully!');
      fetchVideos();
    } catch (err) {
      setError('Failed to delete video. Please try again.');
    }
  };

  // Helper: Get YouTube thumbnail from video ID
  const getYoutubeThumbnail = (youtube_id) =>
    `https://img.youtube.com/vi/${youtube_id}/hqdefault.jpg`;

  // Get selected entity name
  const getSelectedEntityName = () => {
    const options = getEntityOptions();
    const selected = options.find(opt => opt.value === entityId);
    return selected ? selected.label : '';
  };

  return (
    <div className="mv-container">
      <h2 className="mv-heading">Manage Videos</h2>
      
      {/* Entity Selection */}
      <div className="mv-entity-selector">
        <select
          className="mv-select"
          value={entityType}
          onChange={handleEntityTypeChange}
        >
          {ENTITY_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        
        {entityType === 'territory_district' && (
          <select
            className="mv-select"
            value={selectedTerritoryId || ''}
            onChange={handleTerritoryChange}
          >
            <option value="">Select Territory</option>
            {territories.map(t => (
              <option key={t.id} value={t.id}>{t.title || t.name}</option>
            ))}
          </select>
        )}
        
        <select
          className="mv-select"
          value={entityId}
          onChange={e => setEntityId(e.target.value)}
          disabled={
            (entityType === 'subdistrict' && (!subdistricts || subdistricts.length === 0)) ||
            (entityType === 'territory_district' && (!selectedTerritoryId || !territoryDistricts.length))
          }
        >
          <option value="">Select {entityType === 'territory_district' ? 'District' : entityType}</option>
          {getEntityOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {entityId && (
          <button 
            className="mv-add-btn"
            onClick={() => setShowAddModal(true)}
          >
            Add New Video
          </button>
        )}
      </div>

      {error && <div className="mv-error">{error}</div>}
      {success && <div className="mv-success">{success}</div>}

      {/* Videos Grid */}
      {entityId && (
        <div className="mv-videos-section">
          <h3 className="mv-section-title">
            Videos for {getSelectedEntityName()}
          </h3>
          
          {loading ? (
            <div className="mv-loading">Loading videos...</div>
          ) : (
            <div className="mv-grid">
              {videos.map((video) => (
                <div key={video.id} className="mv-card">
                  <div className="mv-thumbnail">
                    <img
                      src={getYoutubeThumbnail(video.youtube_id)}
                      alt="YouTube Thumbnail"
                    />
                  </div>
                  <div className="mv-actions">
                    <button className="mv-edit-btn" disabled>Edit</button>
                    <button 
                      className="mv-delete-btn"
                      onClick={() => handleDeleteVideo(video.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="mv-modal-overlay">
          <div className="mv-modal">
            <h3>Add New Video</h3>
            <form onSubmit={handleAddVideo}>
              <input
                className="mv-input"
                type="text"
                placeholder="YouTube video link"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
              />
              <div className="mv-modal-actions">
                <button type="submit" className="mv-submit-btn">Add Video</button>
                <button 
                  type="button" 
                  className="mv-cancel-btn"
                  onClick={() => setShowAddModal(false)}
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

export default ManageVideos; 