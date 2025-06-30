import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './DestinationForm.css';
import tourismService from '../../services/tourismService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DestinationForm = ({ destination, onSubmit, onClose }) => {
  // Default form state
  const defaultFormState = {
    basicInfo: {
      name: '',
      slug: '',
      shortDescription: '',
      price: '',
      category: '',
      isActive: true,
      isFeatured: false,
      categories: {
        destinationType: '',
        tripType: '',
        season: '',
        budget: '',
        amenities: []
      }
    },
    location_name: '',
    description: '',
    status: 'draft',
    featuredImage: null,
    imageGallery: [],
    bestTimeToVisit: '',
    duration: '',
    budgetRange: {
      min: '',
      max: ''
    },
    nearbyAttractions: '',
    howToReach: '',
    activities: '',
    accommodationTypes: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    specialOffers: {
      isActive: false,
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      discountType: 'percentage',
      discountValue: '',
      termsAndConditions: '',
      promoCode: ''
    }
  };

  // Form states
  const [formData, setFormData] = useState(defaultFormState);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [tourismTypes, setTourismTypes] = useState([]);
  const [tripStyles, setTripStyles] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ];

  // Add categories array
  const categories = [
    { value: 'beach', label: 'Beach Destinations' },
    { value: 'hill', label: 'Hill Stations' },
    { value: 'heritage', label: 'Heritage Sites' },
    { value: 'wildlife', label: 'Wildlife Sanctuaries' },
    { value: 'adventure', label: 'Adventure Sports' },
    { value: 'religious', label: 'Religious Places' },
    { value: 'backwaters', label: 'Backwaters' },
    { value: 'desert', label: 'Desert Safaris' }
  ];

  // Add categories data
  const categoriesData = {
    destinationTypes: [
      'Hill Station',
      'Beach',
      'Desert',
      'Forest / Wildlife',
      'Spiritual / Religious',
      'Adventure'
    ],
    tripTypes: [
      'Honeymoon',
      'Family',
      'Solo',
      'Group',
      'Weekend Getaway',
      'Road Trip',
      'Trekking',
      'Luxury'
    ],
    seasons: [
      'Summer Special',
      'Winter Escape',
      'Monsoon Trails',
      'Snow Trek'
    ],
    budgets: [
      'Budget',
      'Mid-Range',
      'Premium',
      'Luxury'
    ],
    amenities: [
      'Helicopter Ride',
      'Candlelight Dinner',
      'Rafting Included',
      'Private Villa',
      'All Meals'
    ]
  };

  // Initialize form if editing
  useEffect(() => {
    if (destination) {
      try {
        const mappedData = {
          ...defaultFormState,
          basicInfo: {
            ...defaultFormState.basicInfo,
            name: destination.name || '',
            slug: destination.slug || '',
            shortDescription: destination.short_description || '',
            price: destination.price || '',
            isActive: Boolean(destination.is_active),
            isFeatured: Boolean(destination.is_featured),
            categories: {
              destinationType: destination.package_type_id || '',
              tripType: destination.trip_style_id || '',
              season: destination.season_id || '',
              budget: destination.budget_category_id || '',
              amenities: Array.isArray(destination.amenities) ? destination.amenities : []
            }
          },
          location_name: destination.location_name || '',
          description: destination.description || '',
          status: destination.status || 'draft',
          featuredImage: destination.featured_image || null,
          imageGallery: Array.isArray(destination.image_gallery) 
            ? destination.image_gallery.map(img => ({
                file: null, // We don't have the actual file when editing
                altText: img.alt_text || img.name || ''
              }))
            : [],
          bestTimeToVisit: destination.best_time_to_visit || '',
          duration: destination.duration || '',
          budgetRange: {
            min: destination.budget_range_min || '',
            max: destination.budget_range_max || ''
          },
          nearbyAttractions: destination.nearby_attractions || '',
          howToReach: destination.how_to_reach || '',
          activities: destination.activities || '',
          accommodationTypes: destination.accommodation_types || '',
          metaTitle: destination.meta_title || '',
          metaDescription: destination.meta_description || '',
          metaKeywords: destination.meta_keywords ? 
            (typeof destination.meta_keywords === 'string' ? 
              JSON.parse(destination.meta_keywords) : 
              destination.meta_keywords) : 
            []
        };

        setFormData(mappedData);

        // Set image previews
        if (destination.featured_image) {
          setFeaturedImagePreview(destination.featured_image);
        }
        if (Array.isArray(destination.image_gallery) && destination.image_gallery.length > 0) {
          setGalleryPreviews(destination.image_gallery.map(img => img.url || img));
        }
      } catch (error) {
        setFormData(defaultFormState);
      }
    }
  }, [destination]);

  // Generate slug from title
  useEffect(() => {
    if (formData.basicInfo.name) {
      const timestamp = new Date().getTime();
      const baseSlug = formData.basicInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const slug = `${baseSlug}-${timestamp}`;
      setFormData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          slug: slug
        }
      }));
    }
  }, [formData.basicInfo.name]);

  // Fetch master data on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [typesRes, stylesRes, seasonsRes, budgetsRes] = await Promise.all([
          axios.get(`${API_URL}/tourism-types`),
          axios.get(`${API_URL}/trip-styles`),
          axios.get(`${API_URL}/seasons`),
          axios.get(`${API_URL}/budget-categories`)
        ]);
        setTourismTypes(typesRes.data.data || []);
        setTripStyles(stylesRes.data.data || []);
        setSeasons(seasonsRes.data.data || []);
        setBudgetCategories(budgetsRes.data.data || []);
        
        } catch (err) {
        }
    };
    fetchMasterData();
  }, []);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if the field is nested inside basicInfo
    if (name.startsWith('basicInfo.')) {
      const fieldName = name.split('.')[1]; // Get the field name after 'basicInfo.'
      setFormData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          [fieldName]: value
        }
      }));
    } else {
      // Handle non-nested fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle budget range changes
  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      budgetRange: {
        ...prev.budgetRange,
        [name]: value
      }
    }));
  };

  // Handle featured image upload
  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, featuredImage: 'Image size should be less than 5MB' }));
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, featuredImage: 'Please upload a valid image file (JPEG, PNG, GIF, WEBP)' }));
        return;
      }

      // Store the file object directly
      setFormData(prev => ({ ...prev, featuredImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle gallery image alt text
  const handleGalleryAltText = (index, value) => {
    setFormData(prev => {
      const newGallery = [...prev.imageGallery];
      // Ensure the gallery item exists at the index
      if (!newGallery[index]) {
        newGallery[index] = { file: null, altText: '' };
      }
      // Update the alt text
      newGallery[index] = {
        ...newGallery[index],
        altText: value
      };
      return {
        ...prev,
        imageGallery: newGallery
      };
    });
  };

  // Handle gallery image upload
  const handleGalleryImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newGallery = [...formData.imageGallery];
    const newPreviews = [...galleryPreviews];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Add new image with default alt text
        newGallery.push({
          file: file,
          altText: file.name.split('.')[0] // Use filename without extension as default alt text
        });
        newPreviews.push(reader.result);
        
        // Update state with new gallery and previews
        setFormData(prev => ({
          ...prev,
          imageGallery: newGallery
        }));
        setGalleryPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle meta keywords
  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const keyword = currentKeyword.trim();
      if (keyword && !formData.metaKeywords.includes(keyword)) {
        setFormData(prev => ({
          ...prev,
          metaKeywords: [...prev.metaKeywords, keyword]
        }));
      }
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter(k => k !== keywordToRemove)
    }));
  };

  // Handle Quill editor changes
  const handleQuillChange = (content, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: content
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.basicInfo.name?.trim()) {
      newErrors['basicInfo.name'] = 'Destination name is required';
    }
    
    if (!formData.basicInfo.slug?.trim()) {
      newErrors['basicInfo.slug'] = 'Slug is required';
    }
    
    if (!formData.basicInfo.shortDescription?.trim()) {
      newErrors['basicInfo.shortDescription'] = 'Short description is required';
    }
    
    if (!formData.basicInfo.price || formData.basicInfo.price <= 0) {
      newErrors['basicInfo.price'] = 'Valid price is required';
    }
    
    if (!formData.basicInfo.categories.destinationType) {
      newErrors['basicInfo.categories.destinationType'] = 'Destination type is required';
    }
    
    if (!formData.basicInfo.categories.tripType) {
      newErrors['basicInfo.categories.tripType'] = 'Trip type is required';
    }
    
    if (!formData.basicInfo.categories.season) {
      newErrors['basicInfo.categories.season'] = 'Season is required';
    }
    
    if (!formData.basicInfo.categories.budget) {
      newErrors['basicInfo.categories.budget'] = 'Budget category is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.featuredImage && !featuredImagePreview) {
      newErrors.featuredImage = 'Featured image is required';
    }
    
    if (!formData.duration?.trim()) {
      newErrors.duration = 'Duration is required';
    }
    
    if (!formData.bestTimeToVisit?.trim()) {
      newErrors.bestTimeToVisit = 'Best time to visit is required';
    }
    
    if (!formData.howToReach?.trim()) {
      newErrors.howToReach = 'How to reach is required';
    }
    
    if (!formData.activities?.trim()) {
      newErrors.activities = 'Activities are required';
    }
    
    if (!formData.accommodationTypes?.trim()) {
      newErrors.accommodationTypes = 'Accommodation types are required';
    }
    
    if (!formData.location_name?.trim()) {
      newErrors['location_name'] = 'Location name is required';
    }
    
    // Budget range validation
    if (!formData.budgetRange.min || !formData.budgetRange.max) {
      newErrors.budgetRange = 'Both minimum and maximum budget range are required';
    } else if (parseFloat(formData.budgetRange.min) >= parseFloat(formData.budgetRange.max)) {
      newErrors.budgetRange = 'Minimum budget must be less than maximum budget';
    }
    
    // Meta fields validation
    if (!formData.metaTitle?.trim()) {
      newErrors.metaTitle = 'Meta title is required';
    } else if (formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title should be 50-60 characters';
    }
    
    if (!formData.metaDescription?.trim()) {
      newErrors.metaDescription = 'Meta description is required';
    } else if (formData.metaDescription.length < 150 || formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be 150-160 characters';
    }
    
    if (!formData.metaKeywords || formData.metaKeywords.length < 8) {
      newErrors.metaKeywords = 'At least 8 meta keywords are required';
    }

    // Special offers validation - only if isActive is true
    if (formData.specialOffers.isActive) {
      if (!formData.specialOffers.title?.trim()) {
        newErrors['specialOffers.title'] = 'Offer title is required when offer is active';
      }
      if (!formData.specialOffers.description?.trim()) {
        newErrors['specialOffers.description'] = 'Offer description is required when offer is active';
      }
      if (!formData.specialOffers.startDate) {
        newErrors['specialOffers.startDate'] = 'Start date is required when offer is active';
      }
      if (!formData.specialOffers.endDate) {
        newErrors['specialOffers.endDate'] = 'End date is required when offer is active';
      }
      if (!formData.specialOffers.promoCode?.trim()) {
        newErrors['specialOffers.promoCode'] = 'Promo code is required when offer is active';
      }
      if (!formData.specialOffers.discountValue || formData.specialOffers.discountValue <= 0) {
        newErrors['specialOffers.discountValue'] = 'Valid discount value is required when offer is active';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Map form data to match backend structure
      const mappedFormData = {
        name: formData.basicInfo.name,
        slug: formData.basicInfo.slug,
        location_name: formData.location_name,
        short_description: formData.basicInfo.shortDescription,
        description: formData.description,
        price: formData.basicInfo.price,
        duration: formData.duration,
        tourism_type_id: formData.basicInfo.categories.destinationType,
        trip_style_id: formData.basicInfo.categories.tripType,
        season_id: formData.basicInfo.categories.season,
        budget_category_id: formData.basicInfo.categories.budget,
        best_time_to_visit: formData.bestTimeToVisit,
        how_to_reach: formData.howToReach,
        activities: formData.activities,
        accommodation_types: formData.accommodationTypes,
        budget_range_min: formData.budgetRange.min,
        budget_range_max: formData.budgetRange.max,
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,
        meta_keywords: Array.isArray(formData.metaKeywords) ? 
          JSON.stringify(formData.metaKeywords) : 
          formData.metaKeywords,
        status: formData.status,
        is_active: formData.basicInfo.isActive ? 1 : 0,
        is_featured: formData.basicInfo.isFeatured ? 1 : 0,
        amenities: Array.isArray(formData.basicInfo.categories.amenities) ? 
          JSON.stringify(formData.basicInfo.categories.amenities) : 
          '[]'
      };

      // Add ID if editing
      if (destination?.id) {
        mappedFormData.id = destination.id;
      }

      // Create FormData object for file upload
      const formDataToSend = new FormData();

      // Add all mapped fields
      Object.entries(mappedFormData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value);
        }
      });

      // Handle featured image
      if (formData.featuredImage instanceof File) {
        // New image uploaded
        formDataToSend.append('featured_image', formData.featuredImage);
      } else if (destination?.featuredImage?.filename) {
        // Using existing image during edit
        formDataToSend.append('existing_featured_image', destination.featuredImage.filename);
      }

      // Add gallery images
      if (Array.isArray(formData.imageGallery)) {
        formData.imageGallery.forEach((image, index) => {
          if (image.file instanceof File) {
            formDataToSend.append('gallery_images', image.file);
            formDataToSend.append('gallery_alt_texts', image.altText || '');
          }
        });
      }


      // Add retry logic
      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          const response = await axios.post(
            `${API_URL}/tourism`,
            formDataToSend,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          if (response.data.success) {
            toast.success('Destination saved successfully!');
            onSubmit(response.data.data);
            return;
          } else {
            throw new Error(response.data.message || 'Failed to save destination');
          }
        } catch (error) {
          lastError = error;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      throw lastError;

    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
        toast.error(error.response.data.message);
      } else {
        setErrors({ submit: error.message || 'Failed to save destination' });
        toast.error(error.message || 'Failed to save destination');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-destination-form">
      <div className="admin-form-grid">
        {/* Basic Information Section */}
        <div className="admin-form-section">
          <h3>Basic Information</h3>
          
          {/* Name and Location Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="name">Destination Name *</label>
              <input
                type="text"
                id="name"
                name="basicInfo.name"
                value={formData.basicInfo.name}
                onChange={handleChange}
                className={errors.basicInfo?.name ? 'admin-error' : ''}
                placeholder="Enter destination name"
              />
              {errors.basicInfo?.name && <span className="admin-error-message">{errors.basicInfo.name}</span>}
            </div>

            <div className="admin-form-group">
              <label htmlFor="location_name">Location Name *</label>
              <input
                type="text"
                id="location_name"
                name="location_name"
                value={formData.location_name || ''}
                onChange={handleChange}
                className={errors.location_name ? 'admin-error' : ''}
                placeholder="Enter actual location (e.g., Delhi, Mumbai, Goa)"
              />
              {errors.location_name && <span className="admin-error-message">{errors.location_name}</span>}
            </div>
          </div>

          {/* Slug and Price Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="slug">URL Slug *</label>
              <input
                type="text"
                id="slug"
                name="basicInfo.slug"
                value={formData.basicInfo.slug}
                onChange={handleChange}
                placeholder="Auto-generated from title"
                readOnly
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                value={formData.basicInfo.price}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  basicInfo: {
                    ...prev.basicInfo,
                    price: e.target.value
                  }
                }))}
                placeholder="Enter package price"
                min="0"
                className={errors.basicInfo?.price ? 'admin-error' : ''}
              />
              {errors.basicInfo?.price && (
                <span className="admin-error-message">{errors.basicInfo.price}</span>
              )}
            </div>
          </div>

          {/* Destination Type and Trip Type Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="destinationType">Destination Type *</label>
              <select
                id="destinationType"
                value={formData.basicInfo.categories.destinationType}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  basicInfo: {
                    ...prev.basicInfo,
                    categories: {
                      ...prev.basicInfo.categories,
                      destinationType: e.target.value
                    }
                  }
                }))}
                required
              >
                <option value="">Select Destination Type</option>
                {tourismTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.basicInfo?.categories?.destinationType && (
                <span className="admin-error-message">{errors.basicInfo.categories.destinationType}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="tripType">Trip Type *</label>
              <select
                id="tripType"
                value={formData.basicInfo.categories.tripType}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  basicInfo: {
                    ...prev.basicInfo,
                    categories: {
                      ...prev.basicInfo.categories,
                      tripType: e.target.value
                    }
                  }
                }))}
                required
              >
                <option value="">Select Trip Type</option>
                {tripStyles.map(style => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
              {errors.basicInfo?.categories?.tripType && (
                <span className="admin-error-message">{errors.basicInfo.categories.tripType}</span>
              )}
            </div>
          </div>

          {/* Season and Budget Row */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="season">Season *</label>
              <select
                id="season"
                value={formData.basicInfo.categories.season}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  basicInfo: {
                    ...prev.basicInfo,
                    categories: {
                      ...prev.basicInfo.categories,
                      season: e.target.value
                    }
                  }
                }))}
                required
              >
                <option value="">Select Season</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>{season.name}</option>
                ))}
              </select>
              {errors.basicInfo?.categories?.season && (
                <span className="admin-error-message">{errors.basicInfo.categories.season}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="budget">Budget Category *</label>
              <select
                id="budget"
                value={formData.basicInfo.categories.budget}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  basicInfo: {
                    ...prev.basicInfo,
                    categories: {
                      ...prev.basicInfo.categories,
                      budget: e.target.value
                    }
                  }
                }))}
                required
              >
                <option value="">Select Budget</option>
                {budgetCategories.map(budget => (
                  <option key={budget.id} value={budget.id}>{budget.name}</option>
                ))}
              </select>
              {errors.basicInfo?.categories?.budget && (
                <span className="admin-error-message">{errors.basicInfo.categories.budget}</span>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label>Special Amenities</label>
            <div className="admin-checkbox-group-grid">
              {categoriesData.amenities.map(amenity => (
                <div key={amenity} className="admin-checkbox-item">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={formData.basicInfo.categories.amenities.includes(amenity)}
                    onChange={(e) => {
                      const newAmenities = e.target.checked
                        ? [...formData.basicInfo.categories.amenities, amenity]
                        : formData.basicInfo.categories.amenities.filter(a => a !== amenity);
                      
                      setFormData(prev => ({
                        ...prev,
                        basicInfo: {
                          ...prev.basicInfo,
                          categories: {
                            ...prev.basicInfo.categories,
                            amenities: newAmenities
                          }
                        }
                      }));
                    }}
                  />
                  <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="shortDescription">Short Description *</label>
            <textarea
              id="shortDescription"
              name="basicInfo.shortDescription"
              value={formData.basicInfo.shortDescription}
              onChange={handleChange}
              className={errors.basicInfo?.shortDescription ? 'admin-error' : ''}
              rows="3"
              placeholder="Enter short description"
            />
            {errors.basicInfo?.shortDescription && <span className="admin-error-message">{errors.basicInfo.shortDescription}</span>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Images Section */}
        <div className="admin-form-section">
          <h3>Images</h3>
          
          <div className="admin-form-group">
            <label htmlFor="featuredImage">Featured Image *</label>
            <input
              type="file"
              id="featuredImage"
              accept="image/*"
              onChange={handleFeaturedImageChange}
              className={errors.featuredImage ? 'admin-error' : ''}
            />
            {errors.featuredImage && <span className="admin-error-message">{errors.featuredImage}</span>}
            {featuredImagePreview && (
              <div className="admin-image-preview">
                <img src={featuredImagePreview} alt="Featured" />
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="galleryImages">Gallery Images</label>
            <input
              type="file"
              id="galleryImages"
              accept="image/*"
              multiple
              onChange={handleGalleryImageChange}
            />
            <div className="admin-gallery-preview">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="admin-gallery-item">
                  <img src={preview} alt={`Gallery ${index + 1}`} />
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={formData.imageGallery[index]?.altText || ''}
                    onChange={(e) => handleGalleryAltText(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="admin-form-section">
          <h3>Description</h3>
          
          <div className="admin-form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'admin-error' : ''}
              rows="6"
              placeholder="Enter detailed description"
            />
            {errors.description && <span className="admin-error-message">{errors.description}</span>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="bestTimeToVisit">Best Time to Visit</label>
            <textarea
              id="bestTimeToVisit"
              name="bestTimeToVisit"
              value={formData.bestTimeToVisit}
              onChange={handleChange}
              rows="3"
              placeholder="Enter best time to visit details"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 3-5 days"
            />
          </div>

          <div className="admin-form-group budget-range">
            <label>Budget Range</label>
            <div className="admin-budget-inputs">
              <input
                type="number"
                name="min"
                value={formData.budgetRange.min}
                onChange={handleBudgetChange}
                placeholder="Min"
              />
              <span>to</span>
              <input
                type="number"
                name="max"
                value={formData.budgetRange.max}
                onChange={handleBudgetChange}
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="admin-form-section">
          <h3>Additional Information</h3>
          
          <div className="admin-form-group">
            <label htmlFor="nearbyAttractions">Nearby Attractions</label>
            <ReactQuill
              theme="snow"
              value={formData.nearbyAttractions}
              onChange={(content) => handleQuillChange(content, 'nearbyAttractions')}
              modules={quillModules}
              formats={quillFormats}
              className="admin-quill-editor"
              placeholder="Enter nearby attractions with images and formatting..."
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="howToReach">How to Reach</label>
            <ReactQuill
              theme="snow"
              value={formData.howToReach}
              onChange={(content) => handleQuillChange(content, 'howToReach')}
              modules={quillModules}
              formats={quillFormats}
              className="admin-quill-editor"
              placeholder="Enter how to reach details with images and formatting..."
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="activities">Activities</label>
            <ReactQuill
              theme="snow"
              value={formData.activities}
              onChange={(content) => handleQuillChange(content, 'activities')}
              modules={quillModules}
              formats={quillFormats}
              className="admin-quill-editor"
              placeholder="Enter available activities with images and formatting..."
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="accommodationTypes">Accommodation Types</label>
            <ReactQuill
              theme="snow"
              value={formData.accommodationTypes}
              onChange={(content) => handleQuillChange(content, 'accommodationTypes')}
              modules={quillModules}
              formats={quillFormats}
              className="admin-quill-editor"
              placeholder="Enter accommodation types with images and formatting..."
            />
          </div>
        </div>

        {/* Special Offers Section */}
        <div className="admin-form-section">
          <h3>Special Offers</h3>
          
          <div className="admin-form-group">
            <div className="admin-checkbox-group">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.specialOffers.isActive}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  specialOffers: {
                    ...prev.specialOffers,
                    isActive: e.target.checked
                  }
                }))}
              />
              <label htmlFor="isActive">Enable Special Offer</label>
            </div>
          </div>

          {formData.specialOffers.isActive && (
            <>
              <div className="admin-form-group">
                <label htmlFor="offerTitle">Offer Title *</label>
                <input
                  type="text"
                  id="offerTitle"
                  value={formData.specialOffers.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specialOffers: {
                      ...prev.specialOffers,
                      title: e.target.value
                    }
                  }))}
                  placeholder="e.g., Summer Special 30% Off"
                  className={errors.specialOffers?.title ? 'admin-error' : ''}
                />
                {errors.specialOffers?.title && (
                  <span className="admin-error-message">{errors.specialOffers.title}</span>
                )}
              </div>

              <div className="admin-form-group">
                <label htmlFor="offerDescription">Offer Description *</label>
                <ReactQuill
                  theme="snow"
                  value={formData.specialOffers.description}
                  onChange={(content) => setFormData(prev => ({
                    ...prev,
                    specialOffers: {
                      ...prev.specialOffers,
                      description: content
                    }
                  }))}
                  modules={quillModules}
                  formats={quillFormats}
                  className="admin-quill-editor"
                  placeholder="Enter detailed offer description with images..."
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.specialOffers.startDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      specialOffers: {
                        ...prev.specialOffers,
                        startDate: e.target.value
                      }
                    }))}
                    className={errors.specialOffers?.startDate ? 'admin-error' : ''}
                  />
                  {errors.specialOffers?.startDate && (
                    <span className="admin-error-message">{errors.specialOffers.startDate}</span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.specialOffers.endDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      specialOffers: {
                        ...prev.specialOffers,
                        endDate: e.target.value
                      }
                    }))}
                    className={errors.specialOffers?.endDate ? 'admin-error' : ''}
                  />
                  {errors.specialOffers?.endDate && (
                    <span className="admin-error-message">{errors.specialOffers.endDate}</span>
                  )}
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="promoCode">Promotional Code *</label>
                  <div className="admin-promo-code-input">
                    <input
                      type="text"
                      id="promoCode"
                      value={formData.specialOffers.promoCode}
                      onChange={(e) => {
                        // Convert to uppercase and remove spaces
                        const code = e.target.value.toUpperCase().replace(/\s+/g, '');
                        setFormData(prev => ({
                          ...prev,
                          specialOffers: {
                            ...prev.specialOffers,
                            promoCode: code
                          }
                        }));
                      }}
                      placeholder="Enter a memorable code (e.g., SUMMER30, WINTER50, HOLIDAY25)"
                      maxLength={15}
                      className={errors.specialOffers?.promoCode ? 'admin-error' : ''}
                    />
                    <div className="admin-promo-code-info">
                      This code will be shown to customers during checkout to avail the special offer
                    </div>
                  </div>
                  {errors.specialOffers?.promoCode && (
                    <span className="admin-error-message">{errors.specialOffers.promoCode}</span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="discountType">Discount Type *</label>
                  <select
                    id="discountType"
                    value={formData.specialOffers.discountType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      specialOffers: {
                        ...prev.specialOffers,
                        discountType: e.target.value
                      }
                    }))}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="discountValue">Discount Value *</label>
                <input
                  type="number"
                  id="discountValue"
                  value={formData.specialOffers.discountValue}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specialOffers: {
                      ...prev.specialOffers,
                      discountValue: e.target.value
                    }
                  }))}
                  placeholder={formData.specialOffers.discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                  min="0"
                  max={formData.specialOffers.discountType === 'percentage' ? "100" : undefined}
                  className={errors.specialOffers?.discountValue ? 'admin-error' : ''}
                />
                {errors.specialOffers?.discountValue && (
                  <span className="admin-error-message">{errors.specialOffers.discountValue}</span>
                )}
              </div>

              <div className="admin-form-group">
                <label htmlFor="termsAndConditions">Terms & Conditions</label>
                <ReactQuill
                  theme="snow"
                  value={formData.specialOffers.termsAndConditions}
                  onChange={(content) => setFormData(prev => ({
                    ...prev,
                    specialOffers: {
                      ...prev.specialOffers,
                      termsAndConditions: content
                    }
                  }))}
                  modules={quillModules}
                  formats={quillFormats}
                  className="admin-quill-editor"
                  placeholder="Enter terms and conditions for the offer..."
                />
              </div>
            </>
          )}
        </div>

        {/* SEO Section */}
        <div className="admin-form-section">
          <h3>SEO Information</h3>
          
          <div className="admin-form-group">
            <label htmlFor="metaTitle">Meta Title</label>
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className={errors.metaTitle ? 'admin-error' : ''}
              placeholder="50-60 characters"
              maxLength={60}
            />
            <div className="admin-character-count">
              {formData.metaTitle.length}/60
            </div>
            {errors.metaTitle && <span className="admin-error-message">{errors.metaTitle}</span>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="metaDescription">Meta Description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              className={errors.metaDescription ? 'admin-error' : ''}
              rows="3"
              placeholder="150-160 characters"
              maxLength={160}
            />
            <div className="admin-character-count">
              {formData.metaDescription.length}/160
            </div>
            {errors.metaDescription && <span className="admin-error-message">{errors.metaDescription}</span>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="metaKeywords">Meta Keywords *</label>
            <div className="admin-keywords-input">
              <input
                type="text"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Type and press Enter or comma to add"
                className={errors.metaKeywords ? 'admin-error' : ''}
              />
              <div className="admin-keywords-tags">
                {formData.metaKeywords.map((keyword, index) => (
                  <span key={index} className="admin-keyword-tag">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="admin-remove-keyword"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.metaKeywords && <span className="admin-error-message">{errors.metaKeywords}</span>}
              <div className="admin-keywords-count">
                {formData.metaKeywords.length}/8 minimum required
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-form-actions">
        <button
          type="button"
          onClick={onClose}
          className="admin-btn admin-btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : destination ? 'Update Destination' : 'Add Destination'}
        </button>
      </div>

      {errors.submit && (
        <div className="admin-submit-error">
          {errors.submit}
        </div>
      )}
    </form>
  );
};

export default DestinationForm; 