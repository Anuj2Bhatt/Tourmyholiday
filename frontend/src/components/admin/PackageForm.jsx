import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './PackageForm.css';
import ManageItinerary from './ManageItinerary';
import HotelSelector from './HotelSelector';

const PackageForm = ({
  formData,
  setFormData,
  handleChange,
  handleImageChange,
  handlePdfChange,
  handleEditorChange,
  handleStatusToggle,
  handleStateChange,
  handleFeaturedImageChange,
  removeImage,
  removePdf,
  removeFeaturedImage,
  states,
  districts,
  editingPackage,
  categories
}) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [activeDetailsTab, setActiveDetailsTab] = useState('description');
  const [showTooltip, setShowTooltip] = useState(null);
  const [sectionCompletion, setSectionCompletion] = useState({
    basic: false,
    location: false,
    images: false,
    details: false,
    additional: false,
    seo: false
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('Summer');
  const [seasonImages, setSeasonImages] = useState({
    Summer: [],
    Monsoon: [],
    Autumn: [],
    Winter: [],
    Spring: []
  });

  const [editingSeasonImage, setEditingSeasonImage] = useState(null);
  const [showImageForm, setShowImageForm] = useState(false);
  const [newImageData, setNewImageData] = useState({
    file: null,
    altText: '',
    description: ''
  });

  const [seasonData, setSeasonData] = useState({
    Summer: { season_description: '', best_time_to_visit: '', weather_conditions: '', special_attractions: '', is_active: true },
    Monsoon: { season_description: '', best_time_to_visit: '', weather_conditions: '', special_attractions: '', is_active: true },
    Autumn: { season_description: '', best_time_to_visit: '', weather_conditions: '', special_attractions: '', is_active: true },
    Winter: { season_description: '', best_time_to_visit: '', weather_conditions: '', special_attractions: '', is_active: true },
    Spring: { season_description: '', best_time_to_visit: '', weather_conditions: '', special_attractions: '', is_active: true }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [packageImagePreviews, setPackageImagePreviews] = useState([null, null, null, null, null]);

  const sections = [
    { id: 'basic', label: 'Basic Information', icon: '📝' },
    { id: 'location', label: 'Location Details', icon: '📍' },
    { id: 'images', label: 'Package Images', icon: '🖼️' },
    { id: 'season-images', label: 'Season Images', icon: '🌤️' },
    { id: 'details', label: 'Package Details', icon: '📋' },
    { id: 'additional', label: 'Additional Info', icon: '➕' },
    { id: 'seo', label: 'SEO Information', icon: '🔍' }
  ];

  const seasons = ['Summer', 'Monsoon', 'Autumn', 'Winter', 'Spring'];

  const packageImageInputRefs = useRef([...Array(5)].map(() => React.createRef()));

  // Check section completion
  useEffect(() => {
    const checkBasicCompletion = () => {
      return formData.package_name && formData.price && formData.featured_image;
    };

    const checkLocationCompletion = () => {
      return formData.state_id;
    };

    const checkImagesCompletion = () => {
      return formData.image1 && formData.image2;
    };

    const checkDetailsCompletion = () => {
      return formData.description && formData.hotels && formData.sightseeing;
    };

    const checkAdditionalCompletion = () => {
      return formData.inclusion && formData.exclusion;
    };

    const checkSeoCompletion = () => {
      return formData.meta_title && formData.meta_description;
    };

    setSectionCompletion({
      basic: checkBasicCompletion(),
      location: checkLocationCompletion(),
      images: checkImagesCompletion(),
      details: checkDetailsCompletion(),
      additional: checkAdditionalCompletion(),
      seo: checkSeoCompletion()
    });
  }, [formData]);

  // Slug generation utility
  const createSlug = (value) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 60);
  };

  // Update slug when package_name changes, unless user has edited slug
  useEffect(() => {
    if (!slugEdited) {
      setFormData(prev => ({
        ...prev,
        slug: createSlug(formData.package_name || '')
      }));
    }
    // eslint-disable-next-line
  }, [formData.package_name]);

  // Slug input change handler
  const handleSlugChange = (e) => {
    const value = e.target.value.substring(0, 60);
    setSlugEdited(true);
    setFormData(prev => ({ ...prev, slug: value }));
  };

  const handleItinerarySave = (days) => {
    // Ensure days is an array and each day has the required properties
    const formattedDays = days.map(day => ({
      dayNumber: parseInt(day.dayNumber),
      title: day.title || '',
      description: day.description || ''
    }));
    
    setFormData(prev => ({
      ...prev,
      itinerary: formattedDays
    }));
  };

  // Utility to check if a string is valid JSON array
  function isJsonString(str) {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed);
    } catch (e) {
      return false;
    }
  }

  // Utility to convert HTML <ul><li>...</li></ul> to JSON array for hotels
  function htmlHotelsToJson(html) {
    if (!html) return [];
    const matches = [...html.matchAll(/<li>(.*?)<\/li>/g)];
    return matches.map(m => ({
      title: m[1].replace(/\.+$/, '').trim(),
      images: [],
      description: "",
      contact: "",
      location: ""
    }));
  }

  const handleSeasonImageChange = (season, files) => {
    // Convert files to objects with additional metadata
    const processedFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      altText: '',
      description: '',
      preview: URL.createObjectURL(file)
    }));

    setSeasonImages(prev => ({
      ...prev,
      [season]: [...prev[season], ...processedFiles]
    }));
    
    // Update formData with the new season images
    setFormData(prev => ({
      ...prev,
      [`${season.toLowerCase()}_images`]: [...prev[season.toLowerCase() + '_images'] || [], ...processedFiles]
    }));
  };

  const handleEditSeasonImage = (season, imageId) => {
    const image = seasonImages[season].find(img => img.id === imageId);
    if (image) {
      setEditingSeasonImage(imageId);
      setNewImageData({
        file: image.file,
        altText: image.altText || '',
        description: image.description || ''
      });
      setShowImageForm(true);
    }
  };

  const handleDeleteSeasonImage = async (season, imageId) => {
    if (!editingPackage?.id) return;

    try {
      setLoading(true);
      console.log('Deleting image:', { packageId: editingPackage.id, season, imageId });
      
      const response = await fetch(
        `http://localhost:5000/api/package-seasons/${editingPackage.id}/seasons/${season}/images/${imageId}`,
        {
          method: 'DELETE'
        }
      );

      console.log('Delete response status:', response.status);
      const responseData = await response.json();
      console.log('Delete response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete season image');
      }

      // Update local state
      setSeasonImages(prev => ({
        ...prev,
        [season]: prev[season].filter(img => img.id !== imageId)
      }));
      
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error deleting season image:', err);
      setError(err.message || 'Failed to delete season image');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeasonImage = async (season) => {
    if (!editingPackage?.id) return;

    try {
      setLoading(true);
      const formData = new FormData();
      
      if (editingSeasonImage) {
        // Update existing image
        const image = seasonImages[season].find(img => img.id === editingSeasonImage);
        if (image) {
          formData.append('id', image.id);
          formData.append('package_id', editingPackage.id);
          formData.append('season', season);
          formData.append('alt_text', newImageData.altText);
          formData.append('description', newImageData.description);
          if (newImageData.file) {
            formData.append('image', newImageData.file);
          }

          const response = await fetch(
            `http://localhost:5000/api/package-seasons/${editingPackage.id}/seasons/${season}/images/${image.id}`,
            {
              method: 'PUT',
              body: formData
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update season image');
          }
          const data = await response.json();

          // Update local state
          setSeasonImages(prev => ({
            ...prev,
            [season]: prev[season].map(img => 
              img.id === editingSeasonImage 
                ? { ...img, ...data.image, preview: data.image.image_path }
                : img
            )
          }));
        }
      } else {
        // Add new image
        if (!newImageData.file) throw new Error('Image file is required');
        
        // Create new FormData instance
        const formData = new FormData();
        
        // Append all fields
        formData.append('package_id', editingPackage.id);
        formData.append('season', season);
        formData.append('image', newImageData.file);
        formData.append('alt_text', newImageData.altText || '');
        formData.append('description', newImageData.description || '');

        console.log('Sending request to upload image...');
        console.log('Form data contents:', {
          package_id: editingPackage.id,
          season: season,
          file: newImageData.file.name,
          alt_text: newImageData.altText,
          description: newImageData.description
        });

        const response = await fetch(
          `http://localhost:5000/api/package-seasons/${editingPackage.id}/seasons/${season}/images`,
          {
            method: 'POST',
            // Don't set Content-Type header, let the browser set it with the boundary
            body: formData
          }
        );

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to save season image');
        }

        if (!responseData.success) {
          throw new Error(responseData.message || 'Failed to save season image');
        }

        // Update local state with the new image
        setSeasonImages(prev => ({
          ...prev,
          [season]: [...prev[season], { 
            ...responseData.image,
            preview: `http://localhost:5000/${responseData.image.image_path}`
          }]
        }));
      }

      // Reset form
      setShowImageForm(false);
      setEditingSeasonImage(null);
      setNewImageData({
        file: null,
        altText: '',
        description: ''
      });
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error saving season image:', err);
      setError(err.message || 'Failed to save season image');
    } finally {
      setLoading(false);
    }
  };

  // Fetch season data when package is loaded
  useEffect(() => {
    if (editingPackage && editingPackage.id) {
      fetchSeasonData(editingPackage.id);
    }
  }, [editingPackage]);

  const fetchSeasonData = async (packageId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/package-seasons/${packageId}/seasons`);
      if (!response.ok) throw new Error('Failed to fetch season data');
      const { success, seasons } = await response.json();
      
      if (!success || !seasons) {
        throw new Error('Invalid response format from server');
      }
      
      // Update season data state
      const updatedSeasonData = { ...seasonData };
      seasons.forEach(season => {
        updatedSeasonData[season.season] = {
          season_description: season.season_description || '',
          best_time_to_visit: season.best_time_to_visit || '',
          weather_conditions: season.weather_conditions || '',
          special_attractions: season.special_attractions || '',
          is_active: season.is_active
        };
      });
      setSeasonData(updatedSeasonData);

      // Fetch season images
      const imagesResponse = await fetch(`http://localhost:5000/api/package-seasons/${packageId}/images`);
      if (!imagesResponse.ok) throw new Error('Failed to fetch season images');
      const imagesData = await imagesResponse.json();
      
      // Update season images state
      const updatedSeasonImages = { ...seasonImages };
      if (Array.isArray(imagesData)) {
        imagesData.forEach(image => {
          if (!updatedSeasonImages[image.season]) {
            updatedSeasonImages[image.season] = [];
          }
          updatedSeasonImages[image.season].push({
            id: image.id,
            file: null, // We don't have the actual file, just the path
            image_path: image.image_path,
            altText: image.alt_text || '',
            description: image.description || '',
            preview: `http://localhost:5000/${image.image_path}`
          });
        });
        setSeasonImages(updatedSeasonImages);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching season data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonDataChange = (season, field, value) => {
    setSeasonData(prev => ({
      ...prev,
      [season]: {
        ...prev[season],
        [field]: value
      }
    }));
  };

  const handleSaveSeasonData = async (season) => {
    if (!editingPackage?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/package-seasons/${editingPackage.id}/${season.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: editingPackage.id,
          season,
          ...seasonData[season]
        })
      });

      if (!response.ok) throw new Error('Failed to save season data');
      // Show success message or handle response
    } catch (err) {
      setError(err.message);
      console.error('Error saving season data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clean up object URLs on unmount or when replaced
  useEffect(() => {
    return () => {
      packageImagePreviews.forEach(url => url && URL.revokeObjectURL(url));
    };
  }, [packageImagePreviews]);

  return (
    <div className="package-form-container">
      <div className="form-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            className={`package-nav-btn ${activeSection === section.id ? 'active' : ''} ${sectionCompletion[section.id] ? 'completed' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            {section.label}
            {sectionCompletion[section.id] && (
              <span className="completion-check">✓</span>
            )}
            {!sectionCompletion[section.id] && (
              <span className="completion-dot"></span>
            )}
          </button>
        ))}
      </div>

      <div className="form-content">
        {activeSection === 'basic' && (
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>
                Featured Image <span className="required">*</span>
                <span 
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip('featured')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  ℹ️
                </span>
                {showTooltip === 'featured' && (
                  <div className="tooltip">
                    This image will be used as the main display image for your package
                  </div>
                )}
              </label>
              <label className="file-upload-container" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={e => handleFeaturedImageChange(e.target.files[0])}
                  className="file-input"
                  required={!editingPackage}
                  style={{ display: 'none' }}
                  id="featured-image-input"
                />
                <div className="upload-placeholder">
                  <span className="upload-icon">📁</span>
                  <p>Drag & drop an image here or <span style={{ color: '#007bff', textDecoration: 'underline' }}>click to browse</span></p>
                </div>
                {formData.featured_image && (
                  <div className="image-preview-container">
                    <img src={formData.featured_image} alt="Featured" className="image-preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeFeaturedImage}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <small className="file-info">Max size: 5MB, Formats: JPEG, PNG, GIF, WEBP</small>
              </label>
            </div>

            <div className="form-group">
              <label>
                Package Name <span className="required">*</span>
                <span 
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip('name')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  ℹ️
                </span>
                {showTooltip === 'name' && (
                  <div className="tooltip">
                    Enter a descriptive name for your package. This will be used to generate the URL.
                  </div>
                )}
              </label>
              <input
                name="package_name"
                value={formData.package_name}
                onChange={handleChange}
                required
                className="styled-input"
                placeholder="Enter package name"
              />
            </div>

            <div className="form-group">
              <label>
                Slug <span className="required">*</span>
                <span 
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip('slug')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  ℹ️
                </span>
                {showTooltip === 'slug' && (
                  <div className="tooltip">
                    This is the URL-friendly version of the package name. You can edit it, but it must be under 60 characters.
                  </div>
                )}
              </label>
              <div className="meta-input">
                <input
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleSlugChange}
                  maxLength={60}
                  placeholder="Auto-generated from package name"
                  className="styled-input"
                />
                <div className="char-count">{(formData.slug || '').length}/60</div>
              </div>
            </div>

            <div className="form-group">
              <label>
                Category <span className="required">*</span>
                <span 
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip('category')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  ℹ️
                </span>
                {showTooltip === 'category' && (
                  <div className="tooltip">
                    Select the category for this package. This is required.
                  </div>
                )}
              </label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                required
                className="styled-input"
              >
                <option value="">Select Category</option>
                {(categories && categories.length > 0 ? categories : [
                  'Pilgrimage',
                  'Adventure',
                  'Snow Trekking',
                  'Trek'
                ]).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price <span className="required">*</span></label>
                <div className="price-input">
                  <span className="currency">₹</span>
                  <input
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    className="styled-input price-field"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Quad Price</label>
                <div className="price-input">
                  <span className="currency">₹</span>
                  <input
                    name="quad_price"
                    value={formData.quad_price || ''}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    className="styled-input price-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Double Price</label>
                <div className="price-input">
                  <span className="currency">₹</span>
                  <input
                    name="double_price"
                    value={formData.double_price || ''}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    className="styled-input price-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Triple Price</label>
                <div className="price-input">
                  <span className="currency">₹</span>
                  <input
                    name="triple_price"
                    value={formData.triple_price || ''}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.01"
                    className="styled-input price-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration</label>
                <div className="duration-input">
                  <input
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="styled-input"
                    placeholder="e.g., 3 Days / 2 Nights"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <button
                  type="button"
                  className={`status-btn ${formData.status === 'Public' ? 'active' : ''}`}
                  onClick={handleStatusToggle}
                >
                  <span className="status-icon">
                    {formData.status === 'Public' ? '🌐' : '📝'}
                  </span>
                  {formData.status}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'location' && (
          <div className="form-section">
            <h3>Location Details</h3>
            <div className="form-group">
              <label>
                Location <span className="required">*</span>
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="styled-input"
                placeholder="Enter package location"
              />
            </div>

            <div className="form-group">
              <label>
                State <span className="required">*</span>
              </label>
              <select
                name="state_id"
                value={formData.state_id}
                onChange={handleStateChange}
                required
                className="styled-input"
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="styled-input"
                placeholder="e.g., 3 Days 2 Nights"
              />
            </div>
          </div>
        )}

        {activeSection === 'images' && (
          <div className="form-section">
            <h3>Package Images</h3>
            <div className="package-images-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'flex-start' }}>
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="package-image-item" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px 12px 12px 12px', background: '#fafbfc',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minWidth: '200px', maxWidth: '240px', minHeight: '300px',
                }}>
                  {/* Upload area */}
                  <div
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      border: '2px dashed #b0b0b0',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      marginBottom: '14px',
                      background: '#f7f7fa',
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => packageImageInputRefs.current[index - 1].current && packageImageInputRefs.current[index - 1].current.click()}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#007bff'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#b0b0b0'}
                    title="Click to upload image"
                  >
                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.2em', color: '#007bff', marginBottom: '6px' }}></i>
                    <span style={{ color: '#007bff', fontWeight: 500, fontSize: '1.08em' }}>Upload Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          setPackageImagePreviews(prev => {
                            const updated = [...prev];
                            updated[index - 1] = previewUrl;
                            return updated;
                          });
                        handleImageChange(index - 1, file);
                      }
                  }}
                  className="file-input"
                    id={`package-image-${index}-input`}
                  style={{ display: 'none' }}
                      ref={packageImageInputRefs.current[index - 1]}
                />
                  </div>
                  {/* Image preview */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <img
                      src={
                        packageImagePreviews[index - 1]
                          ? packageImagePreviews[index - 1]
                          : (formData[`image${index}`] && formData[`image${index}`].startsWith('data:image/')
                            ? formData[`image${index}`]
                            : (() => {
                                const val = formData[`image${index}`];
                                if (!val) return '/images/placeholder.jpg';
                                if (val.startsWith('http')) return val;
                                if (val.startsWith('/') || val.match(/^[a-zA-Z]:\\|^[a-zA-Z]:\//)) return '/images/placeholder.jpg';
                                return `http://localhost:5000/uploads/${val}`;
                              })()
                          )
                      }
                          alt={`Package Image ${index}`} 
                        className="image-preview"
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', background: '#f0f0f0', border: '1px solid #e0e0e0' }}
                        onError={(e) => {
                            console.error('Image preview failed to load:', formData[`image${index}`]);
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                        </div>
                  {/* Remove button */} 
                      <button
                        type="button"
                        className="remove-image-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeImage(index - 1);
                          }}
                          title="Remove image"
                    style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '7px 18px', margin: '6px 0', cursor: 'pointer', fontWeight: 500, fontSize: '1em' }}
                      >
                    <i className="fas fa-trash" style={{ marginRight: '7px' }}></i>
                    Remove
                      </button>
                  </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'season-images' && (
          <div className="form-section">
            <h3>Season Images</h3>
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-spinner">Loading...</div>}
            
            <div className="season-tabs">
              {seasons.map(season => (
                <button
                  key={season}
                  className={`season-tab-btn ${selectedSeason === season ? 'active' : ''}`}
                  onClick={() => setSelectedSeason(season)}
                >
                  {season}
                </button>
              ))}
            </div>

            <div className="season-content">
              {!showImageForm && (
                <div className="season-images-section" style={{ display: 'block', visibility: 'visible' }}>
                  <div className="season-add-image-container" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <button 
                      type="button"
                      className="season-add-new-image-btn"
                      onClick={() => setShowImageForm(true)}
                      disabled={loading}
                      style={{ 
                        background: '#28a745', 
                        color: 'white', 
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <span className="add-icon" style={{ fontSize: '1.5rem' }}>+</span>
                      Add New Image for {selectedSeason}
                    </button>
                  </div>
                  
                  <div className="season-images-grid">
                    {seasonImages[selectedSeason] && seasonImages[selectedSeason].length > 0 ? (
                      seasonImages[selectedSeason].map((image) => (
                        <div key={image.id} className="season-image-item" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '12px',
                          margin: '8px',
                          background: '#fafbfc',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          minWidth: '180px',
                          maxWidth: '220px',
                          minHeight: '260px',
                        }}>
                        <img 
                            src={
                              image.image_path && image.image_path.startsWith('http')
                                ? image.image_path
                                : image.image_path
                                  ? `http://localhost:5000/uploads/${image.image_path.replace(/^uploads[\\/]/, '')}`
                                  : '/images/placeholder.jpg'
                            }
                          alt={image.altText || `${selectedSeason} image`}
                            style={{
                              width: '100%',
                              height: '180px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              marginBottom: '10px',
                              background: '#f0f0f0',
                            }}
                          onError={(e) => {
                              console.error('Image failed to load:', image.image_path);
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder.jpg';
                          }}
                        />
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                            <button 
                              className="edit-image-btn"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontWeight: 500,
                                fontSize: '1em', whiteSpace: 'nowrap'
                              }}
                              onClick={() => handleEditSeasonImage(selectedSeason, image.id)}
                              disabled={loading}
                              title="Edit image details"
                            >
                              <i className="fas fa-edit"></i>
                              <span>Edit</span>
                            </button>
                            <button 
                              className="cut-image-btn"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontWeight: 500,
                                fontSize: '1em', whiteSpace: 'nowrap'
                              }}
                              onClick={() => handleDeleteSeasonImage(selectedSeason, image.id)}
                              disabled={loading}
                              title="Cut image"
                            >
                              <i className="fas fa-cut"></i>
                              <span>Cut</span>
                            </button>
                          </div>
                          {image.altText && <div style={{ marginTop: '8px', fontSize: '0.95em', color: '#555' }}><b>Alt:</b> {image.altText}</div>}
                          {image.description && <div style={{ marginTop: '4px', fontSize: '0.92em', color: '#888' }}>{image.description}</div>}
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#888', textAlign: 'center', width: '100%', padding: '32px 0' }}>
                        No images uploaded for this season.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showImageForm && (
                <div className="season-image-form">
                  <h4>{editingSeasonImage ? 'Edit Image' : 'Add New Image'} for {selectedSeason}</h4>
                  <div className="form-group">
                    <label>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNewImageData(prev => ({ ...prev, file }));
                        }
                      }}
                      className="styled-input"
                      disabled={editingSeasonImage}
                    />
                  </div>
                  <div className="form-group">
                    <label>Alt Text</label>
                    <input
                      type="text"
                      value={newImageData.altText}
                      onChange={(e) => setNewImageData(prev => ({ ...prev, altText: e.target.value }))}
                      placeholder="Enter alt text for the image"
                      className="styled-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newImageData.description}
                      onChange={(e) => setNewImageData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter image description"
                      className="styled-textarea"
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="save-btn"
                      onClick={() => handleSaveSeasonImage(selectedSeason)}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setShowImageForm(false);
                        setEditingSeasonImage(null);
                        setNewImageData({
                          file: null,
                          altText: '',
                          description: ''
                        });
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'details' && (
          <div className="form-section">
            <h3>Package Details</h3>
            
            <div className="details-tabs">
              <button 
                className={`details-tab-btn ${activeDetailsTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveDetailsTab('description')}
              >
                Description
              </button>
              <button 
                className={`details-tab-btn ${activeDetailsTab === 'itinerary' ? 'active' : ''}`}
                onClick={() => setActiveDetailsTab('itinerary')}
              >
                Itinerary
              </button>
              <button 
                className={`details-tab-btn ${activeDetailsTab === 'hotels' ? 'active' : ''}`}
                onClick={() => setActiveDetailsTab('hotels')}
              >
                Hotels
              </button>
              <button 
                className={`details-tab-btn ${activeDetailsTab === 'sightseeing' ? 'active' : ''}`}
                onClick={() => setActiveDetailsTab('sightseeing')}
              >
                Sightseeing
              </button>
            </div>

            <div className="details-tab-content">
              {activeDetailsTab === 'description' && (
                <div className="form-group">
                  <label>Description</label>
                  <ReactQuill
                    value={formData.description}
                    onChange={(content) => handleEditorChange('description', content)}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              )}

              {activeDetailsTab === 'itinerary' && (
                <ManageItinerary 
                  itinerary={formData.itinerary} 
                  onSave={handleItinerarySave}
                />
              )}

              {activeDetailsTab === 'hotels' && (
                <div className="form-group">
                  <label>Hotels</label>
                  <HotelSelector
                    selectedHotels={
                    formData.hotels
                      ? (typeof formData.hotels === 'string'
                          ? (isJsonString(formData.hotels)
                              ? JSON.parse(formData.hotels)
                              : htmlHotelsToJson(formData.hotels))
                          : formData.hotels)
                      : []
                  }
                    onHotelsChange={hotels => {
                    setFormData(prev => ({ 
                      ...prev, 
                      hotels: JSON.stringify(hotels)
                    }));
                  }}
                />
                </div>
              )}

              {activeDetailsTab === 'sightseeing' && (
                <div className="form-group">
                  <label>Sightseeing</label>
                  <ReactQuill
                    value={formData.sightseeing}
                    onChange={(content) => handleEditorChange('sightseeing', content)}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'additional' && (
          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group">
              <label>Itinerary PDF</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => handlePdfChange(e.target.files[0])}
                  className="file-input"
                  id="itinerary-pdf-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="itinerary-pdf-input" className="file-input-label" style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '48px', background: '#f8f9fa', border: '2px dashed #dee2e6', borderRadius: '8px', marginBottom: '10px' }}>
                  <span className="upload-icon">📄</span>
                  <span style={{ color: '#007bff', textDecoration: 'underline', marginLeft: '8px' }}>Browse PDF</span>
                </label>
                {formData.itinerary_pdf && (
                  <div className="pdf-preview-container">
                    <a
                      href={formData.itinerary_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-preview-link"
                    >
                      <span className="pdf-icon">📄</span>
                      View PDF
                    </a>
                    <button
                      type="button"
                      className="remove-pdf-btn"
                      onClick={removePdf}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <small className="file-info">Max size: 10MB, Format: PDF</small>
              </div>
            </div>

            <div className="form-group">
              <label>Note</label>
              <ReactQuill
                value={formData.note}
                onChange={(content) => handleEditorChange('note', content)}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>

            <div className="form-group">
              <label>Inclusion</label>
              <ReactQuill
                value={formData.inclusion}
                onChange={(content) => handleEditorChange('inclusion', content)}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>

            <div className="form-group">
              <label>Exclusion</label>
              <ReactQuill
                value={formData.exclusion}
                onChange={(content) => handleEditorChange('exclusion', content)}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>

            <div className="form-group">
              <label>Visa Requirement</label>
              <ReactQuill
                value={formData.visa_requirement}
                onChange={(content) => handleEditorChange('visa_requirement', content)}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>

            <div className="form-group">
              <label>FAQ</label>
              <ReactQuill
                value={formData.faq}
                onChange={(content) => handleEditorChange('faq', content)}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>
        )}

        {activeSection === 'seo' && (
          <div className="form-section">
            <h3>SEO Information</h3>
            <div className="form-group">
              <label>
                Meta Title
                <span 
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip('meta-title')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  ℹ️
                </span>
                {showTooltip === 'meta-title' && (
                  <div className="tooltip">
                    Keep it between 50-60 characters for optimal SEO
                  </div>
                )}
              </label>
              <div className="meta-input">
                <input
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleChange(e)}
                  maxLength={60}
                  placeholder="Meta Title (50-60 chars)"
                  className="styled-input"
                />
                <div className="char-count">
                  {formData.meta_title.length}/60
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                Meta Description
                <span 
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip('meta-desc')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  ℹ️
                </span>
                {showTooltip === 'meta-desc' && (
                  <div className="tooltip">
                    Keep it between 150-160 characters for optimal SEO
                  </div>
                )}
              </label>
              <div className="meta-input">
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleChange(e)}
                  maxLength={160}
                  placeholder="Meta Description (150-160 chars)"
                  className="styled-textarea"
                />
                <div className="char-count">
                  {formData.meta_description.length}/160
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Meta Keywords</label>
              <input
                name="meta_keywords"
                value={formData.meta_keywords}
                onChange={(e) => handleChange(e)}
                placeholder="Meta Keywords (comma separated)"
                className="styled-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageForm; 