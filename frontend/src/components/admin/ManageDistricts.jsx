import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ManageDistricts.css';

const TABS = {
  DISTRICTS: 'Manage Districts',
  GALLERY: 'Image Gallery',
  ABOUT: 'About',
  WEB_STORIES: 'Web Stories',
  SEASONS: 'Manage Seasons'
};

const INDIAN_SEASONS = [
  { id: 'spring', name: 'Spring (Vasanta)' },
  { id: 'summer', name: 'Summer (Grishma)' },
  { id: 'monsoon', name: 'Monsoon (Varsha)' },
  { id: 'autumn', name: 'Autumn (Sharad)' },
  { id: 'pre-winter', name: 'Pre-winter (Hemant)' },
  { id: 'winter', name: 'Winter (Shishira)' }
];

const ManageDistricts = () => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.DISTRICTS);
  const [selectedState, setSelectedState] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [states, setStates] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [selectedGalleryDistrict, setSelectedGalleryDistrict] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [galleryError, setGalleryError] = useState(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [webStories, setWebStories] = useState([]);
  const [showWebStoryModal, setShowWebStoryModal] = useState(false);
  const [editingWebStory, setEditingWebStory] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsStory, setAnalyticsStory] = useState(null);
  const [webStoryForm, setWebStoryForm] = useState({
    title: '',
    slug: '',
    images: [],
    featured_image: null,
    featured_image_preview: null,
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    meta_keyword_input: ''
  });
  const [metaTitlePasteCount, setMetaTitlePasteCount] = useState(0);
  const [metaDescPasteCount, setMetaDescPasteCount] = useState(0);
  const [metaKeywordsPasteCount, setMetaKeywordsPasteCount] = useState(0);
  const [metaTitleWarning, setMetaTitleWarning] = useState('');
  const [metaDescWarning, setMetaDescWarning] = useState('');
  const [metaKeywordsWarning, setMetaKeywordsWarning] = useState('');
  const [webStoriesLoading, setWebStoriesLoading] = useState(false);
  const [showDistrictForm, setShowDistrictForm] = useState(false);
  const [isEditingDistrict, setIsEditingDistrict] = useState(false);
  const [districtFormData, setDistrictFormData] = useState({
    name: '',
    slug: '',
    description: '',
    featured_image: null,
    featured_image_preview: null,  // Add this for preview URL
    state_id: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [selectedSeasonDistrict, setSelectedSeasonDistrict] = useState('');
  const [districtSeasons, setDistrictSeasons] = useState([]);
  const [seasonImages, setSeasonImages] = useState({});
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [newImageData, setNewImageData] = useState({
    image: null,
    preview: null,
    location: '',
    alt_text: ''
  });
  const [showSeasonImageModal, setShowSeasonImageModal] = useState(false);
  const [selectedSeasonImage, setSelectedSeasonImage] = useState(null);
  const [showTerritoryForm, setShowTerritoryForm] = useState(false);
  const [isEditingTerritory, setIsEditingTerritory] = useState(false);
  const [territoryFormData, setTerritoryFormData] = useState({
    title: '',
    slug: '',
    capital: '',
    famous_for: '',
    preview_image: null,
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [territoryDistricts, setTerritoryDistricts] = useState([]);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState(null);

  const fetchStates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/states');
      setStates(response.data);
    } catch (err) {
      console.error('Error fetching states:', err);
      setError('Failed to fetch states. Please check your connection and try again.');
    }
  };

  const fetchTerritories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/territories');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const sortedTerritories = response.data.data.sort((a, b) => 
          a.title.localeCompare(b.title)
        );
        setTerritories(sortedTerritories);
      } else {
        console.error('Invalid territories data format:', response.data);
        setTerritories([]);
      }
    } catch (err) {
      console.error('Error fetching territories:', err);
      setTerritories([]);
    }
  };

  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/territories');
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const sortedTerritories = response.data.data.sort((a, b) => 
            a.title.localeCompare(b.title)
          );
          setTerritories(sortedTerritories);
        } else {
          console.error('Invalid territories data format:', response.data);
          setTerritories([]);
        }
      } catch (err) {
        console.error('Error fetching territories:', err);
        setTerritories([]);
      }
    };

    fetchTerritories();
    // Refresh territories every 30 seconds
    const intervalId = setInterval(fetchTerritories, 30000);
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs only on mount

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchDistricts = useCallback(async () => {
    if (!selectedState && !selectedTerritory) return;
    setLoading(true);
    setError(null);
    try {
      if (selectedState) {
        const selectedStateData = states.find(state => state.id === parseInt(selectedState));
        if (!selectedStateData) {
          throw new Error("Selected state not found");
        }
        const response = await axios.get(`http://localhost:5000/api/districts/state/${selectedStateData.name}`);
        setDistricts(response.data);
        setTerritoryDistricts([]); // Clear territory districts
      } else if (selectedTerritory) {
        const response = await axios.get(`http://localhost:5000/api/territory-districts/territory/${selectedTerritory}`);
        setTerritoryDistricts(response.data);
        setDistricts([]); // Clear state districts
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
      if (err.response) {
        setError(`Server error: ${err.response.status} – ${err.response.data?.error || "Unknown error"}`);
      } else if (err.request) {
        setError("No response from server. Please check if the server is running.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedTerritory, states]);

  useEffect(() => {
    if (selectedState || selectedTerritory) {
    fetchDistricts();
    } else {
      setDistricts([]);
      setTerritoryDistricts([]);
    }
  }, [selectedState, selectedTerritory, fetchDistricts]);

  useEffect(() => {
    if (activeTab === TABS.GALLERY && selectedGalleryDistrict) {
      fetchGalleryImages(selectedGalleryDistrict);
    } else {
      setGalleryImages([]);
    }
    setShowAddImage(false);
    setNewImageFile(null);
    setNewImagePreview(null);
    setNewImageCaption('');
    setNewImageAlt('');
    setGalleryError(null);
  }, [activeTab, selectedGalleryDistrict]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleDelete = async (districtId) => {
    if (window.confirm('Are you sure you want to delete this district?')) {
      try {
        if (selectedState) {
        await axios.delete(`http://localhost:5000/api/districts/${districtId}`);
        setDistricts(districts.filter(district => district.id !== districtId));
        } else if (selectedTerritory) {
          await axios.delete(`http://localhost:5000/api/territory-districts/${districtId}`);
          setTerritoryDistricts(territoryDistricts.filter(district => district.id !== districtId));
        }
      } catch (error) {
        console.error('Error deleting district:', error);
        alert('Failed to delete district. Please try again.');
      }
    }
  };

  const fetchGalleryImages = async (districtId) => {
    setGalleryLoading(true);
    setGalleryError(null);
    try {
        let endpoint;
        if (selectedState) {
            endpoint = `http://localhost:5000/api/districts/${districtId}/images`;
        } else if (selectedTerritory) {
            endpoint = `http://localhost:5000/api/territory-district-images/district/${districtId}/images`;
        }
        
        if (endpoint) {
            const res = await axios.get(endpoint);
            if (res.data) {
                // Transform image URLs to include full path if needed
                const images = res.data.map(img => ({
                    ...img,
                    image_url: img.image_url.startsWith('http') ? 
                        img.image_url : 
                        `http://localhost:5000${img.image_url}`
                }));
                setGalleryImages(images);
            }
        }
    } catch (err) {
        setGalleryError('Failed to load images.');
        console.error('Error fetching images:', err);
    }
    setGalleryLoading(false);
  };

  const handleGalleryAddImageClick = () => {
    setShowAddImage(true);
    setNewImageFile(null);
    setNewImagePreview(null);
    setNewImageCaption('');
    setNewImageAlt('');
    setGalleryError(null);
  };

  const handleGalleryImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
        let endpoint;
        if (selectedState) {
            endpoint = `http://localhost:5000/api/districts/images/${imageId}`;
        } else if (selectedTerritory) {
            endpoint = `http://localhost:5000/api/territory-districts/images/${imageId}`;
        }

        if (endpoint) {
            await axios.delete(endpoint);
      setGalleryImages(galleryImages.filter(img => img.id !== imageId));
        }
    } catch (err) {
      alert('Failed to delete image.');
        console.error('Error deleting image:', err);
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!newImageFile) {
      setGalleryError('Please select an image.');
      return;
    }
    setGalleryUploading(true);
    setGalleryError(null);
    try {
      const formData = new FormData();
      formData.append('image', newImageFile);
      formData.append('caption', newImageCaption);
      formData.append('alt_text', newImageAlt);

      let endpoint;
      if (selectedState) {
        endpoint = `http://localhost:5000/api/districts/${selectedGalleryDistrict}/images`;
      } else if (selectedTerritory) {
        endpoint = `http://localhost:5000/api/territory-districts/district/${selectedGalleryDistrict}/images`;
      }

      if (endpoint) {
        const token = localStorage.getItem('token'); // Get token from localStorage
        const response = await axios.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // Add token to headers
          }
        });
        
        if (response.data) {
      setShowAddImage(false);
      setNewImageFile(null);
      setNewImagePreview(null);
      setNewImageCaption('');
      setNewImageAlt('');
      fetchGalleryImages(selectedGalleryDistrict);
        }
      }
    } catch (err) {
      setGalleryError('Failed to upload image.');
      console.error('Error uploading image:', err);
    }
    setGalleryUploading(false);
  };

  const fetchWebStories = async () => {
    setWebStoriesLoading(true);
    try {
      let endpoint = 'http://localhost:5000/api/web-stories';
      let territoryEndpoint = 'http://localhost:5000/api/territory-web-stories';
      
      // Add query parameters based on selection
      if (selectedState) {
        const selectedStateData = states.find(state => state.id === parseInt(selectedState));
        endpoint += `?state=${selectedStateData.name}&district_type=state`;
        const response = await axios.get(endpoint);
        if (response.data && Array.isArray(response.data)) {
          setWebStories(response.data);
        }
      } else if (selectedTerritory) {
        // Fetch territory web stories
        const response = await axios.get(`${territoryEndpoint}/territory/${selectedTerritory}`);
        if (response.data && Array.isArray(response.data)) {
          // Transform territory web stories to match the state web stories format
          const transformedStories = response.data.map(story => {
            // Debug log for featured_image
            console.log('Territory story mapping:', story);
            return {
              id: story.id,
              title: story.title,
              slug: story.slug,
              // Use featured_image or featuredImage from backend
              featured_image: story.featured_image || story.featuredImage || '',
              district_id: story.territory_district_id,
              district_name: story.district_name,
              district_type: 'territory'
            };
          });
          setWebStories(transformedStories);
        }
      }
    } catch (err) {
      console.error('Error fetching web stories:', err);
      if (err.response) {
        setError(`Failed to fetch web stories: ${err.response.data?.error || 'Server error'}`);
      } else if (err.request) {
        setError('No response from server. Please check if the server is running.');
      } else {
        setError(`Error: ${err.message}`);
      }
      setWebStories([]);
    } finally {
      setWebStoriesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === TABS.WEB_STORIES) {
      fetchWebStories();
    }
  }, [activeTab, selectedState, selectedTerritory]);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...webStoryForm.images];
      newImages[index] = {
        file: file,
        preview: URL.createObjectURL(file),
        alt: newImages[index]?.alt || '',
        desc: newImages[index]?.desc || ''
      };
      setWebStoryForm(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  const handleImageMetaChange = (index, field, value) => {
    const newImages = [...webStoryForm.images];
    newImages[index] = {
      ...newImages[index],
      [field]: value
    };
    setWebStoryForm(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setWebStoryForm(prev => ({
      ...prev,
      images: [...prev.images, { file: null, preview: null, alt: '', desc: '' }]
    }));
  };

  const removeImageField = (index) => {
    setWebStoryForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleWebStorySubmit = async (e) => {
    e.preventDefault();
    console.log('=== Starting handleWebStorySubmit ===');
    console.log('Selected District:', selectedDistrict);
    console.log('Selected Territory:', selectedTerritory);
    console.log('Selected State:', selectedState);
    
    // Validate required fields
    if (!selectedDistrict) {
      console.error('No district selected');
      setError('Please select a district first');
      return;
    }

    // Additional validation for territory stories
    if (selectedTerritory && !territories.find(t => t.id === parseInt(selectedTerritory))) {
      console.error('Invalid territory selected');
      setError('Please select a valid territory');
      return;
    }

    try {
      const formData = new FormData();
      
      // Debug logs for initial state
      console.log('Initial State:', {
        selectedDistrict,
        selectedTerritory,
        editingWebStory,
        webStoryForm
      });

      // For territory web stories, we only need to check if we're in territory mode
      const isTerritoryStory = Boolean(selectedTerritory);
      console.log('Story Type:', { isTerritoryStory, selectedTerritory });

      // Set endpoint based on story type - only use territory endpoint for territory stories
      const endpoint = isTerritoryStory
        ? (editingWebStory?.id 
            ? `http://localhost:5000/api/territory-web-stories/${editingWebStory.id}`
            : 'http://localhost:5000/api/territory-web-stories')
        : (editingWebStory?.id
            ? `http://localhost:5000/api/web-stories/${editingWebStory.id}`
            : 'http://localhost:5000/api/web-stories');

      console.log('Using endpoint:', endpoint);

      // Add district/territory information - ensure territory data is only added for territory stories
      if (isTerritoryStory) {
        console.log('Adding territory data:', { 
          territory_district_id: selectedDistrict,
          territory_id: selectedTerritory
        });
        formData.append('territory_district_id', selectedDistrict);
        // Remove territory_id as it's not needed by the backend
        // formData.append('territory_id', selectedTerritory);
      } else {
        console.log('Adding state data:', { 
          district_id: selectedDistrict,
          district_type: 'state'
        });
        formData.append('district_id', selectedDistrict);
        formData.append('district_type', 'state');
      }

      // Add only the required fields for the main story
      formData.append('title', webStoryForm.title);
      formData.append('slug', webStoryForm.slug);
      formData.append('meta_title', webStoryForm.meta_title);
      formData.append('meta_description', webStoryForm.meta_description);
      formData.append('meta_keywords', webStoryForm.meta_keywords.join(','));

      // Log the final form data
      console.log('Final Form Data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Handle featured image
      if (webStoryForm.featured_image instanceof File) {
        formData.append('featured_image', webStoryForm.featured_image);
      }

      // Handle story images with their descriptions
      const altTexts = [];
      const descriptions = [];
      const existingImageIds = [];
      const imageOrders = [];
      
      webStoryForm.images.forEach((img, idx) => {
        if (img.file) {
          // New image
          formData.append('images', img.file);
          altTexts.push(img.alt || '');
          descriptions.push(img.desc || ''); // Description goes with each image
          imageOrders.push(idx);
        } else if (img.id) {
          // Existing image
          existingImageIds.push(img.id);
          altTexts.push(img.alt || '');
          descriptions.push(img.desc || ''); // Description goes with each image
          imageOrders.push(img.order || idx);
        }
      });

      // Add existing image IDs and their orders
      formData.append('existing_image_ids', existingImageIds.join(','));
      formData.append('image_orders', imageOrders.join(','));
      
      // Add alt_texts and descriptions as comma-separated strings
      formData.append('alt_texts', altTexts.join(','));
      formData.append('descriptions', descriptions.join(',')); // Descriptions for images

      let response;
      if (editingWebStory) {
        // Update existing story
        response = await axios.put(
          `${endpoint}/${editingWebStory.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Create new story
        response = await axios.post(
          endpoint,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      if (response.data) {
        setWebStoryForm({
          title: '',
          slug: '',
          images: [],
          featured_image: null,
          featured_image_preview: null,
          meta_title: '',
          meta_description: '',
          meta_keywords: [],
          meta_keyword_input: ''
        });
        setShowWebStoryModal(false);
        fetchWebStories();
      }
    } catch (err) {
      console.error('Error saving web story:', err);
      setError(err.response?.data?.error || 'Error saving web story');
    }
  };

  // Update the image display in the form
  const renderImageFields = () => {
    return webStoryForm.images.map((img, index) => (
      <div key={img.id || index} className="image-upload-row">
        <div className="image-preview-container">
          {img.preview && (
            <img
              src={img.preview}
              alt="Preview"
              style={{ width: '100px', height: '60px', objectFit: 'cover' }}
            />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, index)}
        />
        <input
          type="text"
          placeholder="Alt Text"
          value={img.alt || ''}
          onChange={(e) => handleImageMetaChange(index, 'alt', e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={img.desc || ''}
          onChange={(e) => handleImageMetaChange(index, 'desc', e.target.value)}
        />
        <button type="button" onClick={() => removeImageField(index)}>
          Remove
        </button>
      </div>
    ));
  };

  // Delete handler
  const handleDeleteWebStory = async (storyId) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/web-stories/${storyId}`);
      fetchWebStories();
    } catch (err) {
      alert('Failed to delete story');
    }
  };

  const handleAddDistrictClick = () => {
    setIsEditingDistrict(false);
    setDistrictFormData({
      name: '',
      slug: '',
      description: '',
      featured_image: null,
      featured_image_preview: null,  // Add this for preview URL
      state_id: selectedState,
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setShowDistrictForm(true);
  };

  const handleEditDistrictClick = (district) => {
    setIsEditingDistrict(true);
    setDistrictFormData({
      id: district.id,
      name: district.name,
      slug: district.slug,
      description: district.description,
      featured_image: district.featured_image,
      featured_image_preview: district.featured_image ? 
        (district.featured_image.startsWith('http') ? 
          district.featured_image : 
          `http://localhost:5000${district.featured_image}`) : null,
      state_id: district.state_id,
      meta_title: district.meta_title || '',
      meta_description: district.meta_description || '',
      meta_keywords: district.meta_keywords || ''
    });
    setShowDistrictForm(true);
  };

  const handleDistrictFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      if (selectedState) {
        // Keep existing state district logic
      const selectedStateData = states.find(state => state.id === parseInt(selectedState));
      if (selectedStateData) {
          formData.append('state_name', selectedStateData.name);
      }
      Object.keys(districtFormData).forEach(key => {
        if (districtFormData[key] !== null && key !== 'state_id') {
          if (key === 'featured_image' && typeof districtFormData[key] === 'string') {
            return;
          }
          formData.append(key, districtFormData[key]);
        }
      });

      let response;
      if (isEditingDistrict) {
        response = await axios.put(`http://localhost:5000/api/districts/${districtFormData.id}`, formData);
      } else {
        response = await axios.post('http://localhost:5000/api/districts', formData);
        
        // Initialize seasons for new district
        if (response.data && response.data.id) {
          const newDistrictId = response.data.id;
          for (const season of INDIAN_SEASONS) {
            try {
              await axios.post('http://localhost:5000/api/seasons', {
                district_id: newDistrictId,
                season_name: season.name
              });
            } catch (error) {
              console.error(`Error creating season ${season.name}:`, error);
            }
          }
          }
        }
      } else if (selectedTerritory) {
        // Handle territory district creation/update
        formData.append('territory_id', selectedTerritory);
        Object.keys(districtFormData).forEach(key => {
          if (districtFormData[key] !== null && key !== 'territory_id') {
            if (key === 'featured_image' && typeof districtFormData[key] === 'string') {
              return;
            }
            formData.append(key, districtFormData[key]);
          }
        });

        let response;
        if (isEditingDistrict) {
          response = await axios.put(`http://localhost:5000/api/territory-districts/${districtFormData.id}`, formData);
        } else {
          response = await axios.post('http://localhost:5000/api/territory-districts', formData);
        }
      }

      setShowDistrictForm(false);
      fetchDistricts();
    } catch (error) {
      console.error('Error saving district:', error);
      setError(`Failed to ${isEditingDistrict ? 'update' : 'create'} district: ${error.message}`);
    }
  };

  const handleAboutDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    
    if (districtId) {
      try {
        let districtData, statsData;
        
        if (selectedState) {
          // Fetch state district details
          const districtResponse = await axios.get(`http://localhost:5000/api/districts/${districtId}`);
          districtData = districtResponse.data;
        
          // Fetch state district stats
          const statsResponse = await axios.get(`http://localhost:5000/api/districts/${districtId}/stats`);
          statsData = statsResponse.data;
        } else if (selectedTerritory) {
          // Fetch territory district details
          const districtResponse = await axios.get(`http://localhost:5000/api/territory-districts/${districtId}`);
          districtData = districtResponse.data;
          
          // Fetch territory district stats
          try {
            const statsResponse = await axios.get(`http://localhost:5000/api/territory-district-stats/district/${districtId}`);
            statsData = statsResponse.data;
          } catch (error) {
            console.log('No stats found for territory district, will create new stats');
            statsData = null;
          }
        }
        
        console.log('District data:', districtData);
        console.log('Stats data:', statsData);
        
        // Update form data with both district details and stats (if available)
        setDistrictFormData(prev => ({
          ...prev,
          ...districtData,
          // Set stats if they exist (for both state and territory districts)
          ...(statsData ? {
            population: statsData.population || '',
            males: statsData.males || '',
            females: statsData.females || '',
            literacy: statsData.literacy || '',
            households: statsData.households || '',
            adults: statsData.adults || '',
            children: statsData.children || '',
            old: statsData.old || ''
          } : {
            // Clear stats if none exist
            population: '',
            males: '',
            females: '',
            literacy: '',
            households: '',
            adults: '',
            children: '',
            old: ''
          })
        }));
      } catch (error) {
        console.error('Error fetching district data:', error);
        setError('Failed to fetch district data');
      }
    } else {
      setDistrictFormData({
        name: '',
        slug: '',
        description: '',
        featured_image: null,
        state_id: '',
        population: '',
        males: '',
        females: '',
        literacy: '',
        households: '',
        adults: '',
        children: '',
        old: ''
      });
    }
  };

  // Update the form submit handler
  const handleAboutFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // First update district details
      const formData = new FormData();
      Object.keys(districtFormData).forEach(key => {
        if (districtFormData[key] !== null && key !== 'population' && key !== 'males' && 
            key !== 'females' && key !== 'literacy' && key !== 'households' && 
            key !== 'adults' && key !== 'children' && key !== 'old') {
          formData.append(key, districtFormData[key]);
        }
      });

      if (selectedState) {
        // Keep existing state district code unchanged
        await axios.put(`http://localhost:5000/api/districts/${selectedDistrict}`, formData);

        const statsData = {
          population: districtFormData.population || '',
          males: districtFormData.males || '',
          females: districtFormData.females || '',
          literacy: districtFormData.literacy || '',
          households: districtFormData.households || '',
          adults: districtFormData.adults || '',
          children: districtFormData.children || '',
          old: districtFormData.old || ''
        };

        // Using POST request for territory district stats
        const statsResponse = await axios.post(
          `http://localhost:5000/api/territory-district-stats/district/${selectedDistrict}`, 
          statsData
        );
        console.log('Territory district stats update response:', statsResponse.data);
      } else if (selectedTerritory) {
        // Update territory district details
        await axios.put(`http://localhost:5000/api/territory-districts/${selectedDistrict}`, formData);

        // Update territory district stats using POST request
        const statsData = {
          population: districtFormData.population || '',
          males: districtFormData.males || '',
          females: districtFormData.females || '',
          literacy: districtFormData.literacy || '',
          households: districtFormData.households || '',
          adults: districtFormData.adults || '',
          children: districtFormData.children || '',
          old: districtFormData.old || ''
        };

        // Using POST request for territory district stats
        const statsResponse = await axios.post(
          `http://localhost:5000/api/territory-district-stats/district/${selectedDistrict}`, 
          statsData
        );
        console.log('Territory district stats update response:', statsResponse.data);
      }
      
      alert('District information and statistics updated successfully!');
    } catch (error) {
      console.error('Error updating district:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(`Failed to update district information: ${error.response.data.error || error.message}`);
      } else {
        setError('Failed to update district information');
      }
    }
  };

  const handleSeasonDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedSeasonDistrict(districtId);
    
    if (!districtId) {
      setDistrictSeasons([]);
      setSeasonImages({});
      return;
    }

    try {
      const endpoint = selectedTerritory 
        ? `http://localhost:5000/api/territory-seasons/district/${districtId}`
        : `http://localhost:5000/api/seasons/district/${districtId}`;
      
      const response = await axios.get(endpoint);
      let seasons = response.data;
      
      if (!seasons || seasons.length === 0) {
        const createEndpoint = selectedTerritory
          ? 'http://localhost:5000/api/territory-seasons'
          : 'http://localhost:5000/api/seasons';

        for (const season of INDIAN_SEASONS) {
          try {
            const seasonData = {
              territory_district_id: selectedTerritory ? districtId : null,
              district_id: !selectedTerritory ? districtId : null,
              season_name: season.name
            };
            await axios.post(createEndpoint, seasonData);
          } catch (error) {
            console.error(`Error creating season ${season.name}:`, error);
          }
        }
        const newResponse = await axios.get(endpoint);
        seasons = newResponse.data;
      }
      
      setDistrictSeasons(seasons);
      // Auto-select the first season if available
      if (seasons && seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      } else {
        setSelectedSeason(null);
      }

      // Fetch images for each season using the appropriate endpoint
      const images = {};
      for (const season of seasons) {
        try {
          console.log('Fetching images for season:', season.id);
          const imagesEndpoint = selectedTerritory
            ? `http://localhost:5000/api/territory-season-images/season/${season.id}`
            : `http://localhost:5000/api/season-images/season/${season.id}`;
          
          const imagesResponse = await axios.get(imagesEndpoint);
          images[season.id] = imagesResponse.data.map(img => ({
            ...img,
            image_url: img.image_url.startsWith('http') ? 
              img.image_url : 
              `http://localhost:5000/${img.image_url}`
          }));
        } catch (error) {
          console.error(`Error fetching images for season ${season.id}:`, error);
          images[season.id] = [];
        }
      }
      setSeasonImages(images);
    } catch (error) {
      console.error('Error in handleSeasonDistrictChange:', error);
      alert('Failed to fetch seasons data. Please try again.');
    }
};

  const handleSeasonImageUpload = async (e) => {
    e.preventDefault();
    if (!newImageData.image) {
      alert('Please select an image file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', newImageData.image);
      formData.append('location', newImageData.location);
      formData.append('alt_text', newImageData.alt_text);

      console.log('Uploading image with data:', {
        season_id: selectedSeason.id,
        location: newImageData.location,
        alt_text: newImageData.alt_text
      });

      const endpoint = selectedTerritory
        ? `http://localhost:5000/api/territory-season-images/season/${selectedSeason.id}`
        : `http://localhost:5000/api/season-images/season/${selectedSeason.id}`;

      const response = await axios.post(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Upload response:', response.data);

      if (response.data) {
        // Update the season images state
        setSeasonImages(prev => ({
          ...prev,
          [selectedSeason.id]: [...(prev[selectedSeason.id] || []), response.data]
        }));

        // Reset the form
        setShowSeasonImageModal(false);
        setNewImageData({
          image: null,
          preview: null,
          location: '',
          alt_text: ''
        });

        // Show success message
        alert('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading season image:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        alert(`Failed to upload image: ${error.response.data.error || 'Server error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Failed to upload image: No response from server');
      } else {
        console.error('Error details:', error.message);
        alert(`Failed to upload image: ${error.message}`);
      }
    }
  };

  const handleSeasonImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const preview = URL.createObjectURL(file);
      setNewImageData(prev => ({
        ...prev,
        image: file,
        preview
      }));
    }
  };

  const handleSeasonImageInputChange = (e) => {
    const { name, value } = e.target;
    setNewImageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeasonAddImageClick = (season) => {
    setSelectedSeasonImage(null);
    setNewImageData({
      image: null,
      preview: null,
      location: '',
      alt_text: ''
    });
    setShowSeasonImageModal(true);
  };

  const handleSeasonDeleteImage = async (seasonId, imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const endpoint = selectedTerritory
        ? `http://localhost:5000/api/territory-season-images/${imageId}`
        : `http://localhost:5000/api/season-images/${imageId}`;

      await axios.delete(endpoint);
      setSeasonImages(prev => ({
        ...prev,
        [seasonId]: prev[seasonId].filter(img => img.id !== imageId)
      }));
    } catch (error) {
      console.error('Error deleting season image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleEditSeasonImage = (image) => {
    setSelectedSeasonImage(image);
    setNewImageData({
      image: null,
      preview: image.image_url,
      location: image.location,
      alt_text: image.alt_text
    });
    setShowSeasonImageModal(true);
  };

  const handleUpdateSeasonImage = async (e) => {
    e.preventDefault();
    if (!selectedSeasonImage) return;

    const formData = new FormData();
    if (newImageData.image) {
      formData.append('image', newImageData.image);
    }
    formData.append('location', newImageData.location);
    formData.append('alt_text', newImageData.alt_text);

    try {
      const endpoint = selectedTerritory
        ? `http://localhost:5000/api/territory-season-images/${selectedSeasonImage.id}`
        : `http://localhost:5000/api/season-images/${selectedSeasonImage.id}`;

      const response = await axios.put(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSeasonImages(prev => ({
        ...prev,
        [selectedSeason.id]: prev[selectedSeason.id].map(img =>
          img.id === selectedSeasonImage.id ? response.data : img
        )
      }));

      setShowSeasonImageModal(false);
      setSelectedSeasonImage(null);
      setNewImageData({
        image: null,
        preview: null,
        location: '',
        alt_text: ''
      });
    } catch (error) {
      console.error('Error updating season image:', error);
      alert('Failed to update image. Please try again.');
    }
  };

  const handleAddTerritoryClick = () => {
    setIsEditingTerritory(false);
    setTerritoryFormData({
      title: '',
      slug: '',
      capital: '',
      famous_for: '',
      preview_image: null,
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setShowTerritoryForm(true);
  };

  const handleEditTerritoryClick = (territory) => {
    setIsEditingTerritory(true);
    setTerritoryFormData({
      id: territory.id,
      title: territory.title,
      slug: territory.slug,
      capital: territory.capital,
      famous_for: territory.famous_for,
      preview_image: null,
      meta_title: territory.meta_title || '',
      meta_description: territory.meta_description || '',
      meta_keywords: territory.meta_keywords || ''
    });
    setShowTerritoryForm(true);
  };

  const handleTerritoryFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(territoryFormData).forEach(key => {
        if (territoryFormData[key] !== null && key !== 'id') {
          formData.append(key, territoryFormData[key]);
        }
      });

      let response;
      if (isEditingTerritory) {
        response = await axios.put(`http://localhost:5000/api/territories/${territoryFormData.id}`, formData);
      } else {
        response = await axios.post('http://localhost:5000/api/territories', formData);
      }

      if (response.data.success) {
        setShowTerritoryForm(false);
        // Refresh territories list
        const territoriesResponse = await axios.get('http://localhost:5000/api/territories');
        if (territoriesResponse.data.success) {
          const sortedTerritories = territoriesResponse.data.data.sort((a, b) => 
            a.title.localeCompare(b.title)
          );
          setTerritories(sortedTerritories);
        }
      }
    } catch (error) {
      console.error('Error saving territory:', error);
      setError(`Failed to ${isEditingTerritory ? 'update' : 'create'} territory: ${error.message}`);
    }
  };

  const handleDeleteTerritory = async (territoryId) => {
    if (window.confirm('Are you sure you want to delete this territory?')) {
      try {
        await axios.delete(`http://localhost:5000/api/territories/${territoryId}`);
        setTerritories(territories.filter(territory => territory.id !== territoryId));
      } catch (error) {
        console.error('Error deleting territory:', error);
        alert('Failed to delete territory. Please try again.');
      }
    }
  };

  // Handle state selection
  const handleStateSelect = (e) => {
    const stateId = e.target.value;
    console.log('State selected:', {
      stateId,
      stateName: states.find(s => s.id === parseInt(stateId))?.name,
      previousState: selectedState,
      previousTerritory: selectedTerritory
    });
    setSelectedState(stateId);
    setSelectedTerritory(''); // Clear territory selection
    setSelectedDistrict(''); // Reset district selection
  };

  // Handle territory selection
  const handleTerritorySelect = (e) => {
    const territoryId = e.target.value;
    console.log('Territory selected:', {
      territoryId,
      territoryName: territories.find(t => t.id === parseInt(territoryId))?.title,
      previousState: selectedState,
      previousTerritory: selectedTerritory
    });
    setSelectedTerritory(territoryId);
    setSelectedState(''); // Clear state selection
    setSelectedDistrict(''); // Reset district selection
  };

  // Handle district selection
  const handleDistrictSelect = (e) => {
    const districtId = e.target.value;
    console.log('District selected:', {
      districtId,
      districtName: (selectedState ? districts : territoryDistricts).find(d => d.id === parseInt(districtId))?.name,
      selectedState,
      selectedTerritory,
      isTerritoryDistrict: Boolean(selectedTerritory)
    });
    setSelectedDistrict(districtId);
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) {
      setLogoError('Please select a logo file');
      return;
    }

    setLogoUploading(true);
    setLogoError(null);

    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      const response = await fetch('http://localhost:5000/api/web-stories/upload-logo', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload logo');
      }

      // Show success message
      alert('Logo uploaded successfully!');
      setShowLogoModal(false);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      setLogoError(error.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setLogoError('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setLogoError('Please upload an image file');
        return;
      }
      setLogoFile(file);
      setLogoError(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditWebStory = async (story) => {
    setEditingWebStory(story);
    if (selectedTerritory) {
      // Fetch full story details from backend for territory web stories
      try {
        const res = await axios.get(`http://localhost:5000/api/territory-web-stories/${story.id}`);
        const fullStory = res.data;
        setWebStoryForm({
          title: fullStory.title,
          slug: fullStory.slug,
          images: Array.isArray(fullStory.images)
            ? fullStory.images.map(img => ({
                id: img.id,
                preview: img.image_url && img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000/${img.image_url}`,
                alt: img.alt_text || '',
                desc: img.description || '',
                order: img.image_order || 0
              }))
            : [],
          featured_image: fullStory.featured_image,
          featured_image_preview: fullStory.featured_image
            ? (fullStory.featured_image.startsWith('http')
                ? fullStory.featured_image
                : `http://localhost:5000/${fullStory.featured_image}`)
            : null,
          meta_title: fullStory.meta_title || '',
          meta_description: fullStory.meta_description || '',
          meta_keywords: fullStory.meta_keywords ? fullStory.meta_keywords.split(',') : [],
          meta_keyword_input: ''
        });
        setShowWebStoryModal(true);
      } catch (err) {
        setError('Failed to load story details for editing');
      }
    } else {
      // State web story (existing logic)
      setWebStoryForm({
        title: story.title,
        slug: story.slug,
        images: story.images || [],
        featured_image: story.featured_image,
        featured_image_preview: story.featured_image
          ? (story.featured_image.startsWith('http')
              ? story.featured_image
              : `http://localhost:5000/${story.featured_image}`)
          : null,
        meta_title: story.meta_title || '',
        meta_description: story.meta_description || '',
        meta_keywords: story.meta_keywords ? story.meta_keywords.split(',') : [],
        meta_keyword_input: ''
      });
      setShowWebStoryModal(true);
    }
  };

  const handleUpdateWebStory = async (e) => {
    e.preventDefault();
    if (!editingWebStory) {
      setError('No story selected for editing');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('district_id', selectedDistrict);
      
      // Set district_type and endpoint based on selection
      let endpoint;
      if (selectedState) {
        endpoint = 'http://localhost:5000/api/web-stories';
        formData.append('district_type', 'state');
      } else if (selectedTerritory) {
        endpoint = 'http://localhost:5000/api/territory-web-stories';
        formData.append('territory_district_id', selectedDistrict);
      }

      formData.append('title', webStoryForm.title);
      formData.append('slug', webStoryForm.slug);
      formData.append('meta_title', webStoryForm.meta_title);
      formData.append('meta_description', webStoryForm.meta_description);
      formData.append('meta_keywords', webStoryForm.meta_keywords.join(','));

      // Handle featured image
      if (webStoryForm.featured_image instanceof File) {
        formData.append('featured_image', webStoryForm.featured_image);
      } else if (webStoryForm.featured_image) {
        formData.append('existing_featured_image', webStoryForm.featured_image);
      }

      // Handle story images
      const altTexts = [];
      const descriptions = [];
      const existingImageIds = [];
      const imageOrders = [];
      
      webStoryForm.images.forEach((img, idx) => {
        if (img.file) {
          // New image
          formData.append('images', img.file);
          altTexts.push(img.alt || '');
          descriptions.push(img.desc || '');
          imageOrders.push(idx);
        } else if (img.id) {
          // Existing image, only update alt/desc/order
          existingImageIds.push(img.id);
          altTexts.push(img.alt || '');
          descriptions.push(img.desc || '');
          imageOrders.push(img.order || idx);
        }
      });

      // Add existing image IDs and their orders
      formData.append('existing_image_ids', existingImageIds.join(','));
      formData.append('image_orders', imageOrders.join(','));
      
      // Add alt_texts and descriptions as comma-separated strings
      formData.append('alt_texts', altTexts.join(','));
      formData.append('descriptions', descriptions.join(','));

      const response = await axios.put(
        `${endpoint}/${editingWebStory.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        setWebStoryForm({
          title: '',
          slug: '',
          images: [],
          featured_image: null,
          featured_image_preview: null,
          meta_title: '',
          meta_description: '',
          meta_keywords: [],
          meta_keyword_input: ''
        });
        setEditingWebStory(null);
        setShowWebStoryModal(false);
        fetchWebStories();
      }
    } catch (err) {
      console.error('Error updating web story:', err);
      setError(err.response?.data?.error || 'Error updating web story');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="manage-districts-container">
      <div className="tabs">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === TABS.DISTRICTS && (
          <div className="interactive-gallery-tab">
            <div className="gallery-district-select">
              <div className="state-select-row" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                {!selectedTerritory && (
                  <div className="select-wrapper" style={{ flex: '1' }}>
                  <label htmlFor="state-select">Select State:</label>
                  <select
                    id="state-select"
                    value={selectedState}
                    onChange={handleStateSelect}
                    required
                    style={{ width: '100%' }}
                  >
                    <option value="">-- Select State --</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                </div>
                )}
                {!selectedState && (
                  <div className="select-wrapper" style={{ flex: '1' }}>
                    <label htmlFor="territory-select">Select Territory:</label>
                    <div className="territory-select-container" style={{ position: 'relative' }}>
                      <select
                        id="territory-select"
                        value={selectedTerritory}
                        onChange={handleTerritorySelect}
                        style={{ width: '100%', paddingLeft: '40px' }}
                      >
                        <option value="">-- Select Territory --</option>
                        {territories && territories.length > 0 ? territories.map((territory) => (
                          <option key={territory.id} value={territory.id}>
                            {territory.title} {territory.capital ? `(${territory.capital})` : ''}
                          </option>
                        )) : null}
                      </select>
                      {selectedTerritory && territories.find(t => t.id === parseInt(selectedTerritory))?.preview_image && (
                        <div style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <img 
                            src={territories.find(t => t.id === parseInt(selectedTerritory))?.preview_image.startsWith('http') ? 
                              territories.find(t => t.id === parseInt(selectedTerritory))?.preview_image : 
                              `http://localhost:5000/${territories.find(t => t.id === parseInt(selectedTerritory))?.preview_image}`}
                            alt="Territory preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {(selectedState || selectedTerritory) && (
                  <button className="add-button" onClick={handleAddDistrictClick} style={{ marginLeft: 'auto' }}>
                    <span>+</span> Add New District
                  </button>
                )}
              </div>

              {(selectedState || selectedTerritory) && (
                <div className="districts-table-container">
                  {(selectedState ? districts : territoryDistricts).length > 0 ? (
                    <table className="districts-table">
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Featured Image</th>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedState ? districts : territoryDistricts).map((district, index) => (
                          <tr key={district.id}>
                            <td>{index + 1}</td>
                            <td>
                              {district.featured_image ? (
                                <img 
                                  src={district.featured_image.startsWith('http') ? 
                                    district.featured_image : 
                                    `http://localhost:5000${district.featured_image}`} 
                                  alt={district.name}
                                  style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                                />
                              ) : (
                                <span style={{color: '#aaa'}}>No Image</span>
                              )}
                            </td>
                            <td>{district.name}</td>
                            <td>{district.description}</td>
                            <td className="action-buttons">
                              <button 
                                className="edit-btn"
                                onClick={() => handleEditDistrictClick(district)}
                              >
                                Edit
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDelete(district.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-districts">
                      No districts found for {selectedState ? 'this state' : 'this territory'}.
                </div>
              )}
            </div>
              )}

              {/* District Form Modal */}
            {showDistrictForm && (
              <div className="modal">
                <div className="modal-content">
                  <h2>{isEditingDistrict ? 'Edit District' : 'Add New District'}</h2>
                  <form onSubmit={handleDistrictFormSubmit}>
                    <div className="form-section">
                      <label>Name:</label>
                      <input
                        type="text"
                        value={districtFormData.name}
                        onChange={(e) => setDistrictFormData(prev => ({
                          ...prev,
                          name: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        }))}
                        required
                      />
                    </div>

                    <div className="form-section">
                      <label>Slug:</label>
                      <input
                        type="text"
                        value={districtFormData.slug}
                        onChange={(e) => setDistrictFormData(prev => ({
                          ...prev,
                          slug: e.target.value
                        }))}
                        required
                      />
                    </div>

                    <div className="form-section">
                      <label>Description:</label>
                      <textarea
                        value={districtFormData.description}
                        onChange={(e) => setDistrictFormData(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        rows="4"
                      />
                    </div>

                    <div className="form-section">
                      <label>Featured Image:</label>
                        <div className="featured-image-container">
                      <input
                        type="file"
                        accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setDistrictFormData(prev => ({
                          ...prev,
                                  featured_image: file,
                                  featured_image_preview: URL.createObjectURL(file)
                                }));
                              }
                            }}
                          />
                          {(districtFormData.featured_image_preview || districtFormData.featured_image) && (
                            <div className="image-preview-container" style={{ marginTop: '10px' }}>
                              <img 
                                src={districtFormData.featured_image_preview || 
                                  (typeof districtFormData.featured_image === 'string' ? 
                                    (districtFormData.featured_image.startsWith('http') ? 
                                      districtFormData.featured_image : 
                                      `http://localhost:5000${districtFormData.featured_image}`) : 
                                    null)}
                                alt="Featured Image Preview"
                                style={{ 
                                  width: '200px', 
                                  height: '120px', 
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd'
                                }}
                              />
                              <div className="image-actions" style={{ marginTop: '10px' }}>
                                <button 
                                  type="button" 
                                  className="remove-image-btn"
                                  onClick={() => setDistrictFormData(prev => ({
                                    ...prev,
                                    featured_image: null,
                                    featured_image_preview: null
                                  }))}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Remove Image
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                    </div>

                    <div className="form-section">
                      <label>Meta Title:</label>
                      <input
                        type="text"
                        value={districtFormData.meta_title}
                        onChange={(e) => setDistrictFormData(prev => ({
                          ...prev,
                          meta_title: e.target.value
                        }))}
                      />
                    </div>

                    <div className="form-section">
                      <label>Meta Description:</label>
                      <textarea
                        value={districtFormData.meta_description}
                        onChange={(e) => setDistrictFormData(prev => ({
                          ...prev,
                          meta_description: e.target.value
                        }))}
                        rows="3"
                      />
                    </div>

                    <div className="form-section">
                      <label>Meta Keywords:</label>
                      <input
                        type="text"
                        value={districtFormData.meta_keywords}
                        onChange={(e) => setDistrictFormData(prev => ({
                          ...prev,
                          meta_keywords: e.target.value
                        }))}
                        placeholder="Comma separated keywords"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-btn">
                        {isEditingDistrict ? 'Update District' : 'Create District'}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowDistrictForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {activeTab === TABS.GALLERY && (
          <div className="interactive-gallery-tab">
            <div className="gallery-district-select">
              <div className="state-select-row" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div className="select-wrapper" style={{ flex: '1' }}>
                  <label htmlFor="gallery-state-select">Select State:</label>
                  <select
                    id="gallery-state-select"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedTerritory(''); // Clear territory when state is selected
                      setSelectedGalleryDistrict(''); // Clear district selection
                    }}
                    required
                  >
                    <option value="">-- Select State --</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div className="select-wrapper" style={{ flex: '1' }}>
                  <label htmlFor="gallery-territory-select">Select Territory:</label>
                  <select
                    id="gallery-territory-select"
                    value={selectedTerritory}
                    onChange={(e) => {
                      setSelectedTerritory(e.target.value);
                      setSelectedState(''); // Clear state when territory is selected
                      setSelectedGalleryDistrict(''); // Clear district selection
                    }}
                    style={{ width: '100%' }}
                  >
                    <option value="">-- Select Territory --</option>
                    {territories && territories.length > 0 ? territories.map((territory) => (
                      <option key={territory.id} value={territory.id}>
                        {territory.title} {territory.capital ? `(${territory.capital})` : ''}
                      </option>
                    )) : null}
                  </select>
                </div>
              </div>

              {/* Show district dropdown only if either state or territory is selected */}
              {(selectedState || selectedTerritory) && (
                <div className="select-wrapper" style={{ marginTop: '15px' }}>
                  <label htmlFor="gallery-district">Select District:</label>
                  <select
                    id="gallery-district"
                    value={selectedGalleryDistrict}
                    onChange={e => setSelectedGalleryDistrict(e.target.value)}
                  >
                    <option value="">-- Select District --</option>
                    {/* Show districts based on selection */}
                    {selectedState ? (
                      // Show state districts
                      districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                      ))
                    ) : (
                      // Show territory districts
                      territoryDistricts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>
            {selectedGalleryDistrict && (
              <div className="gallery-management-ui">
                <div className="gallery-header-row">
                  <button className="add-btn" onClick={handleGalleryAddImageClick}>
                    Add New Image
                  </button>
                </div>
                {showAddImage && (
                  <div className="add-image-modal-bg glassy-blur">
                    <div className="add-image-modal-card modern-modal-card">
                      <button type="button" className="close-modal-btn circle-btn" onClick={() => setShowAddImage(false)}>&times;</button>
                      <div className="add-image-modal-content">
                        <div className="add-image-modal-left">
                          <label htmlFor="image-upload-input" className="drag-drop-area" style={{
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            padding: '20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#f8f9fa'
                          }}>
                            <div className="drag-drop-icon" style={{ fontSize: '2em', marginBottom: '10px' }}>📷</div>
                            <div className="drag-drop-text" style={{ fontSize: '1.1em', color: '#666' }}>Drag & drop or click to select image</div>
                            <div className="drag-drop-note" style={{ fontSize: '0.9em', color: '#999', marginTop: '5px' }}>JPG, PNG, WebP. Max 5MB.</div>
                            <input 
                              id="image-upload-input" 
                              type="file" 
                              accept="image/*" 
                              onChange={handleGalleryImageFileChange} 
                              style={{ display: 'none' }} 
                            />
                          </label>
                          {newImagePreview && (
                            <div className="image-preview-container" style={{
                              marginTop: '20px',
                              position: 'relative',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              backgroundColor: '#fff',
                              padding: '10px'
                            }}>
                              <div style={{
                                position: 'relative',
                                width: '100%',
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <img 
                                  src={newImagePreview} 
                                  alt="Preview" 
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                  }} 
                                />
                                <div style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(0,0,0,0.5)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.3s ease',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                onClick={() => {
                                  setNewImageFile(null);
                                  setNewImagePreview(null);
                                }}
                                >
                                  <button 
                                    type="button" 
                                    style={{
                                      backgroundColor: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '8px 16px',
                                      color: '#ff4444',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#ff4444';
                                      e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fff';
                                      e.currentTarget.style.color = '#ff4444';
                                    }}
                                  >
                                    <span style={{ fontSize: '1.2em' }}>🗑️</span>
                                    Remove Image
                                  </button>
                                </div>
                              </div>
                              <div style={{
                                marginTop: '10px',
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                fontSize: '0.9em',
                                color: '#666',
                                textAlign: 'center'
                              }}>
                                Click on the image to remove it
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="add-image-modal-divider"></div>
                        <form className="add-image-form" onSubmit={handleUploadImage} style={{ padding: '20px' }}>
                          <div className="form-section" style={{ marginBottom: '20px' }}>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              color: '#333',
                              fontWeight: '500'
                            }}>Caption</label>
                            <textarea
                              value={newImageCaption}
                              onChange={e => setNewImageCaption(e.target.value)}
                              maxLength={120}
                              placeholder="Enter image caption or location"
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                backgroundColor: '#fff',
                                color: '#000',
                                minHeight: '80px',
                                resize: 'vertical'
                              }}
                            />
                            <small style={{ color: '#666', fontSize: '0.85em' }}>Short description or location (optional)</small>
                          </div>
                          
                          <div className="form-section" style={{ marginBottom: '20px' }}>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              color: '#333',
                              fontWeight: '500'
                            }}>Alt Text <span style={{ color: '#ff4444' }}>*</span></label>
                            <textarea
                              value={newImageAlt}
                              onChange={e => setNewImageAlt(e.target.value)}
                              maxLength={120}
                              placeholder="Enter alt text for accessibility"
                              required
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                backgroundColor: '#fff',
                                color: '#000',
                                minHeight: '80px',
                                resize: 'vertical'
                              }}
                            />
                            <small style={{ color: '#666', fontSize: '0.85em' }}>For accessibility & SEO. Be specific!</small>
                          </div>

                          {galleryError && (
                            <div style={{ 
                              color: '#ff4444', 
                              backgroundColor: '#ffe6e6', 
                              padding: '10px', 
                              borderRadius: '4px',
                              marginBottom: '15px'
                            }}>
                              {galleryError}
                            </div>
                          )}

                          {galleryUploading && (
                            <div style={{
                              width: '100%',
                              height: '4px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '2px',
                              marginBottom: '15px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#4CAF50',
                                animation: 'uploading 1s infinite linear'
                              }}></div>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                              type="button" 
                              onClick={() => setShowAddImage(false)}
                              style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                color: '#666',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              disabled={galleryUploading || !newImageFile}
                              style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: newImageFile ? '#4CAF50' : '#ccc',
                                color: '#fff',
                                cursor: newImageFile ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {galleryUploading ? (
                                'Uploading...'
                              ) : (
                                <>
                                  <span style={{ fontSize: '1.2em' }}>+</span>
                                  Upload Image
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
                {galleryLoading ? (
                  <div className="loading">Loading images...</div>
                ) : (
                  <div className="gallery-images-grid">
                    {galleryImages.length === 0 ? (
                      <div className="gallery-management-placeholder">No images found for this district.</div>
                    ) : (
                      galleryImages.map(img => (
                        <div key={img.id} className="gallery-image-card">
                          <div className="gallery-image-wrapper">
                            <img 
                              src={img.image_url.startsWith('http') ? 
                                img.image_url : 
                                `http://localhost:5000/${img.image_url.replace(/^\/+/, '')}`} 
                              alt={img.alt_text || img.caption || 'District Image'} 
                              className="gallery-image" 
                            />
                          </div>
                          <button className="delete-btn" onClick={() => handleGalleryDeleteImage(img.id)}>Delete</button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === TABS.WEB_STORIES && (
          <div className="interactive-gallery-tab">
            <div className="stories-list">
              <div className="selection-sections">
                {/* State Section - Unchanged */}
                <div className="state-section">
                  <h3>Select by State</h3>
                  <div className="state-select-section">
                    <label>Select State:</label>
                    <select
                      value={selectedState}
                      onChange={e => {
                        setSelectedState(e.target.value);
                        setSelectedDistrict(''); // Reset district selection when state changes
                        setSelectedTerritory(''); // Clear territory selection
                      }}
                      required
                    >
                      <option value="">-- Select State --</option>
                      {states.map(state => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedState && (
                    <div className="district-select-section">
                      <label>Select District:</label>
                      <select
                        value={selectedDistrict}
                        onChange={e => setSelectedDistrict(e.target.value)}
                        required
                      >
                        <option value="">-- Select District --</option>
                        {districts
                          .filter(d => {
                            const selectedStateData = states.find(state => state.id === parseInt(selectedState));
                            return d.state_name === selectedStateData?.name;
                          })
                          .map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Territory Section */}
                <div className="territory-section">
                  <h3>Select by Territory</h3>
                  <div className="territory-select-section">
                    <label>Select Territory:</label>
                    <select
                      value={selectedTerritory}
                      onChange={e => {
                        setSelectedTerritory(e.target.value);
                        setSelectedDistrict(''); // Reset district selection when territory changes
                        setSelectedState(''); // Clear state selection
                      }}
                      required
                    >
                      <option value="">-- Select Territory --</option>
                      {territories.map(territory => (
                        <option key={territory.id} value={territory.id}>
                          {territory.title} {territory.capital ? `(${territory.capital})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTerritory && (
                    <div className="district-select-section">
                      <label>Select District:</label>
                      <select
                        value={selectedDistrict}
                        onChange={e => setSelectedDistrict(e.target.value)}
                        required
                      >
                        <option value="">-- Select District --</option>
                        {territoryDistricts
                          .filter(d => d.territory_id === parseInt(selectedTerritory))
                          .map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Button - Show for both State and Territory */}
              {(selectedDistrict && (selectedState || selectedTerritory)) && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button className="add-btn-story" onClick={() => {
                    setEditingWebStory(null);
                    setWebStoryForm({
                      title: '', slug: '', images: [], featured_image: null, featured_image_preview: null,
                      meta_title: '', meta_description: '', meta_keywords: [], meta_keyword_input: ''
                    });
                    setShowWebStoryModal(true);
                  }}>
                    + Add Web Story
                  </button>
                  <button 
                    className="upload-logo-btn"
                    onClick={() => setShowLogoModal(true)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span style={{ fontSize: '1.2em' }}>🖼️</span>
                    Upload Logo
                  </button>
                </div>
              )}

              {/* Web Stories Table */}
              {selectedDistrict && (selectedState || selectedTerritory) && (
                <>
                  {webStoriesLoading ? (
                    <div className="loading">Loading stories...</div>
                  ) : (
                    <div className="stories-tables-container">
                      {/* Show stories based on selection type */}
                      <div className="stories-section">
                        <h3>{selectedState ? 'State District Stories' : 'Territory District Stories'}</h3>
                        <table className="stories-table">
                          <thead>
                            <tr>
                              <th>Thumbnail</th>
                              <th>Title</th>
                              <th>District</th>
                              <th>Slug</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {webStories
                              .filter(story => story.district_id === parseInt(selectedDistrict))
                              .map(story => (
                                <tr key={story.id}>
                                  <td>
                                    {story.featured_image ? (
                                      <img 
                                        src={story.featured_image.startsWith('http') 
                                          ? story.featured_image 
                                          : `http://localhost:5000/${story.featured_image.replace(/^\/+/, '')}`}
                                        alt="thumb" 
                                        className="thumb"
                                        style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <span style={{color:'#aaa'}}>No Image</span>
                                    )}
                                  </td>
                                  <td>{story.title}</td>
                                  <td>{story.district_name}</td>
                                  <td>{story.slug}</td>
                                  <td>
                                    <button onClick={() => handleEditWebStory(story)}>Edit</button>
                                    <button onClick={() => handleDeleteWebStory(story.id)}>Delete</button>
                                    <button onClick={() => {
                                      setAnalyticsStory(story);
                                      setShowAnalyticsModal(true);
                                    }}>Analytics</button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === TABS.SEASONS && (
          <div className="seasons-tab">
            <div className="district-select">
              <div className="state-select-row" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                {!selectedTerritory && (
                  <div className="select-wrapper" style={{ flex: '1' }}>
                    <label htmlFor="seasons-state-select">Select State:</label>
                    <select
                      id="seasons-state-select"
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setSelectedTerritory(''); // Clear territory when state is selected
                        setSelectedSeasonDistrict(''); // Clear district selection
                      }}
                      required
                    >
                      <option value="">-- Select State --</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {!selectedState && (
                  <div className="select-wrapper" style={{ flex: '1' }}>
                    <label htmlFor="seasons-territory-select">Select Territory:</label>
                    <select
                      id="seasons-territory-select"
                      value={selectedTerritory}
                      onChange={(e) => {
                        setSelectedTerritory(e.target.value);
                        setSelectedState(''); // Clear state when territory is selected
                        setSelectedSeasonDistrict(''); // Clear district selection
                      }}
                    >
                      <option value="">-- Select Territory --</option>
                      {territories && territories.length > 0 ? territories.map((territory) => (
                        <option key={territory.id} value={territory.id}>
                          {territory.title} {territory.capital ? `(${territory.capital})` : ''}
                        </option>
                      )) : null}
                    </select>
                  </div>
                )}
              </div>

              {(selectedState || selectedTerritory) && (
                <div className="select-wrapper" style={{ marginTop: '15px' }}>
                  <label htmlFor="season-district-select">Select District:</label>
                  <select
                    id="season-district-select"
                    value={selectedSeasonDistrict}
                    onChange={handleSeasonDistrictChange}
                  >
                    <option value="">-- Select District --</option>
                    {selectedState ? (
                      // Show state districts
                      districts.map((district) => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))
                    ) : (
                      // Show territory districts
                      territoryDistricts.map((district) => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>

            {selectedSeasonDistrict && districtSeasons.length > 0 && (
              <div className="seasons-container">
                <div className="season-tabs-container">
                  {districtSeasons.map((season) => (
                    <button
                      key={season.id}
                      className={`season-tab-button ${selectedSeason?.id === season.id ? 'active' : ''}`}
                      onClick={() => setSelectedSeason(season)}
                    >
                      {season.season_name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {selectedSeason && (
                  <div className="season-content-container">
                    <div className="season-header-row">
                      <h3>{selectedSeason.season_name}</h3>
                      <button 
                        className="season-add-image-btn"
                        onClick={() => handleSeasonAddImageClick(selectedSeason)}
                      >
                        <span>+</span> Add New Image
                      </button>
                    </div>

                    <div className="season-images-grid">
                      {seasonImages[selectedSeason.id]?.length > 0 ? (
                        seasonImages[selectedSeason.id].map((image) => {
                          // Process image URL
                          let imageUrl = image.image_url;
                          if (!imageUrl.startsWith('http')) {
                            imageUrl = imageUrl.replace(/^\/+/, '');
                            imageUrl = `http://localhost:5000/${imageUrl}`;
                          }

                          return (
                            <div key={image.id} className="season-image-card">
                              <div className="season-image-wrapper">
                                <img 
                                  src={imageUrl}
                                  alt={image.alt_text || selectedSeason.season_name}
                                  className="season-image"
                                  style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '8px 8px 0 0'
                                  }}
                                  onError={(e) => {
                                    console.error('Image failed to load:', {
                                      src: e.target.src,
                                      originalUrl: image.image_url,
                                      processedUrl: imageUrl,
                                      season: selectedSeason.season_name,
                                      imageId: image.id
                                    });
                                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                                  }}
                                />
                              </div>
                              <div className="season-image-info">
                                <div className="season-image-location">
                                  {image.location || 'No location specified'}
                                </div>
                                <div className="season-image-alt">
                                  {image.alt_text || 'No description available'}
                                </div>
                              </div>
                              <div className="season-image-actions">
                                <button 
                                  className="edit-btn"
                                  onClick={() => handleEditSeasonImage(image)}
                                >
                                  <span>✏️</span> Edit
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this image?')) {
                                      handleSeasonDeleteImage(selectedSeason.id, image.id);
                                    }
                                  }}
                                >
                                  <span>🗑️</span> Delete
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="no-images">
                          <div className="no-images-icon">📷</div>
                          <p>No images available for this season yet.</p>
                          <button 
                            className="season-add-image-btn"
                            onClick={() => handleSeasonAddImageClick(selectedSeason)}
                          >
                            Add Your First Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedSeasonDistrict && districtSeasons.length === 0 && (
              <div className="no-seasons">No seasons found for this district.</div>
            )}
          </div>
        )}

        {activeTab === TABS.ABOUT && (
          <div className="interactive-gallery-tab">
            <div className="gallery-district-select">
              <div className="state-select-row" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                {!selectedTerritory && (
                  <div className="select-wrapper" style={{ flex: '1' }}>
                  <label htmlFor="about-state-select">Select State:</label>
                  <select
                    id="about-state-select"
                    value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setSelectedDistrict('');
                      }}
                    required
                  >
                    <option value="">-- Select State --</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                </div>
                )}
                {!selectedState && (
                  <div className="select-wrapper" style={{ flex: '1' }}>
                    <label htmlFor="about-territory-select">Select Territory:</label>
                    <select
                      id="about-territory-select"
                      value={selectedTerritory}
                      onChange={(e) => {
                        setSelectedTerritory(e.target.value);
                        setSelectedDistrict('');
                      }}
                    >
                      <option value="">-- Select Territory --</option>
                      {territories && territories.length > 0 ? territories.map((territory) => (
                        <option key={territory.id} value={territory.id}>
                          {territory.title} {territory.capital ? `(${territory.capital})` : ''}
                        </option>
                      )) : null}
                    </select>
                  </div>
                )}
              </div>

              {(selectedState || selectedTerritory) && (
                <div className="select-wrapper" style={{ marginTop: '15px' }}>
                  <label htmlFor="about-district">Select District:</label>
                  <select
                    id="about-district"
                    value={selectedDistrict}
                    onChange={handleAboutDistrictChange}
                  >
                    <option value="">-- Select District --</option>
                    {selectedState ? (
                      districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                      ))
                    ) : (
                      territoryDistricts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>

            {selectedDistrict && (
              <div className="about-form-section">
                <form className="about-form" onSubmit={handleAboutFormSubmit}>
                  <div className="form-section">
                    <h3>District Statistics</h3>
                    <div className="statistics-grid">
                      <div className="stat-field">
                        <label>Population:</label>
                        <input
                          type="number"
                          value={districtFormData.population || ''}
                          onChange={(e) => setDistrictFormData(prev => ({
                            ...prev,
                            population: e.target.value
                          }))}
                          placeholder="Total population"
                        />
                      </div>

                      <div className="stat-field">
                        <label>Males:</label>
                        <input
                          type="number"
                          value={districtFormData.males || ''}
                          onChange={(e) => setDistrictFormData(prev => ({
                            ...prev,
                            males: e.target.value
                          }))}
                          placeholder="Male population"
                        />
                      </div>

                      <div className="stat-field">
                        <label>Females:</label>
                        <input
                          type="number"
                          value={districtFormData.females || ''}
                          onChange={(e) => setDistrictFormData(prev => ({
                            ...prev,
                            females: e.target.value
                          }))}
                          placeholder="Female population"
                        />
                      </div>

                      <div className="stat-field">
                        <label>Literacy (%):</label>
                        <input
                          type="number"
                          value={districtFormData.literacy || ''}
                          onChange={(e) => setDistrictFormData(prev => ({
                            ...prev,
                            literacy: e.target.value
                          }))}
                          placeholder="Literacy rate"
                        />
                      </div>

                      <div className="stat-field">
                        <label>Households:</label>
                        <input
                          type="number"
                          value={districtFormData.households || ''}
                          onChange={(e) => setDistrictFormData(prev => ({
                            ...prev,
                            households: e.target.value
                          }))}
                          placeholder="Total households"
                        />
                      </div>

                      <div className="stat-field">
                        <label>Adults:</label>
                        <input
                          type="number"
                          value={districtFormData.adults || ''}
                          onChange={(e) => setDistrictFormData(prev => ({
                            ...prev,
                            adults: e.target.value
                          }))}
                          placeholder="Adult population"
                        />
                      </div>

                      <div className="stat-field">
                        <label>Children:</label>
                        <input
                          type="number"
                          value={districtFormData.children || ''}
                          onChange={(e) => setDistrictFormData(prev => ({
                            ...prev,
                            children: e.target.value
                          }))}
                          placeholder="Children population"
                        />
                      </div>

                      <div className="stat-field">
                        <label>Old:</label>
                        <input
                          type="number"
                          value={districtFormData.old || ''}
                          onChange={(e) => setDistrictFormData(prev => ({
                            ...prev,
                            old: e.target.value
                          }))}
                          placeholder="Elderly population"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {showWebStoryModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingWebStory ? 'Edit Web Story' : 'Add New Story'}</h2>
            <form onSubmit={editingWebStory ? handleUpdateWebStory : handleWebStorySubmit}>
              <div className="form-section">
                <label>Title</label>
                <input
                  type="text"
                  value={webStoryForm.title}
                  onChange={e => {
                    const val = e.target.value;
                    setWebStoryForm(f => ({ 
                      ...f, 
                      title: val, 
                      slug: generateSlug(val).slice(0, 60) 
                    }));
                  }}
                  required
                />
              </div>
              <div className="form-section">
                <label>Slug (max 60 chars)</label>
                <input
                  type="text"
                  value={webStoryForm.slug}
                  maxLength={60}
                  onChange={e => setWebStoryForm(f => ({ ...f, slug: e.target.value.slice(0, 60) }))}
                  required
                />
              </div>

              <div className="form-section">
                <label>Featured Image (card only)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setWebStoryForm(f => ({ ...f, featured_image: file, featured_image_preview: URL.createObjectURL(file) }));
                    }
                  }}
                />
                {webStoryForm.featured_image_preview && (
                  <img 
                    src={webStoryForm.featured_image_preview} 
                    alt="preview" 
                    className="thumb"
                    style={{ width: '100px', height: '60px', objectFit: 'cover', marginTop: '10px' }}
                  />
                )}
              </div>

              <div className="form-section">
                <label>Story Images</label>
                {renderImageFields()}
                <button type="button" onClick={addImageField}>
                  Add Image
                </button>
              </div>

              <div className="form-section">
                <label>Meta Title (50-60 chars, required)</label>
                <input
                  type="text"
                  value={webStoryForm.meta_title}
                  minLength={50}
                  maxLength={60}
                  required
                  onChange={e => setWebStoryForm(f => ({ ...f, meta_title: e.target.value }))}
                  onPaste={e => {
                    if (metaTitlePasteCount < 5) {
                      e.preventDefault();
                      setMetaTitlePasteCount(c => c + 1);
                      setMetaTitleWarning('Pasting is not allowed in Meta Title.');
                    } else {
                      setMetaTitleWarning('');
                    }
                  }}
                />
                {metaTitleWarning && <div className="error">{metaTitleWarning}</div>}
              </div>

              <div className="form-section">
                <label>Meta Description (150-160 chars, required)</label>
                <textarea
                  value={webStoryForm.meta_description}
                  minLength={150}
                  maxLength={160}
                  required
                  onChange={e => setWebStoryForm(f => ({ ...f, meta_description: e.target.value }))}
                  onPaste={e => {
                    if (metaDescPasteCount < 5) {
                      e.preventDefault();
                      setMetaDescPasteCount(c => c + 1);
                      setMetaDescWarning('Pasting is not allowed in Meta Description.');
                    } else {
                      setMetaDescWarning('');
                    }
                  }}
                />
                {metaDescWarning && <div className="error">{metaDescWarning}</div>}
              </div>

              <div className="form-section">
                <label>Meta Keywords (min 8, comma/enter to add, required)</label>
                <input
                  type="text"
                  value={webStoryForm.meta_keyword_input}
                  onChange={e => setWebStoryForm(f => ({ ...f, meta_keyword_input: e.target.value }))}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ',') && webStoryForm.meta_keyword_input.trim()) {
                      e.preventDefault();
                      if (webStoryForm.meta_keywords.length < 20) {
                        setWebStoryForm(f => ({
                          ...f,
                          meta_keywords: [...f.meta_keywords, f.meta_keyword_input.trim()],
                          meta_keyword_input: ''
                        }));
                      }
                    }
                  }}
                  onPaste={e => {
                    if (metaKeywordsPasteCount < 5) {
                      e.preventDefault();
                      setMetaKeywordsPasteCount(c => c + 1);
                      setMetaKeywordsWarning('Pasting is not allowed in Meta Keywords.');
                    } else {
                      setMetaKeywordsWarning('');
                    }
                  }}
                />
                <div className="keywords-list">
                  {webStoryForm.meta_keywords.map((kw, i) => (
                    <span key={i} className="keyword-chip">
                      {kw}
                      <button type="button" onClick={() => {
                        setWebStoryForm(f => ({
                          ...f,
                          meta_keywords: f.meta_keywords.filter((_, idx) => idx !== i)
                        }));
                      }}>x</button>
                    </span>
                  ))}
                </div>
                {metaKeywordsWarning && <div className="error">{metaKeywordsWarning}</div>}
                <div className="hint">Minimum 8 keywords required. Current count: {webStoryForm.meta_keywords.length}</div>
              </div>

              <div className="form-section">
                <button type="submit" disabled={webStoryForm.meta_keywords.length < 8}>
                  {editingWebStory ? 'Update' : 'Create'} Story
                </button>
                <button type="button" onClick={() => setShowWebStoryModal(false)}>Cancel</button>
              </div>

              {/* Add Schema Preview Section */}
              <div className="form-section">
                <h3>Schema Preview</h3>
                <div className="schema-preview">
                  {webStoryForm.schema ? (
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '15px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}>
                      {JSON.stringify(webStoryForm.schema, null, 2)}
                    </pre>
                  ) : (
                    <div className="schema-loading">
                      Schema will be generated when story is saved
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAnalyticsModal && analyticsStory && (
        <div className="modal">
          <div className="modal-content">
            <h2>Analytics for: {analyticsStory.title}</h2>
            <div className="analytics-section">
              <div>Views: {analyticsStory.views || 0}</div>
              <div>Likes: {analyticsStory.likes || 0}</div>
              <div>Shares: {analyticsStory.shares || 0}</div>
              <div>Comments:</div>
              <ul>
                {(analyticsStory.comments || []).map((c, i) => (
                  <li key={i}>
                    {c.text}
                    <button onClick={() => {/* TODO: Delete comment handler */}}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => setShowAnalyticsModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showAddImageModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Image for {selectedSeason.name}</h2>
            <form onSubmit={handleSeasonImageUpload}>
              <div className="form-section">
                <label>Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSeasonImageFileChange}
                  required
                />
                {newImageData.preview && (
                  <img
                    src={newImageData.preview}
                    alt="Preview"
                    className="img-preview"
                  />
                )}
              </div>
              <div className="form-section">
                <label>Location:</label>
                <input
                  type="text"
                  value={newImageData.location}
                  onChange={(e) => setNewImageData(prev => ({
                    ...prev,
                    location: e.target.value
                  }))}
                  required
                />
              </div>
              <div className="form-section">
                <label>Alt Text:</label>
                <input
                  type="text"
                  value={newImageData.alt_text}
                  onChange={(e) => setNewImageData(prev => ({
                    ...prev,
                    alt_text: e.target.value
                  }))}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">Upload Image</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddImageModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSeasonImageModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedSeasonImage ? 'Edit Image' : 'Add New Image'}</h3>
              <button className="close-btn" onClick={() => setShowSeasonImageModal(false)}>&times;</button>
            </div>
            <form onSubmit={selectedSeasonImage ? handleUpdateSeasonImage : handleSeasonImageUpload}>
              <div className="form-section">
                <label>Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSeasonImageFileChange}
                  required={!selectedSeasonImage}
                />
                {newImageData.preview && (
                  <div className="image-preview">
                    <img src={newImageData.preview} alt="Preview" />
                  </div>
                )}
              </div>
              <div className="form-section">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={newImageData.location}
                  onChange={handleSeasonImageInputChange}
                  placeholder="Enter location"
                  required
                />
              </div>
              <div className="form-section">
                <label>Alt Text:</label>
                <input
                  type="text"
                  name="alt_text"
                  value={newImageData.alt_text}
                  onChange={handleSeasonImageInputChange}
                  placeholder="Enter alt text"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {selectedSeasonImage ? 'Update Image' : 'Upload Image'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowSeasonImageModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTerritoryForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditingTerritory ? 'Edit Territory' : 'Add New Territory'}</h2>
            <form onSubmit={handleTerritoryFormSubmit}>
              <div className="form-section">
                <label>Title:</label>
                <input
                  type="text"
                  value={territoryFormData.title}
                  onChange={(e) => setTerritoryFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                  }))}
                  required
                />
              </div>

              <div className="form-section">
                <label>Slug:</label>
                <input
                  type="text"
                  value={territoryFormData.slug}
                  onChange={(e) => setTerritoryFormData(prev => ({
                    ...prev,  
                    slug: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-section">
                <label>Capital:</label>
                <input
                  type="text"
                  value={territoryFormData.capital}
                  onChange={(e) => setTerritoryFormData(prev => ({
                    ...prev,
                    capital: e.target.value
                  }))}
                />
              </div>

              <div className="form-section">
                <label>Famous For:</label>
                <textarea
                  value={territoryFormData.famous_for}
                  onChange={(e) => setTerritoryFormData(prev => ({
                    ...prev,
                    famous_for: e.target.value
                  }))}
                  rows="4"
                />
              </div>

              <div className="form-section">
                <label>Preview Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTerritoryFormData(prev => ({
                    ...prev,
                    preview_image: e.target.files[0]
                  }))}
                />
              </div>

              <div className="form-section">
                <label>Meta Title:</label>
                <input
                  type="text"
                  value={territoryFormData.meta_title}
                  onChange={(e) => setTerritoryFormData(prev => ({
                    ...prev,
                    meta_title: e.target.value
                  }))}
                />
              </div>

              <div className="form-section">
                <label>Meta Description:</label>
                <textarea
                  value={territoryFormData.meta_description}
                  onChange={(e) => setTerritoryFormData(prev => ({
                    ...prev,
                    meta_description: e.target.value
                  }))}
                  rows="3"
                />
              </div>

              <div className="form-section">
                <label>Meta Keywords:</label>
                <input
                  type="text"
                  value={territoryFormData.meta_keywords} 
                  onChange={(e) => setTerritoryFormData(prev => ({
                    ...prev,
                    meta_keywords: e.target.value
                  }))}
                  placeholder="Comma separated keywords"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {isEditingTerritory ? 'Update Territory' : 'Create Territory'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowTerritoryForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogoModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2>Upload Logo</h2>
            <form onSubmit={handleLogoUpload}>
              <div className="form-section">
                <label>Select Logo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  style={{ marginBottom: '10px' }}
                />
                {logoError && (
                  <div style={{ color: 'red', marginBottom: '10px' }}>
                    {logoError}
                  </div>
                )}
                {logoPreview && (
                  <div style={{ marginBottom: '15px' }}>
                    <p>Preview:</p>
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px',
                        border: '1px solid #ddd',
                        padding: '5px'
                      }} 
                    />
                  </div>
                )}
                <div style={{ marginTop: '20px' }}>
                  <button 
                    type="submit" 
                    disabled={logoUploading}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: logoUploading ? 'not-allowed' : 'pointer',
                      opacity: logoUploading ? 0.7 : 1
                    }}
                  >
                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowLogoModal(false);
                      setLogoFile(null);
                      setLogoPreview(null);
                      setLogoError(null);
                    }}
                    style={{
                      marginLeft: '10px',
                      padding: '8px 20px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDistricts;