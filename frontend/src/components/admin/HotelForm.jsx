import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './HotelForm.css';

const HotelForm = ({ editingHotel, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    state_id: '',
    location: '',
    address: '',
    phone_number: '',
    description: '',
    star_rating: '',
    price_per_night: '',
    total_rooms: '',
    available_rooms: '',
    amenities: [],
    check_in_time: '',
    check_out_time: '',
    latitude: '',
    longitude: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    accommodation_type: 'hotel',
    tent_capacity: '',
    tent_type: '',
    resort_features: [],
    resort_category: '',
    featured_image_index: '',
    featured_image: '',
    homestay_features: '',
    hostel_features: '',
    guesthouse_features: ''
  });

  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [images, setImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastHotelId = useRef(null);

  const accommodationAmenities = {
    hotel: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Room Service', 'Air Conditioning'],
    tent: ['Bonfire', 'Camping Area', 'Outdoor Activities', 'Stargazing'],
    resort: ['Swimming Pool', 'Spa', 'Restaurant', 'Bar', 'Water Sports', 'Kids Club', 'Beach Access', 'Golf Course'],
    homestay: ['Home Kitchen', 'Local Experience', 'Family Environment', 'Cultural Activities', 'Local Guide', 'Home-cooked Meals'],
    hostel: ['Dormitory', 'Common Kitchen', 'Common Lounge', 'Laundry', 'Lockers', 'Tour Desk', '24/7 Reception'],
    guesthouse: ['Private Rooms', 'Basic Kitchen', 'Local Experience', 'Family Environment', 'Basic Amenities'],
    cottage: [
      'Fireplace',
      'Private Garden',
      'Lake View',
      'Mountain View',
      'Kitchenette',
      'Pet Friendly',
      'DJ Night',
      'Bonfire',
      'Hot Water'
    ]
  };

  // Define type-specific required fields outside the functions
  const typeSpecificRequiredFields = {
    tent: {
      tent_capacity: 'Tent Capacity',
      tent_type: 'Tent Type'
    },
    resort: {
      resort_category: 'Resort Category',
      resort_features: 'Resort Features'
    },
    homestay: {
      homestay_features: 'Homestay Features'
    },
    hostel: {
      hostel_features: 'Hostel Features'
    },
    guesthouse: {
      guesthouse_features: 'Guesthouse Features'
    }
  };

  useEffect(() => {
    if (editingHotel && editingHotel.id !== lastHotelId.current) {
      // Create a new form data object with all fields
      const newFormData = {
        name: editingHotel.name || '',
        slug: editingHotel.slug || '',
        category_id: editingHotel.category_id || '',
        state_id: editingHotel.state_id || '',
        location: editingHotel.location || '',
        address: editingHotel.address || '',
        phone_number: editingHotel.phone_number || '',
        description: editingHotel.description || '',
        star_rating: editingHotel.star_rating || '',
        price_per_night: editingHotel.price_per_night || '',
        total_rooms: editingHotel.total_rooms || '',
        available_rooms: editingHotel.available_rooms || '',
        amenities: editingHotel.amenities || [],
        check_in_time: editingHotel.check_in_time || '',
        check_out_time: editingHotel.check_out_time || '',
        latitude: editingHotel.latitude || '',
        longitude: editingHotel.longitude || '',
        meta_title: editingHotel.meta_title || '',
        meta_description: editingHotel.meta_description || '',
        meta_keywords: editingHotel.meta_keywords || '',
        featured_image: '',
        featured_image_preview: editingHotel.featured_image || '',
        accommodation_type: editingHotel.accommodation_type || 'hotel',
        tent_capacity: editingHotel.tent_capacity || '',
        tent_type: editingHotel.tent_type || '',
        resort_category: editingHotel.resort_category || '',
        resort_features: editingHotel.resort_features || [],
        homestay_features: editingHotel.homestay_features || '',
        hostel_features: editingHotel.hostel_features || '',
        guesthouse_features: editingHotel.guesthouse_features || ''
      };

      setFormData(newFormData);
      lastHotelId.current = editingHotel.id;

      // Handle images
      const safeImages = Array.isArray(editingHotel.images) ? editingHotel.images : [];
      if (safeImages.length > 0) {
        const existingImages = safeImages.map(img => ({
          id: img.id,
          url: img.url.startsWith('http') ? img.url : `http://localhost:5000/uploads/${img.url}`,
          file: null,
          alt_text: img.alt_text || '',
          description: img.description || ''
        }));
        setImages(existingImages);
      } else if (editingHotel.id) {
        // Fallback: fetch images from API if not present
        axios.get(`http://localhost:5000/api/hotels/${editingHotel.id}`)
          .then(res => {
            if (res.data.images && res.data.images.length > 0) {
              const apiImages = res.data.images.map(img => ({
                id: img.id,
                url: img.url.startsWith('http') ? img.url : `http://localhost:5000/uploads/${img.url}`,
                file: null,
                alt_text: img.alt_text || '',
                description: img.description || ''
              }));
              setImages(apiImages);
            } else {
              setImages([]);
            }
          })
          .catch(error => {
            setImages([]);
          });
      } else {
        setImages([]);
      }
    }
  }, [editingHotel]);

  // Fetch categories when accommodation_type changes
  useEffect(() => {
    const fetchCategoriesForType = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/hotel-categories', {
          params: { type: formData.accommodation_type }
        });
        const categoriesData = Array.isArray(response.data) ? response.data : [];
        setCategories(categoriesData);
        
        // If editing and category_id exists but not in new categories, reset it
        if (editingHotel && formData.category_id) {
          const categoryExists = categoriesData.some(cat => cat.id === formData.category_id);
          if (!categoryExists) {
            setFormData(prev => ({
              ...prev,
              category_id: ''
            }));
          }
        }
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategoriesForType();
  }, [formData.accommodation_type, editingHotel, formData.category_id]);

  const fetchStates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/states');
      setStates(response.data);
    } catch (error) {
      setStates([]);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // Add a new useEffect to monitor formData changes
  useEffect(() => {
    if (editingHotel) {
      }
  }, [formData.name, editingHotel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: editingHotel ? prev.slug : (prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
        ? value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : prev.slug)
    }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, value]
        : prev.amenities.filter(amenity => amenity !== value)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      alt_text: '',
      description: ''
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleImageDetailsChange = (index, field, value) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, [field]: value } : img
    ));
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    if (imageToRemove.id) {
      setRemoveImages(prev => [...prev, imageToRemove.id]);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = [];

    // Common required fields for all accommodation types
    const commonRequiredFields = {
      name: formData.name,
      category_id: formData.category_id,
      state_id: formData.state_id,
      location: formData.location,
      address: formData.address,
      phone_number: formData.phone_number,
      description: formData.description,
      price_per_night: formData.price_per_night,
      total_rooms: formData.total_rooms,
      available_rooms: formData.available_rooms,
      check_in_time: formData.check_in_time,
      check_out_time: formData.check_out_time,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      meta_keywords: formData.meta_keywords
    };

    // Validate common fields
    Object.entries(commonRequiredFields).forEach(([field, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${field.replace(/_/g, ' ')} is required`);
      }
    });

    // Validate type-specific fields
    const typeFields = typeSpecificRequiredFields[formData.accommodation_type] || {};
    Object.entries(typeFields).forEach(([field, label]) => {
      const value = formData[field];
      if (!value || 
          (Array.isArray(value) && value.length === 0) || 
          (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${label} is required for ${formData.accommodation_type}`);
      }
    });

    // Phone number validation
    if (formData.phone_number && !/^\+91[0-9]{10}$/.test(formData.phone_number)) {
      errors.push('Phone number must start with +91 followed by 10 digits');
    }

    // Star rating validation
    if (formData.star_rating < 0 || formData.star_rating > 5) {
      errors.push('Star rating must be between 0 and 5');
    }

    // Room validation
    const totalRooms = Number(formData.total_rooms);
    const availableRooms = Number(formData.available_rooms);

    if (totalRooms <= 0) {
      errors.push('Total rooms must be greater than 0');
    }
    if (
      !isNaN(totalRooms) &&
      !isNaN(availableRooms) &&
      availableRooms > totalRooms
    ) {
      errors.push('Available rooms cannot be greater than total rooms');
    }

    // Meta validation
    if (formData.meta_title && (formData.meta_title.length < 50 || formData.meta_title.length > 60)) {
      errors.push('Meta title must be between 50 and 60 characters');
    }

    if (formData.meta_description && (formData.meta_description.length < 150 || formData.meta_description.length > 160)) {
      errors.push('Meta description must be between 150 and 160 characters');
    }

    if (formData.meta_keywords) {
      const keywords = formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
      if (keywords.length < 8) {
        errors.push('At least 8 keywords are required (separated by commas)');
      }
    }

    // Image validation
    if (images.length === 0) {
      errors.push('At least one image is required');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Debug logs for form data
    // Debug log for removed images

    // Validate form before submitting
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors[0]);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'amenities' || key === 'resort_features') {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (key === 'featured_image' && value instanceof File) {
            formDataToSend.append('featured_image', value);
          } else if (key === 'total_rooms' || key === 'available_rooms') {
            formDataToSend.append(key, Number(value));
          } else if (key !== 'featured_image_preview') {
            formDataToSend.append(key, value === '' ? null : value);
          }
        }
      });

      // Add remove_images if any
      if (removeImages.length > 0) {
        formDataToSend.append('remove_images', JSON.stringify(removeImages));
      }

      // Add images with proper metadata
      const newImages = images.filter(img => img.file); // Only get images with files
      newImages.forEach((image, index) => {
        // Append the image file
        formDataToSend.append('images', image.file);
        
        // Append alt text and description with proper field names
        const altText = image.alt_text || '';
        const description = image.description || '';
        
        formDataToSend.append(`alt_text_${index}`, altText);
        formDataToSend.append(`description_${index}`, description);
      });

      // Log the final FormData contents
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          } else {
          }
      }

      let response;
      if (editingHotel) {
        response = await axios.put(`http://localhost:5000/api/hotels/${editingHotel.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.post('http://localhost:5000/api/hotels', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data) {
        alert(editingHotel ? 'Hotel updated successfully!' : 'Hotel added successfully!');
        if (onSuccess) {
          onSuccess(response.data);
        }
        setFormData({
          name: '',
          slug: '',
          category_id: '',
          state_id: '',
          location: '',
          address: '',
          phone_number: '',
          description: '',
          star_rating: '',
          price_per_night: '',
          total_rooms: '',
          available_rooms: '',
          amenities: [],
          check_in_time: '',
          check_out_time: '',
          latitude: '',
          longitude: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          accommodation_type: 'hotel',
          tent_capacity: '',
          tent_type: '',
          resort_features: [],
          resort_category: '',
          featured_image: '',
          homestay_features: '',
          hostel_features: '',
          guesthouse_features: ''
        });
        setImages([]);
        setRemoveImages([]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving accommodation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        featured_image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          featured_image_preview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Debug: log images array before rendering
  return (
    <form className="hotel-form-main" onSubmit={handleSubmit}>
      <h2 className="hotel-form-title">
        {editingHotel ? 'Edit Accommodation' : 'Add New Accommodation'}
      </h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Accommodation Type*</label>
          <select
            name="accommodation_type"
            value={formData.accommodation_type}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
          >
            <option value="hotel">Hotel</option>
            <option value="tent">Tent</option>
            <option value="resort">Resort</option>
            <option value="homestay">Homestay</option>
            <option value="hostel">Hostel</option>
            <option value="guesthouse">Guesthouse</option>
            <option value="cottage">Cottage</option>
          </select>
        </div>

        <div className="hotel-form-group">
          <label>Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleNameChange}
            required
            className="hotel-form-input"
            placeholder={`Enter ${formData.accommodation_type} name`}
          />
        </div>

        <div className="hotel-form-group">
          <label>Slug*</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
            placeholder="Enter URL slug"
          />
          <small className="form-text text-muted">
            This will be used in the URL. Auto-generated from name but can be edited.
          </small>
        </div>
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Category*</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
          >
            <option value="">Select Category</option>
            {(categories || []).map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hotel-form-group">
          <label>State*</label>
          <select
            name="state_id"
            value={formData.state_id}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
          >
            <option value="">Select State</option>
            {(states || []).map(state => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hotel-form-group">
        <label>Featured Image*</label>
        <div className="hotel-form-featured-image">
          <input
            type="file"
            accept="image/*"
            onChange={handleFeaturedImageChange}
            className="hotel-form-input"
            id="featured-image"
          />
          <label htmlFor="featured-image" className="hotel-form-upload-label">
            <span className="hotel-form-upload-icon">+</span>
            <span>Upload Featured Image</span>
          </label>
          {formData.featured_image_preview && (
            <div className="hotel-form-featured-preview">
              <img src={formData.featured_image_preview} alt="Featured Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} />
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  featured_image: null,
                  featured_image_preview: null
                }))}
                className="hotel-form-remove-btn"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {formData.accommodation_type === 'tent' && (
        <div className="hotel-form-row">
          <div className="hotel-form-group">
            <label>Tent Capacity*</label>
            <input
              type="number"
              name="tent_capacity"
              value={formData.tent_capacity}
              onChange={handleInputChange}
              required
              className="hotel-form-input"
              placeholder="Number of people per tent"
            />
          </div>
          <div className="hotel-form-group">
            <label>Tent Type*</label>
            <select
              name="tent_type"
              value={formData.tent_type}
              onChange={handleInputChange}
              required
              className="hotel-form-input"
            >
              <option value="">Select Tent Type</option>
              <option value="luxury">Luxury Tent</option>
              <option value="standard">Standard Tent</option>
              <option value="basic">Basic Tent</option>
            </select>
          </div>
        </div>
      )}

      {formData.accommodation_type === 'resort' && (
        <div className="hotel-form-row">
          <div className="hotel-form-group">
            <label>Resort Category*</label>
            <select
              name="resort_category"
              value={formData.resort_category}
              onChange={handleInputChange}
              required
              className="hotel-form-input"
            >
              <option value="">Select Resort Category</option>
              <option value="beach">Beach Resort</option>
              <option value="mountain">Mountain Resort</option>
              <option value="wildlife">Wildlife Resort</option>
              <option value="spa">Spa Resort</option>
            </select>
          </div>
        </div>
      )}

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Location*</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
          />
        </div>

        <div className="hotel-form-group">
          <label>Address*</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
          />
        </div>
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Phone Number*</label>
          <div className="hotel-form-phone-input">
            <span className="hotel-form-phone-prefix">+91</span>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number.replace('+91', '')}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setFormData(prev => ({
                    ...prev,
                    phone_number: '+91' + value
                  }));
                }
              }}
              required
              className="hotel-form-input"
              placeholder="Enter 10 digit mobile number"
              maxLength={10}
            />
          </div>
        </div>

        <div className="hotel-form-group">
          <label>Star Rating*</label>
          <div className="star-rating-input">
            <input
              type="number"
              name="star_rating"
              value={formData.star_rating}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                if (value === '' || (value >= 0 && value <= 5)) {
                  setFormData(prev => ({
                    ...prev,
                    star_rating: value
                  }));
                }
              }}
              min="0"
              max="5"
              step="0.5"
              required
              className="hotel-form-input"
              placeholder="Enter rating (0-5)"
            />
            <div className="star-rating-info">
              <small>Enter rating from 0 to 5 (can use decimals like 3.5)</small>
            </div>
          </div>
        </div>
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Price per Night*</label>
          <input
            type="number"
            name="price_per_night"
            value={formData.price_per_night}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
          />
        </div>

        <div className="hotel-form-group">
          <label>Total Rooms*</label>
          <input
            type="number"
            name="total_rooms"
            value={formData.total_rooms}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : parseInt(e.target.value);
              if (value === '' || value > 0) {
                setFormData(prev => ({
                  ...prev,
                  total_rooms: value,
                  available_rooms: value === '' ? prev.available_rooms : Math.min(prev.available_rooms, value)
                }));
              }
            }}
            required
            className="hotel-form-input"
            min="1"
            placeholder="Enter total number of rooms"
          />
        </div>
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Available Rooms*</label>
          <input
            type="number"
            name="available_rooms"
            value={formData.available_rooms}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : parseInt(e.target.value);
              if (value === '' || (value >= 0 && value <= formData.total_rooms)) {
                setFormData(prev => ({
                  ...prev,
                  available_rooms: value
                }));
              }
            }}
            required
            className="hotel-form-input"
            min="0"
            max={formData.total_rooms}
            placeholder={`Enter available rooms (max ${formData.total_rooms})`}
          />
          {formData.available_rooms > formData.total_rooms && (
            <div className="error-message">
              Available rooms cannot be greater than total rooms. Please check your input.
            </div>
          )}
        </div>

        <div className="hotel-form-group">
          <label>Check-in Time*</label>
          <input
            type="time"
            name="check_in_time"
            value={formData.check_in_time}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
          />
        </div>
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Check-out Time*</label>
          <input
            type="time"
            name="check_out_time"
            value={formData.check_out_time}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
          />
        </div>
      </div>

      <div className="amenities-section">
        <h3>Amenities</h3>
        <div className="amenities-grid">
          {(accommodationAmenities[formData.accommodation_type] || []).map(amenity => (
            <div key={amenity} className="amenity-item">
              <input
                type="checkbox"
                id={amenity}
                value={amenity}
                checked={formData.amenities.includes(amenity)}
                onChange={handleAmenityChange}
              />
              <label htmlFor={amenity}>{amenity}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="hotel-form-group">
        <label>Images</label>
        <div className="hotel-form-image-upload">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hotel-form-input"
            id="hotel-images"
          />
          <label htmlFor="hotel-images" className="hotel-form-upload-label">
            <span className="hotel-form-upload-icon">+</span>
            <span>Add Images</span>
          </label>
        </div>
        <div className="hotel-form-images-list">
          {images.length === 0 ? (
            <div style={{ color: '#aaa', textAlign: 'center', padding: '16px' }}>No images</div>
          ) : (
            images.map((image, index) => (
              <div key={index} className="hotel-form-image-item">
                <div className="hotel-form-image-preview">
                  <img 
                    src={image.url} 
                    alt={image.alt_text || `Preview ${index + 1}`} 
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="hotel-form-remove-btn"
                  >
                    Remove
                  </button>
                </div>
                <div className="hotel-form-image-details">
                  <div className="hotel-form-group">
                    <label>Alt Text*</label>
                    <input
                      type="text"
                      value={image.alt_text}
                      onChange={(e) => handleImageDetailsChange(index, 'alt_text', e.target.value)}
                      className="hotel-form-input"
                      required
                      placeholder="Enter alt text for image"
                    />
                  </div>
                  <div className="hotel-form-group">
                    <label>Description</label>
                    <textarea
                      value={image.description}
                      onChange={(e) => handleImageDetailsChange(index, 'description', e.target.value)}
                      className="hotel-form-input"
                      placeholder="Enter description for image"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="hotel-form-group">
        <label>Description*</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          className="hotel-form-input"
          rows="5"
        />
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Meta Title* (50-60 characters)</label>
          <input
            type="text"
            name="meta_title"
            value={formData.meta_title}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
            placeholder="Enter meta title (50-60 characters)"
            maxLength={60}
          />
          <small className="character-count">
            {formData.meta_title ? `${formData.meta_title.length}/60 characters` : '0/60 characters'}
          </small>
        </div>

        <div className="hotel-form-group">
          <label>Meta Description* (150-160 characters)</label>
          <textarea
            name="meta_description"
            value={formData.meta_description}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
            placeholder="Enter meta description (150-160 characters)"
            maxLength={160}
            rows={3}
          />
          <small className="character-count">
            {formData.meta_description ? `${formData.meta_description.length}/160 characters` : '0/160 characters'}
          </small>
        </div>
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Meta Keywords* (minimum 8 keywords, separated by commas)</label>
          <textarea
            name="meta_keywords"
            value={formData.meta_keywords}
            onChange={handleInputChange}
            required
            className="hotel-form-input"
            placeholder="Enter keywords separated by commas (minimum 8)"
            rows={3}
          />
          <small className="keyword-count">
            {formData.meta_keywords ? 
              `${formData.meta_keywords.split(',').filter(k => k.trim()).length} keywords entered` : 
              '0 keywords entered'}
          </small>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button type="submit" className="hotel-form-save-btn" disabled={loading}>
          {loading ? 'Saving...' : editingHotel ? 'Update' : 'Add'} {formData.accommodation_type.charAt(0).toUpperCase() + formData.accommodation_type.slice(1)}
        </button>
        <button type="button" onClick={onCancel} className="hotel-form-cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default HotelForm; 