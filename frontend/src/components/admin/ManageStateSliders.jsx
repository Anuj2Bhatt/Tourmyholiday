import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageStateSliders.css';

const SEASONS = [
  { id: 'winter', name: 'Winter', icon: '❄️' },
  { id: 'summer', name: 'Summer', icon: '☀️' },
  { id: 'autumn', name: 'Autumn', icon: '🍂' },
  { id: 'spring', name: 'Spring', icon: '🌸' }
];

const ManageStateSliders = () => {
  const [activeTab, setActiveTab] = useState('slider');
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [stateImages, setStateImages] = useState({});

  // For season images modal
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [selectedSeasonState, setSelectedSeasonState] = useState(null);
  const [activeSeasonTab, setActiveSeasonTab] = useState('winter');
  // Local state for season images: { seasonId: [ { id, url, file, preview, location } ] }
  const [seasonImages, setSeasonImages] = useState({});
  const [seasonUploading, setSeasonUploading] = useState(false);
  const [showNewImageForm, setShowNewImageForm] = useState(false);
  const [newSeasonImage, setNewSeasonImage] = useState({
    file: null,
    preview: null,
    location: '',
    alt: '',
    caption: ''
  });

  // Add placeholder images array
  const placeholderImages = [
    '/placeholder-state.jpg',
    '/placeholder-season-1.jpg',
    '/placeholder-season-2.jpg',
    '/placeholder-season-3.jpg'
  ];

  // Add function to get random placeholder
  const getRandomPlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/states');
      setStates(response.data);

      // Fetch first image for each state
      const imagesPromises = response.data.map(async (state) => {
        try {
          const imagesResponse = await axios.get(`http://localhost:5000/api/states/images/${state.id}`);
          return { stateId: state.id, images: imagesResponse.data };
        } catch (err) {
          console.error(`Error fetching images for state ${state.id}:`, err);
          return { stateId: state.id, images: [] };
        }
      });

      const imagesResults = await Promise.all(imagesPromises);
      const imagesMap = imagesResults.reduce((acc, { stateId, images }) => {
        acc[stateId] = images;
        return acc;
      }, {});
      setStateImages(imagesMap);
    } catch (err) {
      setError('Failed to fetch states. Please try again.');
      console.error('Error fetching states:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateClick = async (state) => {
    setSelectedState(state);
    setShowModal(true);
    setNewImages([]);
    try {
      const response = await axios.get(`http://localhost:5000/api/states/images/${state.id}`);
      // Format image URLs and ensure all fields are present
      const formattedImages = response.data.map(img => ({
        id: img.id,
        state_id: img.state_id,
        url: img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`,
        alt: img.alt || '',
        caption: img.caption || '',
        created_at: img.created_at
      }));
      console.log('Fetched images:', formattedImages);
      setExistingImages(formattedImages);
    } catch (err) {
      console.error('Error fetching existing images:', err);
      setError('Failed to fetch images. Please try again.');
    }
  };

  const handleImageUpload = async (file, caption, alt) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('state_id', selectedState.id);
      formData.append('caption', caption || '');
      formData.append('alt', alt || '');

      const response = await axios.post('http://localhost:5000/api/states/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Failed to upload image');
    }
  };

  const handleNewImageAdd = () => {
    setNewImages([...newImages, { file: null, caption: '', alt: '' }]);
  };

  const handleNewImageChange = (index, field, value) => {
    const updatedImages = [...newImages];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setNewImages(updatedImages);
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      setError(null);

      // Upload new images
      for (const image of newImages) {
        if (image.file) {
          await handleImageUpload(image.file, image.caption, image.alt);
        }
      }

      // Close modal and refresh states
      setShowModal(false);
      setSelectedState(null);
      setNewImages([]);
      fetchStates();
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error('Error saving changes:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(`http://localhost:5000/api/states/images/${imageId}`);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image. Please try again.');
    }
  };

  // Fetch season images for a state and season
  const fetchSeasonImages = async (stateId, season) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/state-season-images/${stateId}/${season}`);
      return response.data.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`
      }));
    } catch (err) {
      console.error('Error fetching season images:', err);
      return [];
    }
  };

  // Handler for season images modal
  const handleSeasonStateClick = async (state) => {
    setSelectedSeasonState(state);
    setShowSeasonModal(true);
    setActiveSeasonTab('winter');
    
    // Fetch all seasons for this state
    const imagesBySeason = {};
    for (const season of SEASONS.map(s => s.id)) {
      const images = await fetchSeasonImages(state.id, season);
      imagesBySeason[season] = images;
    }
    setSeasonImages(imagesBySeason);
  };

  const closeSeasonModal = () => {
    setShowSeasonModal(false);
    setSelectedSeasonState(null);
  };

  // When switching season tab, fetch if not already loaded
  const handleSeasonTabChange = async (seasonId) => {
    setActiveSeasonTab(seasonId);
    if (seasonImages[seasonId].length === 0 && selectedSeasonState) {
      const imgs = await fetchSeasonImages(selectedSeasonState.id, seasonId);
      setSeasonImages(prev => ({ ...prev, [seasonId]: imgs }));
    }
  };

  // Add new image for current season
  const handleAddSeasonImage = () => {
    setShowNewImageForm(true);
  };

  // Handle file change for a season image
  const handleSeasonImageFileChange = (index, file) => {
    const preview = file ? URL.createObjectURL(file) : null;
    setSeasonImages(prev => {
      const updated = [...prev[activeSeasonTab]];
      updated[index] = { ...updated[index], file, preview };
      return { ...prev, [activeSeasonTab]: updated };
    });
  };

  // Handle location change for a season image
  const handleSeasonImageLocationChange = (index, value) => {
    setSeasonImages(prev => {
      const updated = [...prev[activeSeasonTab]];
      updated[index] = { ...updated[index], location: value };
      return { ...prev, [activeSeasonTab]: updated };
    });
  };

  // Delete a season image
  const handleDeleteSeasonImage = async (imageId) => {
    if (!imageId) {
      console.error('No image ID provided for deletion');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/state-season-images/${imageId}`);
      // Update local state
      setSeasonImages(prev => ({
        ...prev,
        [activeSeasonTab]: prev[activeSeasonTab].filter(img => img.id !== imageId)
      }));
      } catch (err) {
      console.error('Error deleting season image:', err);
      setError('Failed to delete image. Please try again.');
    }
  };

  // Add new function for handling new image form
  const handleNewSeasonImageChange = (field, value) => {
    setNewSeasonImage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewSeasonImageFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setNewSeasonImage(prev => ({
        ...prev,
        file,
        preview
      }));
    }
  };

  // Save season images (upload new images to backend)
  const handleSaveSeasonImages = async () => {
    setSeasonUploading(true);
    try {
      for (const img of seasonImages[activeSeasonTab]) {
        if (!img.id && img.file) {
          const formData = new FormData();
          formData.append('state_id', selectedSeasonState.id);
          formData.append('season', activeSeasonTab);
          formData.append('location', img.location || '');
          formData.append('image', img.file);
          await axios.post('http://localhost:5000/api/state-season-images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }
      // Refresh images after upload
      const imgs = await fetchSeasonImages(selectedSeasonState.id, activeSeasonTab);
      setSeasonImages(prev => ({ ...prev, [activeSeasonTab]: imgs }));
      alert('Images saved!');
    } catch (err) {
      alert('Failed to save images');
    }
    setSeasonUploading(false);
  };

  const handleSaveNewSeasonImage = async () => {
    try {
      setSeasonUploading(true);
      const formData = new FormData();
      formData.append('image', newSeasonImage.file);
      formData.append('state_id', selectedSeasonState.id);
      formData.append('season', activeSeasonTab);
      formData.append('location', newSeasonImage.location);
      formData.append('alt', newSeasonImage.alt);
      formData.append('caption', newSeasonImage.caption);

      const response = await axios.post('http://localhost:5000/api/state-season-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update local state
      setSeasonImages(prev => ({
        ...prev,
        [activeSeasonTab]: [...(prev[activeSeasonTab] || []), response.data]
      }));

      // Reset form
      setNewSeasonImage({
        file: null,
        preview: null,
        location: '',
        alt: '',
        caption: ''
      });
      setShowNewImageForm(false);
    } catch (err) {
      console.error('Error uploading new season image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setSeasonUploading(false);
    }
  };

  // Restore original renderSeasonImages function
  const renderSeasonImages = () => (
    <div className="season-images-grid">
      {seasonImages[activeSeasonTab]?.map((img) => (
        <div key={img.id} className="season-image-card">
          <div className="season-image-preview">
            <img 
              src={img.url} 
              alt={img.alt || `${img.location || 'Season'} image`}
              onError={(e) => {
                console.error('Image failed to load:', img.url);
                e.target.onerror = null;
                e.target.src = '/placeholder-state.jpg';
              }}
            />
            <div className="season-image-overlay">
              <div className="season-image-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteSeasonImage(img.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div className="season-image-info">
            <h4>{img.location || 'No Location'}</h4>
            <p className="season-tag">{img.season}</p>
            {img.caption && <p className="caption">{img.caption}</p>}
            {img.alt && <p className="alt-text">{img.alt}</p>}
            <p className="date">Added: {new Date(img.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && !showModal) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading states...</p>
      </div>
    );
  }

  if (error && !showModal) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchStates}>Retry</button>
      </div>
    );
  }

  return (
    <div className="state-slider-manager">
      <div className="state-slider-header">
        <h2>Manage State Images</h2>
        <p>Select a state to add new images</p>
      </div>
      <div className="state-slider-tabs">
        <button
          className={activeTab === 'slider' ? 'active' : ''}
          onClick={() => setActiveTab('slider')}
        >
          Slider Images
        </button>
        <button
          className={activeTab === 'season' ? 'active' : ''}
          onClick={() => setActiveTab('season')}
        >
          Season Images
        </button>
      </div>
      {activeTab === 'slider' && (
        <div className="state-slider-grid">
          {states.map((state) => {
            const stateImageList = stateImages[state.id] || [];
            const firstImage = stateImageList[0]?.url || state.image_url || '/placeholder-state.jpg';
            
            return (
            <div key={state.id} className="state-slider-card">
              <div className="state-slider-image">
                  <img 
                    src={firstImage} 
                    alt={state.name}
                    onError={(e) => {
                      console.error('Image failed to load:', firstImage);
                      e.target.onerror = null;
                      e.target.src = '/placeholder-state.jpg';
                    }}
                  />
              </div>
              <div className="state-slider-info">
                <h3>{state.name}</h3>
                <button className="state-slider-edit-btn" onClick={() => handleStateClick(state)}>
                  Add Images
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
      {activeTab === 'season' && (
        <div className="state-slider-grid">
          {states.map((state) => (
            <div key={state.id} className="state-slider-card">
              <div className="state-slider-image">
                <img src={state.image_url || '/placeholder-state.jpg'} alt={state.name} />
              </div>
              <div className="state-slider-info">
                <h3>{state.name}</h3>
                <button className="state-slider-edit-btn" onClick={() => handleSeasonStateClick(state)}>
                  Edit Season Images
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="state-slider-modal-overlay">
          <div className="state-slider-modal-content">
            <div className="state-slider-modal-header">
              <h3>Manage Images - {selectedState.name}</h3>
              <button className="state-slider-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <div className="state-slider-images-container">
              <div className="state-slider-existing-images">
                <h4>Existing Images</h4>
                <div className="state-slider-images-grid">
                  {existingImages.map((image) => (
                    <div key={image.id} className="state-slider-image-card">
                      <div className="state-slider-image-preview">
                        <img 
                          src={image.url} 
                          alt={image.alt || image.caption || 'State image'} 
                          onError={(e) => {
                            console.error('Image failed to load:', image.url);
                            e.target.onerror = null;
                            e.target.src = '/placeholder-state.jpg';
                          }}
                        />
                        <button 
                          className="state-slider-delete-btn"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="state-slider-image-details">
                        <p><strong>ID:</strong> {image.id}</p>
                        <p><strong>State ID:</strong> {image.state_id}</p>
                        <p><strong>Caption:</strong> {image.caption || 'No caption'}</p>
                        <p><strong>Alt Text:</strong> {image.alt || 'No alt text'}</p>
                        <p><strong>Created:</strong> {new Date(image.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="state-slider-new-images">
                <h4>Add New Images</h4>
                <div className="state-slider-images-grid">
                  {newImages.map((image, index) => (
                    <div key={index} className="state-slider-image-card">
                      <div className="state-slider-image-preview">
                        {image.file ? (
                          <img src={URL.createObjectURL(image.file)} alt="Preview" />
                        ) : (
                          <label className="state-slider-upload-placeholder">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleNewImageChange(index, 'file', file);
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                            Click to upload
                          </label>
                        )}
                      </div>
                      <div className="state-slider-image-details">
                        <input
                          type="text"
                          value={image.caption || ''}
                          onChange={(e) => handleNewImageChange(index, 'caption', e.target.value)}
                          placeholder="Image caption"
                        />
                        <input
                          type="text"
                          value={image.alt || ''}
                          onChange={(e) => handleNewImageChange(index, 'alt', e.target.value)}
                          placeholder="Alt text"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="state-slider-add-btn" onClick={handleNewImageAdd}>
                  Add Another Image
                </button>
              </div>
            </div>

            <div className="state-slider-modal-actions">
              <button
                className="state-slider-cancel-btn"
                onClick={() => setShowModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="state-slider-save-btn"
                onClick={handleSave}
                disabled={uploading || newImages.length === 0}
              >
                {uploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Season Images Modal (new) */}
      {showSeasonModal && (
        <div className="modal-overlay">
          <div className="modal-content season-modal">
            <div className="modal-header">
              <h3>Manage Season Images - {selectedSeasonState.name}</h3>
              <button className="close-btn" onClick={closeSeasonModal}>&times;</button>
            </div>

            <div className="season-tabs-admin">
              {SEASONS.map(season => (
                <button
                  key={season.id}
                  className={activeSeasonTab === season.id ? 'active' : ''}
                  onClick={() => handleSeasonTabChange(season.id)}
                >
                  {season.icon} {season.name}
                </button>
              ))}
            </div>

            <div className="season-images-admin-content">
              {showNewImageForm ? (
                <div className="new-season-image-form">
                  <h4>Add New Image</h4>
                  <div className="form-group">
                    <label>Image:</label>
                    <div className="image-upload-preview">
                      {newSeasonImage.preview ? (
                        <img src={newSeasonImage.preview} alt="Preview" />
                      ) : (
                        <label className="upload-placeholder">
                            <input
                              type="file"
                              accept="image/*"
                            onChange={handleNewSeasonImageFile}
                              style={{ display: 'none' }}
                            />
                          Click to upload image
                          </label>
                        )}
                      </div>
                  </div>
                  <div className="form-group">
                    <label>Location:</label>
                    <input
                      type="text"
                      value={newSeasonImage.location}
                      onChange={(e) => handleNewSeasonImageChange('location', e.target.value)}
                      placeholder="Enter location"
                    />
                  </div>
                  <div className="form-group">
                    <label>Alt Text:</label>
                        <input
                          type="text"
                      value={newSeasonImage.alt}
                      onChange={(e) => handleNewSeasonImageChange('alt', e.target.value)}
                      placeholder="Enter alt text"
                    />
                  </div>
                  <div className="form-group">
                    <label>Caption:</label>
                    <textarea
                      value={newSeasonImage.caption}
                      onChange={(e) => handleNewSeasonImageChange('caption', e.target.value)}
                      placeholder="Enter caption"
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => setShowNewImageForm(false)}
                    >
                      Cancel
                    </button>
                        <button
                      className="save-btn"
                      onClick={handleSaveNewSeasonImage}
                      disabled={!newSeasonImage.file || seasonUploading}
                        >
                      {seasonUploading ? 'Uploading...' : 'Upload Image'}
                        </button>
                      </div>
                </div>
              ) : (
                <>
                  {renderSeasonImages()}
                <button
                    className="add-image-btn"
                    onClick={handleAddSeasonImage}
                >
                    Add New Image
                </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add new CSS
const styles = `
.season-modal {
  max-width: 1200px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.season-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.season-image-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.season-image-card:hover {
  transform: translateY(-5px);
}

.season-image-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.season-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.season-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.season-image-card:hover .season-image-overlay {
  opacity: 1;
}

.delete-btn {
  background: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #cc0000;
}

.season-image-info {
  padding: 15px;
}

.season-image-info h4 {
  margin: 0 0 10px;
  font-size: 1.1em;
  color: #333;
}

.season-tag {
  display: inline-block;
  background: #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
}

.caption {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.date {
  color: #999;
  font-size: 0.8em;
}

.new-season-image-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 20px auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.image-upload-preview {
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  color: #666;
  cursor: pointer;
  text-align: center;
  padding: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.save-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  background: #e0e0e0;
  color: #333;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.add-image-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin: 20px;
  display: block;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.add-image-btn:hover {
  background: #45a049;
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ManageStateSliders;
