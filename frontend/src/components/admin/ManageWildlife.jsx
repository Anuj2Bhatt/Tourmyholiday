import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { wildlifeService } from '../../services/wildlifeService';
import wildlifeFloraService from '../../services/wildlifeFloraService';
import { API_URL } from '../../config';
import BasicInfoForm from './BasicInfoForm';
import WildlifeFloraForm from './WildlifeFloraForm';
import './ManageWildlife.css';
import wildlifeBasicInfoService from '../../services/wildlifeBasicInfoService';

const ManageWildlife = () => {
  const [activeTab, setActiveTab] = useState('list');

  const mainTabs = [
    { id: 'list', label: 'Wildlife Sanctuaries List', icon: '📋' },
    { id: 'basic', label: 'Basic Information', icon: '📋' },
    { id: 'media', label: 'Media & Gallery', icon: '📸' },
    { id: 'wildlife', label: 'Wildlife & Flora', icon: '🦁' }
  ];

  const handleMainTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const [sanctuaries, setSanctuaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSanctuaryForMedia, setSelectedSanctuaryForMedia] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  
  // New state variables for media list
  const [mediaList, setMediaList] = useState({ images: [], videos: [] });
  const [mediaLoading, setMediaLoading] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [showMediaForm, setShowMediaForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    location: '',
    featuredImage: null,
    featuredImagePreview: null,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  });

  const [showBasicForm, setShowBasicForm] = useState(false);
  const [selectedSanctuaryForBasic, setSelectedSanctuaryForBasic] = useState(null);
  const [showBasicInfoForm, setShowBasicInfoForm] = useState(false);

  // Add new state for basic info
  const [basicInfoList, setBasicInfoList] = useState([]);
  const [loadingBasicInfo, setLoadingBasicInfo] = useState(false);

  // Add missing state for editing basic info
  const [editingBasicInfo, setEditingBasicInfo] = useState(null);

  // Add state for Wildlife & Flora form
  const [showWildlifeFloraForm, setShowWildlifeFloraForm] = useState(false);
  const [selectedSanctuaryForWildlifeFlora, setSelectedSanctuaryForWildlifeFlora] = useState(null);
  const [wildlifeFloraList, setWildlifeFloraList] = useState([]);
  const [loadingWildlifeFlora, setLoadingWildlifeFlora] = useState(false);
  const [editingWildlifeFlora, setEditingWildlifeFlora] = useState(null);

  // Media upload states
  const [showImageUploadForm, setShowImageUploadForm] = useState(false);
  const [showVideoUploadForm, setShowVideoUploadForm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [imageAltTexts, setImageAltTexts] = useState({});
  const [videoTitles, setVideoTitles] = useState({});
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [isSavingVideos, setIsSavingVideos] = useState(false);

  useEffect(() => {
    fetchSanctuaries();
  }, []);

  // Fetch media when sanctuary is selected
  useEffect(() => {
    if (selectedSanctuaryForMedia) {
      fetchMediaForSanctuary(selectedSanctuaryForMedia);
    } else {
      setMediaList({ images: [], videos: [] });
    }
  }, [selectedSanctuaryForMedia]);

  // Debug useEffect to log mediaList changes
  useEffect(() => {
    }, [mediaList]);

  // Add useEffect for loading basic info
  useEffect(() => {
    if (activeTab === 'basic') {
      loadBasicInfo();
    }
  }, [activeTab]);

  // Add useEffect for loading wildlife flora
  useEffect(() => {
    if (activeTab === 'wildlife') {
      loadWildlifeFlora();
    }
  }, [activeTab]);

  const fetchSanctuaries = async () => {
    try {
      const data = await wildlifeService.getAllSanctuaries();
      setSanctuaries(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch wildlife sanctuaries');
      setLoading(false);
    }
  };

  // New function to fetch media for selected sanctuary
  const fetchMediaForSanctuary = async (sanctuaryId) => {
    if (!sanctuaryId) return;
    
    setMediaLoading(true);
    try {
      const [imagesResponse, videosResponse] = await Promise.all([
        wildlifeService.getGalleryImages(sanctuaryId),
        wildlifeService.getVideos(sanctuaryId)
      ]);
      
      // Extract the data property from the responses
      const images = imagesResponse?.data || [];
      const videos = videosResponse?.data || [];
      
      // Log the structure of first image and video for debugging
      if (images.length > 0) {
        console.log('First image structure:', images[0]);
      }
      if (videos.length > 0) {
        console.log('First video structure:', videos[0]);
      }
      
      setMediaList({
        images: images,
        videos: videos
      });
      
      } catch (error) {
      toast.error('Failed to fetch media files');
      setMediaList({ images: [], videos: [] });
    } finally {
      setMediaLoading(false);
    }
  };

  // New function to delete media
  const handleDeleteMedia = async (type, mediaId) => {
    if (!selectedSanctuaryForMedia) return;
    
    const confirmMessage = type === 'image' ? 'Are you sure you want to delete this image?' : 'Are you sure you want to delete this video?';
    
    if (window.confirm(confirmMessage)) {
      try {
        if (type === 'image') {
          await wildlifeService.deleteGalleryImage(selectedSanctuaryForMedia, mediaId);
        } else {
          await wildlifeService.deleteVideo(selectedSanctuaryForMedia, mediaId);
        }
        
        toast.success(`${type === 'image' ? 'Image' : 'Video'} deleted successfully`);
        fetchMediaForSanctuary(selectedSanctuaryForMedia);
      } catch (error) {
        toast.error(`Failed to delete ${type}`);
      }
    }
  };

  // New function to reset media form state
  const resetMediaForm = () => {
    setShowMediaForm(false);
    setGalleryImages([]);
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      // Auto-generate slug from title
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        featuredImage: file,
        featuredImagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleMetaInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'metaTitle') {
      // Limit meta title to 60 characters
      if (value.length <= 60) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (name === 'metaDescription') {
      // Limit meta description to 160 characters
      if (value.length <= 160) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (name === 'metaKeywords') {
      // Only allow comma-separated keywords
      const keywords = value.split(',').map(k => k.trim()).filter(k => k);
      setFormData(prev => ({
        ...prev,
        [name]: keywords.join(', ')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'featuredImage' && formData[key]) {
          formDataToSend.append('featuredImage', formData[key]);
        } else if (key !== 'featuredImagePreview') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editingId) {
        await wildlifeService.updateSanctuary(editingId, formDataToSend);
        toast.success('Wildlife sanctuary updated successfully');
      } else {
        await wildlifeService.createSanctuary(formDataToSend);
        toast.success('Wildlife sanctuary added successfully');
      }

      resetForm();
      fetchSanctuaries();
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (sanctuary) => {
    if (!sanctuary) return;
    
    setShowForm(true);
    setEditingId(sanctuary.id);
    setFormData({
      title: sanctuary.title || '',
      slug: sanctuary.slug || '',
      description: sanctuary.description || '',
      location: sanctuary.location || '',
      featuredImage: null,
      featuredImagePreview: sanctuary.featured_image ? `${API_URL}/uploads/${sanctuary.featured_image}` : null,
      metaTitle: sanctuary.meta_title || '',
      metaDescription: sanctuary.meta_description || '',
      metaKeywords: sanctuary.meta_keywords || ''
    });
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sanctuary?')) {
      try {
        await wildlifeService.deleteSanctuary(id);
        toast.success('Sanctuary deleted successfully');
        fetchSanctuaries();
      } catch (error) {
        toast.error(error.message || 'Failed to delete sanctuary');
      }
    }
  };

  const handleGalleryImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!selectedSanctuaryForMedia) {
      toast.error('Please select a sanctuary first');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    // Create preview objects with alt text
    const imagePreviews = files.map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      altText: file.name.replace(/\.[^/.]+$/, ""), // Use filename without extension as default alt text
      id: Date.now() + Math.random() // Unique ID for each image
    }));

    setGalleryImages(prev => [...prev, ...imagePreviews]);
    
    // Clear the file input
    e.target.value = '';
    
    toast.info(`${files.length} images selected. Add alt text and click "Upload Images" to save.`);
  };

  const handleAltTextChange = (imageId, altText) => {
    setGalleryImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, altText } : img
      )
    );
  };

  const removeGalleryImage = (imageId) => {
    setGalleryImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const uploadGalleryImages = async () => {
    if (galleryImages.length === 0) {
      toast.error('No images to upload');
      return;
    }

    try {
      const formData = new FormData();
      galleryImages.forEach((imageObj, index) => {
        formData.append('galleryImages', imageObj.file);
        formData.append(`altTexts[${index}]`, imageObj.altText);
      });

      const response = await wildlifeService.uploadGalleryImages(selectedSanctuaryForMedia, formData);
      toast.success(response.message || `${galleryImages.length} images saved successfully!`);
      
      // Clear all previews
      galleryImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setGalleryImages([]);
      
      // Reset form and go back to list
      resetMediaForm();
      fetchMediaForSanctuary(selectedSanctuaryForMedia);
    } catch (error) {
      toast.error(error.message || 'Failed to upload images');
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!selectedSanctuaryForMedia) {
      toast.error('Please select a sanctuary first');
      return;
    }

    if (!file) {
      toast.error('Please select a video file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await wildlifeService.uploadVideo(selectedSanctuaryForMedia, formData);
      toast.success(response.message || 'Video saved successfully!');
      
      // Clear the file input
      e.target.value = '';
      
      // Reset form and go back to list
      resetMediaForm();
      fetchMediaForSanctuary(selectedSanctuaryForMedia);
    } catch (error) {
      toast.error(error.message || 'Failed to upload video');
    }
  };

  const handleSaveMediaFiles = async () => {
    if (!selectedSanctuaryForMedia) {
      toast.error('Please select a sanctuary first');
      return;
    }
    
    toast.info('Media files are uploaded automatically when selected. No additional save needed.');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      location: '',
      featuredImage: null,
      featuredImagePreview: null,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    });
    setEditingId(null);
  };

  // Add function to load basic info
  const loadBasicInfo = async () => {
    setLoadingBasicInfo(true);
    try {
      const response = await wildlifeBasicInfoService.getAllBasicInfo();
      if (response.success) {
        setBasicInfoList(response.data);
      }
    } catch (error) {
      toast.error('Failed to load basic information');
    } finally {
      setLoadingBasicInfo(false);
    }
  };

  // Add function to handle basic info form success
  const handleBasicInfoSuccess = () => {
    setShowBasicInfoForm(false);
    setSelectedSanctuaryForBasic(null);
    loadBasicInfo();
  };

  // Add function to edit basic info
  const handleEditBasicInfo = (basicInfo) => {
    setEditingBasicInfo(basicInfo);
    setShowBasicInfoForm(true);
    setSelectedSanctuaryForBasic(basicInfo.sanctuary_id);
  };

  // Add function to delete basic info
  const handleDeleteBasicInfo = async (id) => {
    if (window.confirm('Are you sure you want to delete this basic information?')) {
      try {
        await wildlifeBasicInfoService.deleteBasicInfo(id);
        toast.success('Basic information deleted successfully!');
        loadBasicInfo();
      } catch (error) {
        toast.error('Failed to delete basic information');
      }
    }
  };

  // Add functions for Wildlife & Flora management
  const loadWildlifeFlora = async () => {
    setLoadingWildlifeFlora(true);
    try {
      const response = await wildlifeFloraService.getAllItemsGroupedBySanctuary();
      setWildlifeFloraList(response);
    } catch (error) {
      toast.error('Failed to load wildlife & flora information');
      setWildlifeFloraList([]);
    } finally {
      setLoadingWildlifeFlora(false);
    }
  };

  const handleEditWildlifeFlora = (sanctuary) => {
    // Load existing wildlife flora data for this sanctuary
    wildlifeFloraService.getItemsBySanctuary(sanctuary.id)
      .then(items => {
        // Group items by category
        const groupedItems = {
          mammals: [],
          birds: [],
          reptiles: [],
          insects: [],
          flowers: [],
          herbs: [],
          rare_species: [],
          flora: [],
          endangered_species: []
        };

        items.forEach(item => {
          if (groupedItems[item.category]) {
            groupedItems[item.category].push({
              id: item.id,
              name: item.name,
              description: item.description,
              imagePreview: item.image_path ? `${API_URL}/uploads/${item.image_path}` : null,
              existingImage: item.image_path,
              is_active: item.is_active,
              sort_order: item.sort_order
            });
          }
        });

        // Get additional information from the first item (assuming all items have same additional info)
        const firstItem = items[0] || {};
        
        // Create editing data object with all fields
        const editingData = {
          sanctuary_id: sanctuary.id,
          sanctuary_name: sanctuary.sanctuary_name,
          // Additional information fields
          best_time_for_wildlife: firstItem.best_time_for_wildlife || '',
          wildlife_behavior: firstItem.wildlife_behavior || '',
          conservation_status: firstItem.conservation_status || '',
          research_programs: firstItem.research_programs || '',
          visitor_guidelines: firstItem.visitor_guidelines || '',
          photography_tips: firstItem.photography_tips || '',
          // Grouped wildlife items
          ...groupedItems
        };

        setEditingWildlifeFlora(editingData);
        setSelectedSanctuaryForWildlifeFlora(sanctuary.id);
        setShowWildlifeFloraForm(false);
      })
      .catch(error => {
        toast.error('Failed to load existing data');
      });
  };

  const handleDeleteWildlifeFlora = async (sanctuaryId) => {
    if (window.confirm('Are you sure you want to delete all wildlife & flora information for this sanctuary? This action cannot be undone.')) {
      try {
        await wildlifeFloraService.deleteAllBySanctuary(sanctuaryId);
        toast.success('All wildlife & flora information deleted successfully!');
        loadWildlifeFlora();
      } catch (error) {
        toast.error('Failed to delete wildlife & flora information');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="manage-wildlife">
      <div className="main-tabs-navigation" style={{
        display: 'flex',
        overflow: 'hidden',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            className={`main-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleMainTabChange(tab.id)}
            style={{
              flex: '1',
              padding: '12px 20px',
              border: 'none',
              background: activeTab === tab.id ? '#007bff' : '#f8f9fa',
              color: activeTab === tab.id ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="main-tab-content">
        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="sanctuaries-list">
            <div className="list-header">
              <h2>Wildlife Sanctuaries</h2>
              <button onClick={handleAddNew} className="add-new-btn">
                Add New Sanctuary
              </button>
            </div>
            <div className="sanctuaries-table">
              <table>
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sanctuaries && sanctuaries.map((sanctuary, index) => (
                    <tr key={sanctuary.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="sanctuary-image-cell">
                          <img 
                            src={sanctuary.featured_image ? `${API_URL}/uploads/${sanctuary.featured_image}` : 
                                 sanctuary.image ? `${API_URL}/uploads/${sanctuary.image}` : 
                                 '/placeholder-image.jpg'} 
                            alt={sanctuary.title || 'Sanctuary Image'} 
                            className="sanctuary-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                      </td>
                      <td>{sanctuary.title}</td>
                      <td>{sanctuary.location}</td>
                      <td className="action-buttons">
                        <button 
                          onClick={() => handleEdit(sanctuary)}
                          className="edit-btn"
                          title="Edit Sanctuary"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(sanctuary.id)}
                          className="delete-btn"
                          title="Delete Sanctuary"
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!sanctuaries || sanctuaries.length === 0) && (
                    <tr>
                      <td colSpan="5" className="no-data">
                        No wildlife sanctuaries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="wildlife-form-container">
            <div className="form-header">
              <h2>{editingId ? 'Edit Wildlife Sanctuary' : 'Add New Wildlife Sanctuary'}</h2>
              <button onClick={handleCancel} className="back-btn">
                Back to List
              </button>
            </div>

            <div className="tab-content">
              <form onSubmit={handleSubmit} className="wildlife-form">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter sanctuary title"
                    />
                  </div>

                  <div className="form-group">
                    <label>Slug:</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      placeholder="URL-friendly version of title"
                    />
                    <small className="form-help">This will be used in the URL. Auto-generated from title but can be edited.</small>
                  </div>

                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter detailed description"
                      rows="6"
                    />
                  </div>

                  <div className="form-group">
                    <label>Location:</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter sanctuary location (e.g., State, District)"
                    />
                    <small className="form-help">Enter the state and district where the sanctuary is located</small>
                  </div>

                  <div className="form-group">
                    <label>Featured Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editingId}
                    />
                    {formData.featuredImagePreview && (
                      <div className="wildlife-image-preview">
                        <img src={formData.featuredImagePreview} alt="Featured Preview" />
                      </div>
                    )}
                    <small className="form-help">Recommended size: 1200x800 pixels</small>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Meta Information</h3>
                  <div className="form-group">
                    <label>Meta Title:</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleMetaInputChange}
                      placeholder="SEO title (if different from main title)"
                      maxLength={60}
                    />
                    <small className="form-help">
                      {formData.metaTitle.length}/60 characters. Leave empty to use main title
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Meta Description:</label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleMetaInputChange}
                      placeholder="SEO description"
                      rows="3"
                      maxLength={160}
                    />
                    <small className="form-help">
                      {formData.metaDescription.length}/160 characters. Recommended for SEO
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Meta Keywords:</label>
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleMetaInputChange}
                      placeholder="Enter keywords separated by commas"
                    />
                    <small className="form-help">
                      Enter keywords and press comma to add. Example: wildlife, sanctuary, tigers, birds, nature
                    </small>
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    {editingId ? 'Update Sanctuary' : 'Add Sanctuary'}
                  </button>
                  <button type="button" onClick={handleCancel} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Media & Gallery Tab */}
        {activeTab === 'media' && (
          <div className="wildlife-form-container">
            <div className="form-header">
              <h2>Media & Gallery</h2>
              <button onClick={() => handleMainTabChange('list')} className="back-btn">
                Back to List
              </button>
            </div>
            
            <div className="sanctuaries-list">
              <div className="list-header">
                <h2>Media Management</h2>
              </div>
              
              <div className="form-group">
                <label>Select Wildlife Sanctuary:</label>
                <select 
                  value={selectedSanctuaryForMedia} 
                  onChange={(e) => setSelectedSanctuaryForMedia(e.target.value)}
                  className="sanctuary-select"
                >
                  <option value="">-- Select a Sanctuary --</option>
                  {sanctuaries.map((sanctuary) => (
                    <option key={sanctuary.id} value={sanctuary.id}>
                      {sanctuary.title} - {sanctuary.location}
                    </option>
                  ))}
                </select>
                <small className="form-help">Choose the sanctuary to view and manage media files</small>
              </div>

              {selectedSanctuaryForMedia && (
                <>
                  {/* Add Media Buttons */}
                  <div className="media-actions">
                    <button 
                      onClick={() => setShowImageUploadForm(true)}
                      className="add-media-btn"
                    >
                      <i className="fas fa-image"></i> Add Images
                    </button>
                    <button 
                      onClick={() => setShowVideoUploadForm(true)}
                      className="add-media-btn"
                    >
                      <i className="fas fa-video"></i> Add Videos
                    </button>
                  </div>

                  {/* Image Upload Form */}
                  {showImageUploadForm && (
                    <div className="enhanced-media-upload-form">
                      <div className="form-header">
                        <h3>Upload Images</h3>
                        <button 
                          onClick={() => {
                            setShowImageUploadForm(false);
                            setUploadedImages([]);
                            setImageAltTexts({});
                          }}
                          className="enhanced-close-btn"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      
                      <div className="enhanced-file-input-container">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setUploadedImages(files);
                            // Initialize alt texts for new images
                            const newAltTexts = {};
                            files.forEach((file, index) => {
                              newAltTexts[index] = file.name.replace(/\.[^/.]+$/, "");
                            });
                            setImageAltTexts(newAltTexts);
                          }}
                          className="enhanced-file-input"
                        />
                        <small className="enhanced-upload-help">Select multiple images to upload (JPG, PNG, GIF, WebP)</small>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div className="enhanced-uploaded-files">
                          <h4>Selected Images ({uploadedImages.length})</h4>
                          <div className="enhanced-images-grid">
                            {uploadedImages.map((file, index) => (
                              <div key={index} className="enhanced-image-preview">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt="Preview" 
                                  className="enhanced-preview-image"
                                />
                                <div className="enhanced-image-details">
                                  <input
                                    type="text"
                                    placeholder="Alt Text (for accessibility)"
                                    value={imageAltTexts[index] || ''}
                                    onChange={(e) => setImageAltTexts({
                                      ...imageAltTexts,
                                      [index]: e.target.value
                                    })}
                                    className="enhanced-alt-text-input"
                                  />
                                  <span className="enhanced-file-name">{file.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="enhanced-form-actions">
                            <button 
                              onClick={async () => {
                                try {
                                  setIsSavingImages(true);
                                  const formData = new FormData();
                                  formData.append('sanctuary_id', selectedSanctuaryForMedia);
                                  
                                  uploadedImages.forEach((file, index) => {
                                    formData.append('galleryImages', file);
                                    formData.append(`altTexts[${index}]`, imageAltTexts[index] || '');
                                  });

                                  await wildlifeService.uploadGalleryImages(selectedSanctuaryForMedia, formData);
                                  
                                  toast.success('Images saved successfully!');
                                  setShowImageUploadForm(false);
                                  setUploadedImages([]);
                                  setImageAltTexts({});
                                  fetchMediaForSanctuary(selectedSanctuaryForMedia);
                                } catch (error) {
                                  toast.error(`Error uploading images: ${error.message || error}`);
                                } finally {
                                  setIsSavingImages(false);
                                }
                              }}
                              className={`enhanced-media-save-btn ${isSavingImages ? 'loading' : ''}`}
                              disabled={isSavingImages}
                            >
                              <i className={isSavingImages ? "fas fa-spinner fa-spin" : "fas fa-save"}></i> 
                              {isSavingImages ? 'Saving...' : 'Save Images'}
                            </button>
                            <button 
                              onClick={() => {
                                setShowImageUploadForm(false);
                                setUploadedImages([]);
                                setImageAltTexts({});
                              }}
                              className="enhanced-cancel-btn"
                            >
                              <i className="fas fa-times"></i> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Upload Form */}
                  {showVideoUploadForm && (
                    <div className="enhanced-media-upload-form">
                      <div className="form-header">
                        <h3 className="video-header">Upload Videos</h3>
                        <button 
                          onClick={() => {
                            setShowVideoUploadForm(false);
                            setUploadedVideos([]);
                            setVideoTitles({});
                          }}
                          className="enhanced-close-btn"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      
                      <div className="enhanced-file-input-container">
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setUploadedVideos(files);
                            // Initialize titles for new videos
                            const newTitles = {};
                            files.forEach((file, index) => {
                              newTitles[index] = file.name.replace(/\.[^/.]+$/, "");
                            });
                            setVideoTitles(newTitles);
                          }}
                          className="enhanced-file-input"
                        />
                        <small className="enhanced-upload-help">Select multiple videos to upload (MP4, AVI, MOV, WebM)</small>
                      </div>

                      {uploadedVideos.length > 0 && (
                        <div className="enhanced-uploaded-files">
                          <h4>Selected Videos ({uploadedVideos.length})</h4>
                          <div className="enhanced-videos-grid">
                            {uploadedVideos.map((file, index) => (
                              <div key={index} className="enhanced-video-preview">
                                <video 
                                  src={URL.createObjectURL(file)} 
                                  className="enhanced-preview-video"
                                  preload="metadata"
                                />
                                <div className="enhanced-video-details">
                                  <input
                                    type="text"
                                    placeholder="Video Title"
                                    value={videoTitles[index] || ''}
                                    onChange={(e) => setVideoTitles({
                                      ...videoTitles,
                                      [index]: e.target.value
                                    })}
                                    className="enhanced-video-title-input"
                                  />
                                  <span className="enhanced-file-name">{file.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="enhanced-form-actions">
                            <button 
                              onClick={async () => {
                                try {
                                  setIsSavingVideos(true);
                                  // Upload videos one by one since the API expects single video
                                  for (let i = 0; i < uploadedVideos.length; i++) {
                                    const file = uploadedVideos[i];
                                    const title = videoTitles[i] || '';
                                    
                                    const formData = new FormData();
                                    formData.append('video', file);
                                    formData.append('title', title);
                                    
                                    await wildlifeService.uploadVideo(selectedSanctuaryForMedia, formData);
                                  }
                                  
                                  toast.success('Videos saved successfully!');
                                  setShowVideoUploadForm(false);
                                  setUploadedVideos([]);
                                  setVideoTitles({});
                                  fetchMediaForSanctuary(selectedSanctuaryForMedia);
                                } catch (error) {
                                  toast.error(`Error uploading videos: ${error.message || error}`);
                                } finally {
                                  setIsSavingVideos(false);
                                }
                              }}
                              className={`enhanced-media-save-btn ${isSavingVideos ? 'loading' : ''}`}
                              disabled={isSavingVideos}
                            >
                              <i className={isSavingVideos ? "fas fa-spinner fa-spin" : "fas fa-save"}></i> 
                              {isSavingVideos ? 'Saving...' : 'Save Videos'}
                            </button>
                            <button 
                              onClick={() => {
                                setShowVideoUploadForm(false);
                                setUploadedVideos([]);
                                setVideoTitles({});
                              }}
                              className="enhanced-cancel-btn"
                            >
                              <i className="fas fa-times"></i> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gallery Images Table */}
                  {Array.isArray(mediaList.images) && mediaList.images.length > 0 && (
                    <div className="media-section">
                      <h3>Gallery Images ({mediaList.images.length})</h3>
                      <div className="sanctuaries-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Sr. No.</th>
                              <th>Image</th>
                              <th>Filename</th>
                              <th>Alt Text</th>
                              <th>Upload Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mediaList.images.map((image, index) => {
                              // Handle different possible field names
                              const filename = image.filename || image.image_path || image.name || '';
                              const imageUrl = filename ? `${API_URL}/uploads/${filename}` : '';
                              const altText = image.alt_text || image.altText || '-';
                              return (
                                <tr key={image.id}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <div className="sanctuary-image-cell">
                                      {imageUrl ? (
                                        <img 
                                          src={imageUrl}
                                          alt={altText} 
                                          className="sanctuary-thumbnail"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-image.jpg';
                                          }}
                                          onLoad={() => {
                                            }}
                                        />
                                      ) : (
                                        <div className="no-image-placeholder">
                                          No Image
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="truncate-text" title={filename || 'No filename'}>
                                    {filename || 'No filename'}
                                  </td>
                                  <td className="truncate-text" title={altText}>
                                    {altText}
                                  </td>
                                  <td>{image.created_at ? new Date(image.created_at).toLocaleDateString() : '-'}</td>
                                  <td className="action-buttons">
                                    <button 
                                      onClick={() => handleDeleteMedia('image', image.id)}
                                      className="delete-btn"
                                      title="Delete Image"
                                    >
                                      <i className="fas fa-trash"></i> Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Videos Table */}
                  {mediaList.videos.length > 0 && (
                    <div className="media-section">
                      <h3>Videos ({mediaList.videos.length})</h3>
                      <div className="sanctuaries-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Sr. No.</th>
                              <th>Video</th>
                              <th>Filename</th>
                              <th>Title</th>
                              <th>Upload Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mediaList.videos.map((video, index) => {
                              // Handle different possible field names
                              const filename = video.filename || video.video_path || video.name || '';
                              const videoUrl = filename ? `${API_URL}/uploads/${filename}` : '';
                              const videoTitle = video.title || video.video_title || '-';
                              return (
                                <tr key={video.id}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <div className="sanctuary-image-cell">
                                      {videoUrl ? (
                                        <video 
                                          src={videoUrl}
                                          className="sanctuary-thumbnail"
                                          preload="metadata"
                                          onError={(e) => {
                                            }}
                                          onLoadedMetadata={() => {
                                            }}
                                        />
                                      ) : (
                                        <div className="no-image-placeholder">
                                          No Video
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="truncate-text" title={filename || 'No filename'}>
                                    {filename || 'No filename'}
                                  </td>
                                  <td className="truncate-text" title={videoTitle}>
                                    {videoTitle}
                                  </td>
                                  <td>{video.created_at ? new Date(video.created_at).toLocaleDateString() : '-'}</td>
                                  <td className="action-buttons">
                                    <button 
                                      onClick={() => handleDeleteMedia('video', video.id)}
                                      className="delete-btn"
                                      title="Delete Video"
                                    >
                                      <i className="fas fa-trash"></i> Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* No Media Message */}
                  {mediaList.images.length === 0 && mediaList.videos.length === 0 && (
                    <div className="sanctuaries-table">
                      <table>
                        <tbody>
                          <tr>
                            <td colSpan="6" className="no-data">
                              No media files uploaded for this sanctuary yet
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {!selectedSanctuaryForMedia && (
                <div className="sanctuaries-table">
                  <table>
                    <tbody>
                      <tr>
                        <td colSpan="6" className="no-data">
                          Please select a wildlife sanctuary to view and manage its media files
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="wildlife-form-container">
            <div className="form-header">
              <h2>Basic Information</h2>
              <div className="header-buttons">
                <button onClick={() => setShowBasicForm(true)} className="add-new-btn">
                  <i className="fas fa-plus"></i> Add New Basic Info
                </button>
                <button onClick={() => handleMainTabChange('list')} className="back-btn">
                  Back to List
                </button>
              </div>
            </div>
            <div className="tab-content">
              {!showBasicForm ? (
                <div className="basic-info-list">
                  <div className="sanctuaries-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Sanctuary Name</th>
                          <th>Location</th>
                          <th>Contact</th>
                          <th>Entry Fee (Adults)</th>
                          <th>Timings</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {basicInfoList.map((info, index) => (
                          <tr key={info.id}>
                            <td>{index + 1}</td>
                            <td>{info.sanctuary_name}</td>
                            <td>{info.location}</td>
                            <td>{info.contact_number || 'N/A'}</td>
                            <td>₹{info.entry_fee_adults || 'N/A'}</td>
                            <td>
                              {info.opening_time && info.closing_time 
                                ? `${info.opening_time} - ${info.closing_time}`
                                : 'N/A'
                              }
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="edit-btn"
                                  onClick={() => handleEditBasicInfo(info)}
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={() => handleDeleteBasicInfo(info.id)}
                                  title="Delete"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="sanctuary-selection-form">
                  <div className="form-section">
                    <h3>Select Wildlife Sanctuary</h3>
                    <p>Please select a wildlife sanctuary to add basic information:</p>
                    
                    <div className="form-group">
                      <label>Choose Sanctuary *</label>
                      <select 
                        className="sanctuary-select"
                        value={selectedSanctuaryForBasic || ''}
                        onChange={(e) => setSelectedSanctuaryForBasic(e.target.value)}
                      >
                        <option value="">-- Select a Sanctuary --</option>
                        {sanctuaries.map(sanctuary => (
                          <option key={sanctuary.id} value={sanctuary.id}>
                            {sanctuary.title} - {sanctuary.location}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        onClick={() => setShowBasicForm(false)} 
                        className="cancel-btn"
                      >
                        <i className="fas fa-times"></i> Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (selectedSanctuaryForBasic) {
                            setShowBasicForm(false);
                            setShowBasicInfoForm(true);
                          } else {
                            toast.error('Please select a sanctuary first');
                          }
                        }} 
                        className="submit-btn"
                        disabled={!selectedSanctuaryForBasic}
                      >
                        <i className="fas fa-arrow-right"></i> Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {showBasicInfoForm && selectedSanctuaryForBasic && (
                <BasicInfoForm 
                  editingData={editingBasicInfo}
                  sanctuaryId={selectedSanctuaryForBasic}
                  sanctuaryName={sanctuaries.find(s => s.id == selectedSanctuaryForBasic)?.title}
                  onCancel={() => {
                    setShowBasicInfoForm(false);
                    setSelectedSanctuaryForBasic(null);
                    setShowBasicForm(false);
                    setEditingBasicInfo(null);
                  }}
                  onSuccess={() => {
                    setShowBasicInfoForm(false);
                    setSelectedSanctuaryForBasic(null);
                    setShowBasicForm(false);
                    setEditingBasicInfo(null);
                    loadBasicInfo();
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Wildlife & Flora Tab */}
        {activeTab === 'wildlife' && (
          <div className="wildlife-form-container">
            <div className="form-header">
              <h2>Wildlife & Flora</h2>
              <div className="header-buttons">
                <button onClick={() => setShowWildlifeFloraForm(true)} className="add-new-btn">
                  <i className="fas fa-plus"></i> Add New Wildlife & Flora Info
                </button>
                <button onClick={() => handleMainTabChange('list')} className="back-btn">
                  Back to List
                </button>
              </div>
            </div>
            <div className="tab-content">
              {!showWildlifeFloraForm && !selectedSanctuaryForWildlifeFlora ? (
                <div className="wildlife-flora-list">
                  {loadingWildlifeFlora ? (
                    <div className="loading-container">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p>Loading wildlife & flora data...</p>
                    </div>
                  ) : (
                    <div className="sanctuaries-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Sr. No.</th>
                            <th>Sanctuary Name</th>
                            <th>Location</th>
                            <th>Wildlife Categories</th>
                            <th>Total Items</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wildlifeFloraList.map((sanctuary, index) => (
                            <tr key={sanctuary.id}>
                              <td>{index + 1}</td>
                              <td>{sanctuary.sanctuary_name}</td>
                              <td>{sanctuary.location}</td>
                              <td>
                                <div className="category-counts">
                                  {sanctuary.mammals_count > 0 && (
                                    <span className="category-badge category-mammals">
                                      Mammals: {sanctuary.mammals_count}
                                    </span>
                                  )}
                                  {sanctuary.birds_count > 0 && (
                                    <span className="category-badge category-birds">
                                      Birds: {sanctuary.birds_count}
                                    </span>
                                  )}
                                  {sanctuary.reptiles_count > 0 && (
                                    <span className="category-badge category-reptiles">
                                      Reptiles: {sanctuary.reptiles_count}
                                    </span>
                                  )}
                                  {sanctuary.flora_count > 0 && (
                                    <span className="category-badge category-flora">
                                      Flora: {sanctuary.flora_count}
                                    </span>
                                  )}
                                  {sanctuary.endangered_species_count > 0 && (
                                    <span className="category-badge category-endangered_species">
                                      Endangered: {sanctuary.endangered_species_count}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>{sanctuary.total_items}</td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="edit-btn"
                                    onClick={() => handleEditWildlifeFlora(sanctuary)}
                                    title="Edit Wildlife & Flora"
                                  >
                                    <i className="fas fa-edit"></i> Edit
                                  </button>
                                  <button 
                                    className="delete-btn"
                                    onClick={() => handleDeleteWildlifeFlora(sanctuary.id)}
                                    title="Delete All Wildlife & Flora"
                                  >
                                    <i className="fas fa-trash"></i> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {wildlifeFloraList.length === 0 && (
                            <tr>
                              <td colSpan="6" className="no-data">
                                No wildlife & flora information found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : showWildlifeFloraForm ? (
                <div className="sanctuary-selection-form">
                  <div className="form-section">
                    <h3>Select Wildlife Sanctuary</h3>
                    <p>Please select a wildlife sanctuary to add wildlife & flora information:</p>
                    
                    <div className="form-group">
                      <label>Choose Sanctuary *</label>
                      <select 
                        className="sanctuary-select"
                        value={selectedSanctuaryForWildlifeFlora || ''}
                        onChange={(e) => setSelectedSanctuaryForWildlifeFlora(e.target.value)}
                      >
                        <option value="">-- Select a Sanctuary --</option>
                        {sanctuaries.map(sanctuary => (
                          <option key={sanctuary.id} value={sanctuary.id}>
                            {sanctuary.title} - {sanctuary.location}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        onClick={() => setShowWildlifeFloraForm(false)} 
                        className="cancel-btn"
                      >
                        <i className="fas fa-times"></i> Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (selectedSanctuaryForWildlifeFlora) {
                            setShowWildlifeFloraForm(false);
                            // Show the WildlifeFloraForm component
                          } else {
                            toast.error('Please select a sanctuary first');
                          }
                        }} 
                        className="submit-btn"
                        disabled={!selectedSanctuaryForWildlifeFlora}
                      >
                        <i className="fas fa-arrow-right"></i> Continue
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedSanctuaryForWildlifeFlora && (
                <WildlifeFloraForm 
                  sanctuaryId={selectedSanctuaryForWildlifeFlora}
                  sanctuaryName={sanctuaries.find(s => s.id == selectedSanctuaryForWildlifeFlora)?.title}
                  editingData={editingWildlifeFlora}
                  onCancel={() => {
                    setSelectedSanctuaryForWildlifeFlora(null);
                    setShowWildlifeFloraForm(false);
                    setEditingWildlifeFlora(null);
                  }}
                  onSuccess={() => {
                    setSelectedSanctuaryForWildlifeFlora(null);
                    setShowWildlifeFloraForm(false);
                    setEditingWildlifeFlora(null);
                    loadWildlifeFlora();
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageWildlife; 