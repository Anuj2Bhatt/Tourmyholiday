import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import DestinationForm from './DestinationForm';
import './ManageTourism.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Update the getImageUrl helper function
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.jpg';
  if (typeof imagePath === 'object' && imagePath.url) return imagePath.url;
  if (typeof imagePath === 'string') {
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePath}`;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${imagePath}`;
  }
  return '/images/placeholder.jpg';
};

const ManageTourism = () => {
  const [activeSection, setActiveSection] = useState('trending');
  const [showForm, setShowForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/tourism`);
        if (response.data.success) {
          const mappedData = response.data.data.map(pkg => {
            // Handle gallery images
            let galleryImages = [];
            if (pkg.gallery_images) {
              if (Array.isArray(pkg.gallery_images)) {
                galleryImages = pkg.gallery_images.map(img => {
                  if (typeof img === 'object') {
                    return {
                      url: getImageUrl(img),
                      filename: img.image_path || img.filename || img
                    };
                  }
                  return {
                    url: getImageUrl(img),
                    filename: img
                  };
                });
              } else if (typeof pkg.gallery_images === 'string') {
                galleryImages = pkg.gallery_images.split(',').map(img => ({
                  url: getImageUrl(img),
                  filename: img
                }));
              }
            }

            const mapped = {
            id: pkg.id,
            title: pkg.name,
            slug: pkg.slug,
              featuredImage: pkg.featured_image ? {
                url: getImageUrl(pkg.featured_image),
                filename: pkg.featured_image
              } : null,
              imageGallery: galleryImages,
            destination: pkg.location_name || '',
            status: pkg.status || 'draft',
            trendingScore: pkg.trending_score || 0,
            shortDescription: pkg.short_description,
            description: pkg.description,
            price: pkg.price,
            duration: pkg.duration,
            bestTimeToVisit: pkg.best_time_to_visit,
            howToReach: pkg.how_to_reach,
            activities: pkg.activities,
            accommodationTypes: pkg.accommodation_types,
            metaTitle: pkg.meta_title,
            metaDescription: pkg.meta_description,
              metaKeywords: Array.isArray(pkg.meta_keywords) ? pkg.meta_keywords : 
                           (typeof pkg.meta_keywords === 'string' ? JSON.parse(pkg.meta_keywords) : []),
              isActive: Boolean(pkg.is_active),
              isFeatured: Boolean(pkg.is_featured),
              tourism_type_id: pkg.tourism_type_id,
              tourism_type: pkg.tourism_type,
              trip_style_id: pkg.trip_style_id,
              trip_style: pkg.trip_style,
              season_id: pkg.season_id,
              season: pkg.season,
              budget_category_id: pkg.budget_category_id,
              budget_category: pkg.budget_category,
              special_amenities: Array.isArray(pkg.amenities) ? pkg.amenities : 
                               (typeof pkg.amenities === 'string' ? pkg.amenities.split(',') : []),
              nearby_attractions: pkg.nearby_attractions || []
            };
            return mapped;
          });
          setTrendingDestinations(mappedData);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch destinations');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Filter and sort destinations based on search query
  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return trendingDestinations;

    const query = searchQuery.toLowerCase().trim();
    
    return [...trendingDestinations]
      .filter(destination => {
        const titleMatch = destination?.title?.toLowerCase()?.includes(query) || false;
        const destinationMatch = destination?.destination?.toLowerCase()?.includes(query) || false;
        return titleMatch || destinationMatch;
      })
      .sort((a, b) => {
        // Calculate match score for each destination
        const getMatchScore = (dest) => {
          const title = dest?.title?.toLowerCase() || '';
          const destination = dest?.destination?.toLowerCase() || '';
          let score = 0;
          
          // Exact match gets highest score
          if (title === query || destination === query) score += 100;
          
          // Starts with query gets high score
          if (title.startsWith(query) || destination.startsWith(query)) score += 50;
          
          // Contains query gets medium score
          if (title.includes(query)) score += 30;
          if (destination.includes(query)) score += 20;
          
          // Trending score as tiebreaker
          score += (dest?.trendingScore || 0) / 10;
          
          return score;
        };

        const scoreA = getMatchScore(a);
        const scoreB = getMatchScore(b);
        
        return scoreB - scoreA; // Sort in descending order
      });
  }, [trendingDestinations, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle edit button click
  const handleEdit = (id) => {
    const destination = trendingDestinations.find(dest => dest.id === id);
    if (destination) {
      const mappedDestination = {
        id: destination.id,
        name: destination.title,
        slug: destination.slug,
        short_description: destination.shortDescription || '',
        description: destination.description || '',
        price: destination.price || '',
        duration: destination.duration || '',
        tourism_type_id: destination.tourism_type_id || '',
        trip_style_id: destination.trip_style_id || '',
        season_id: destination.season_id || '',
        budget_category_id: destination.budget_category_id || '',
        location_name: destination.destination || '',
        latitude: destination.latitude || null,
        longitude: destination.longitude || null,
        featured_image: destination.featuredImage?.filename || null,
        best_time_to_visit: destination.bestTimeToVisit || '',
        how_to_reach: destination.howToReach || '',
        activities: destination.activities || '',
        accommodation_types: destination.accommodationTypes || '',
        budget_range_min: destination.budget_range_min || '',
        budget_range_max: destination.budget_range_max || '',
        meta_title: destination.metaTitle || '',
        meta_description: destination.metaDescription || '',
        meta_keywords: Array.isArray(destination.metaKeywords) ? 
          JSON.stringify(destination.metaKeywords) : 
          (typeof destination.metaKeywords === 'string' ? destination.metaKeywords : '[]'),
        status: destination.status || 'draft',
        is_active: destination.isActive ? 1 : 0,
        is_featured: destination.isFeatured ? 1 : 0,
        image_gallery: destination.imageGallery.map(img => img.filename),
        special_amenities: destination.special_amenities || []
      };
      setEditingDestination(mappedDestination);
      setShowForm(true);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      // Log the form data before submission
      // Ensure all required fields are present
      const requiredFields = [
        'name', 'slug', 'short_description', 'description', 'price',
        'duration', 'tourism_type_id', 'trip_style_id', 'season_id', 
        'budget_category_id', 'location_name', 'best_time_to_visit', 
        'how_to_reach', 'activities', 'accommodation_types',
        'budget_range_min', 'budget_range_max', 'meta_title',
        'meta_description', 'meta_keywords', 'status'
      ];

      // Log each required field's value
      requiredFields.forEach(field => {
        });

      // Check for missing required fields
      const missingFields = requiredFields.filter(field => {
        const value = formData[field];
        const isEmpty = value === undefined || value === null || value === '';
        return isEmpty;
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure meta_keywords is properly formatted
      if (typeof formData.meta_keywords === 'string' && !formData.meta_keywords.startsWith('[')) {
        formData.meta_keywords = JSON.stringify(formData.meta_keywords.split(',').map(k => k.trim()));
      }

      // Log the final form data
      if (editingDestination) {
        // Update existing destination
        const response = await axios.put(`${API_URL}/tourism/${editingDestination.id}`, formData);
        if (response.data.success) {
          const updatedDestinations = trendingDestinations.map(dest => 
            dest.id === editingDestination.id ? { ...dest, ...response.data.data } : dest
          );
          setTrendingDestinations(updatedDestinations);
        }
      } else {
        // Add new destination
        const response = await axios.post(`${API_URL}/tourism`, formData);
        if (response.data.success) {
          const newDestination = {
            id: response.data.data.id,
            ...formData,
            trendingScore: 0
          };
          setTrendingDestinations(prev => [...prev, newDestination]);
        }
      }
      setShowForm(false);
      setEditingDestination(null);
    } catch (error) {
      alert(error.message || 'Failed to save destination. Please check all required fields.');
      throw error;
    }
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        const response = await axios.delete(`${API_URL}/tourism/${id}`);
        if (response.data.success) {
          setTrendingDestinations(prev => prev.filter(dest => dest.id !== id));
        }
      } catch (error) {
        alert('Failed to delete destination. Please try again.');
      }
    }
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingDestination(null);
    setShowForm(true);
  };

  return (
    <div className="manage-tourism">
      <div className="tourism-tabs">
        <button 
          className={`tab-btn ${activeSection === 'trending' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('trending');
            setShowForm(false);
            setEditingDestination(null);
          }}
        >
          Trending Destinations
        </button>
        <button 
          className={`tab-btn ${activeSection === 'spots' ? 'active' : ''}`}
          onClick={() => setActiveSection('spots')}
        >
          Tourism Spots
        </button>
        <button 
          className={`tab-btn ${activeSection === 'virtual' ? 'active' : ''}`}
          onClick={() => setActiveSection('virtual')}
        >
          Virtual Tours
        </button>
        <button 
          className={`tab-btn ${activeSection === 'testimonials' ? 'active' : ''}`}
          onClick={() => setActiveSection('testimonials')}
        >
          Testimonials
        </button>
      </div>

      <div className="tourism-content">
        {activeSection === 'trending' && (
          <div className="section-content">
            {!showForm ? (
              <>
                <div className="section-header">
                  <div className="header-left">
                    <h2>Manage Trending Destinations</h2>
                    <p className="section-subtitle">Manage and update trending destinations across India</p>
                  </div>
                  <button className="add-new-btn" onClick={handleAddNew}>
                    <span className="icon">+</span> Add New Destination
                  </button>
                </div>

                {loading ? (
                  <div className="loading-message">Loading destinations...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <>
                    <div className="table-filters">
                      <div className="search-box">
                        <input 
                          type="text" 
                          placeholder="Search by title or destination..." 
                          className="search-input"
                          value={searchQuery}
                          onChange={handleSearch}
                        />
                        <button className="search-btn">
                          <span className="search-icon">🔍</span>
                          Search
                        </button>
                      </div>
                    </div>

                    <div className="table-container">
                      {filteredDestinations.length === 0 ? (
                        <div className="no-data-message">No destinations found</div>
                      ) : (
                        <table className="trending-table">
                          <thead>
                            <tr>
                              <th className="col-sr">Sr. No.</th>
                              <th className="col-image">Featured Image</th>
                              <th className="col-title">Title</th>
                              <th className="col-destination">Destination</th>
                              <th className="col-score">Trending Score</th>
                              <th className="col-status">Status</th>
                              <th className="col-actions">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDestinations.map((destination, index) => (
                              <tr key={destination.id}>
                                <td className="col-sr">{index + 1}</td>
                                <td className="col-image">
                                  <div className="image-preview">
                                    <img 
                                      src={destination.featuredImage?.url || getImageUrl(destination.featuredImage)} 
                                      alt={destination.title}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/images/placeholder.jpg';
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="col-title">
                                  <div className="title-cell">
                                    <span className="title-text">{destination.title}</span>
                                  </div>
                                </td>
                                <td className="col-destination">
                                  <div className="destination-cell">
                                    <span className="location-icon">📍</span>
                                    {destination.destination}
                                  </div>
                                </td>
                                <td className="col-score">
                                  <div className="trending-score-adm">
                                    <div className="score-bar">
                                      <div 
                                        className="score-fill" 
                                        style={{width: `${destination.trendingScore}%`}}
                                      ></div>
                                    </div>
                                    <span className="score-value">{destination.trendingScore}%</span>
                                  </div>
                                </td>
                                <td className="col-status">
                                  <span className={`status-badge ${destination.status.toLowerCase()}`}>
                                    {destination.status}
                                  </span>
                                </td>
                                <td className="col-actions">
                                  <div className="action-buttons">
                                    <button 
                                      className="edit-btn"
                                      onClick={() => handleEdit(destination.id)}
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      className="delete-btn"
                                      onClick={() => handleDelete(destination.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="form-container-tourism">
                <div className="form-header">
                  <h2>{editingDestination ? 'Edit Destination' : 'Add New Destination'}</h2>
                  <button 
                    className="back-btn"
                    onClick={() => {
                      setShowForm(false);
                      setEditingDestination(null);
                    }}
                  >
                    ← Back to List
                  </button>
                </div>
                <DestinationForm
                  destination={editingDestination}
                  onSubmit={handleFormSubmit}
                  onClose={() => {
                    setShowForm(false);
                    setEditingDestination(null);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {activeSection === 'spots' && (
          <div className="section-content">
            <h2>Manage Tourism Spots</h2>
            <p>This section will allow you to manage tourism spots, their categories, and seasonal information.</p>
          </div>
        )}

        {activeSection === 'virtual' && (
          <div className="section-content">
            <h2>Manage Virtual Tours</h2>
            <p>This section will allow you to manage 360° virtual tours and their descriptions.</p>
          </div>
        )}

        {activeSection === 'testimonials' && (
          <div className="section-content">
            <h2>Manage Testimonials</h2>
            <p>This section will allow you to manage traveler testimonials and reviews.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTourism; 