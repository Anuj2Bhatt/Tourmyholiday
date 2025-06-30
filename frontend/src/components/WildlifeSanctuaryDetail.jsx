import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wildlifeService } from '../services/wildlifeService';
import wildlifeFloraService from '../services/wildlifeFloraService';
import wildlifeBasicInfoService from '../services/wildlifeBasicInfoService';
import { API_URL } from '../config';
import './WildlifeSanctuaryDetail.css';

const WildlifeSanctuaryDetail = () => {
  const { slug } = useParams();
  const [sanctuary, setSanctuary] = useState(null);
  const [wildlifeFlora, setWildlifeFlora] = useState([]);
  const [basicInfo, setBasicInfo] = useState(null);
  const [media, setMedia] = useState({ images: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('media');
  const [visibleImages, setVisibleImages] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Helper function to check if section has data
  const hasData = (data, fields) => {
    if (!data) return false;
    return fields.some(field => data[field] && data[field].toString().trim() !== '');
  };

  // Helper function to check if boolean section has any true values
  const hasBooleanData = (data, fields) => {
    if (!data) return false;
    return fields.some(field => data[field] === true || data[field] === false);
  };

  useEffect(() => {
    if (slug) {
      fetchSanctuaryData();
    }
  }, [slug]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModal && event.target.classList.contains('modal-overlay')) {
        setShowModal(false);
        setSelectedItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showModal) {
        setShowModal(false);
        setSelectedItem(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const fetchSanctuaryData = async () => {
    try {
      setLoading(true);
      
      // First, get all sanctuaries to find the one with matching slug
      const allSanctuaries = await wildlifeService.getAllSanctuaries();
      const sanctuaryData = allSanctuaries.find(s => s.slug === slug);
      
      if (!sanctuaryData) {
        setError('Sanctuary not found');
        setLoading(false);
        return;
      }

      setSanctuary(sanctuaryData);

      // Fetch wildlife & flora data
      try {
        const floraData = await wildlifeFloraService.getItemsBySanctuary(sanctuaryData.id);
        setWildlifeFlora(floraData);
      } catch (error) {
        setWildlifeFlora([]);
      }

      // Fetch basic info
      try {
        const basicInfoData = await wildlifeBasicInfoService.getBasicInfoBySanctuary(sanctuaryData.id);
        // Check if the response has a data property or is directly an array
        const basicInfoArray = basicInfoData.data || basicInfoData;
        // API returns an array, so we need to get the first item
        setBasicInfo(basicInfoArray && basicInfoArray.length > 0 ? basicInfoArray[0] : null);
      } catch (error) {
        setBasicInfo(null);
      }

      // Fetch media
      try {
        const [imagesData, videosData] = await Promise.all([
          wildlifeService.getGalleryImages(sanctuaryData.id), 
          wildlifeService.getVideos(sanctuaryData.id)
        ]);
        setMedia({
          images: imagesData?.data || [],
          videos: videosData?.data || []
        });
      } catch (error) {
        setMedia({ images: [], videos: [] });
      }

    } catch (error) {
      setError('Failed to load sanctuary information');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    return `${API_URL}/uploads/${imagePath}`;
  };

  const groupWildlifeByCategory = () => {
    const grouped = {
      mammals: [],
      birds: [],
      reptiles: [],
      flora: [],
      insects: [],
      flowers: [],
      herbs: [],
      rare_species: [],
      endangered_species: []
    };

    wildlifeFlora.forEach(item => {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      }
    });

    return grouped;
  };

  const loadMoreImages = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleImages(prev => prev + 5);
      setLoadingMore(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="sanctuary-detail-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading sanctuary information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sanctuary-detail-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/wildlife" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Sanctuaries
          </Link>
        </div>
      </div>
    );
  }

  if (!sanctuary) {
    return (
      <div className="sanctuary-detail-not-found">
        <div className="not-found-message">
          <i className="fas fa-search"></i>
          <h2>Sanctuary Not Found</h2>
          <p>The sanctuary you're looking for doesn't exist.</p>
          <Link to="/wildlife" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Sanctuaries
          </Link>
        </div>
      </div>
    );
  }

  const groupedWildlife = groupWildlifeByCategory();

  return (
    <div className="sanctuary-detail-container">
      {/* Basic Sanctuary Info - Always show */}
      {sanctuary && (
        <div className="sanctuary-header">
          <h1>{sanctuary.title}</h1>
          <p className="sanctuary-location">{sanctuary.location}</p>
          {sanctuary.description && (
            <p className="sanctuary-description">{sanctuary.description}</p>
          )}
        </div>
      )}

      {/* Gallery Section */}
      {media.images.length > 0 && (
        <div className="wildlife-gallery-section">
          <h2>Gallery</h2>
          <div className="wildlife-image-gallery">
            {media.images.slice(0, visibleImages).map((image, index) => (
              <div key={image.id || index} className="wildlife-gallery-item">
                <div className="wildlife-image-container">
                <img 
                  src={getImageUrl(image.image_path)} 
                  alt={image.alt_text || `Gallery image ${index + 1}`}
                  loading="lazy"
                />
                </div>
              </div>
            ))}
          </div>
          {media.images.length > visibleImages && (
            <div className="load-more-container">
              <button 
                className="load-more-btn"
                onClick={loadMoreImages}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i>
                    Load More Images
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Basic Info Section */}
      {basicInfo ? (
        <div className="basic-info-section">
          <h2>Basic Information</h2>
          <div className="basic-info-single-column">
            
            {/* About the Sanctuary */}
            {hasData(basicInfo, ['about_sanctuary']) && (
              <div className="info-card">
                <h3>About the Sanctuary</h3>
                <p>{basicInfo.about_sanctuary || sanctuary.description || 'Information not available'}</p>
              </div>
            )}

            {/* Basic Details and Entry Fees in 2x2 grid */}
            <div className="basic-info-grid-2x2">
              {/* Basic Details */}
              {hasData(basicInfo, ['location', 'total_area', 'established_year']) && (
                <div className="info-card">
                  <h3>Basic Details</h3>
                  {basicInfo.location && (
                    <div className="info-item">
                      <span className="label">Location:</span>
                      <span className="value">{basicInfo.location}</span>
                    </div>
                  )}
                  {basicInfo.total_area && (
                    <div className="info-item">
                      <span className="label">Total Area:</span>
                      <span className="value">{basicInfo.total_area}</span>
                    </div>
                  )}
                  {basicInfo.established_year && (
                    <div className="info-item">
                      <span className="label">Established Year:</span>
                      <span className="value">{basicInfo.established_year}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Entry Fees */}
              <div className="info-card">
                <h3>Entry Fees & Charges</h3>
                <div className="fees-table-container">
                  <table className="fees-table">
                    <tbody>
                      {basicInfo.entry_fee_adults && (
                        <tr>
                          <td className="fee-label">Adults</td>
                          <td className="fee-value">₹{basicInfo.entry_fee_adults}</td>
                        </tr>
                      )}
                      {basicInfo.entry_fee_children && (
                        <tr>
                          <td className="fee-label">Children</td>
                          <td className="fee-value">₹{basicInfo.entry_fee_children}</td>
                        </tr>
                      )}
                      {basicInfo.entry_fee_foreign && (
                        <tr>
                          <td className="fee-label">Foreign Nationals</td>
                          <td className="fee-value">₹{basicInfo.entry_fee_foreign}</td>
                        </tr>
                      )}
                      {basicInfo.camera_fee && (
                        <tr>
                          <td className="fee-label">Camera Fee</td>
                          <td className="fee-value">₹{basicInfo.camera_fee}</td>
                        </tr>
                      )}
                      {basicInfo.video_camera_fee && (
                        <tr>
                          <td className="fee-label">Video Camera Fee</td>
                          <td className="fee-value">₹{basicInfo.video_camera_fee}</td>
                        </tr>
                      )}
                      {basicInfo.parking_fee && (
                        <tr>
                          <td className="fee-label">Parking Fee</td>
                          <td className="fee-value">₹{basicInfo.parking_fee}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Timings & Seasons and Transportation in 2x2 grid */}
            <div className="basic-info-grid-2x2">
              {/* Timings & Seasons */}
              {hasData(basicInfo, ['opening_time', 'closing_time', 'best_time_to_visit', 'peak_season', 'off_season']) && (
                <div className="info-card">
                  <h3>Timings & Seasons</h3>
                  {basicInfo.opening_time && (
                    <div className="info-item">
                      <span className="label">Opening Time:</span>
                      <span className="value">{basicInfo.opening_time}</span>
                    </div>
                  )}
                  {basicInfo.closing_time && (
                    <div className="info-item">
                      <span className="label">Closing Time:</span>
                      <span className="value">{basicInfo.closing_time}</span>
                    </div>
                  )}
                  {basicInfo.best_time_to_visit && (
                    <div className="info-item">
                      <span className="label">Best Time to Visit:</span>
                      <span className="value">{basicInfo.best_time_to_visit}</span>
                    </div>
                  )}
                  {basicInfo.peak_season && (
                    <div className="info-item">
                      <span className="label">Peak Season:</span>
                      <span className="value">{basicInfo.peak_season}</span>
                    </div>
                  )}
                  {basicInfo.off_season && (
                    <div className="info-item">
                      <span className="label">Off Season:</span>
                      <span className="value">{basicInfo.off_season}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Transportation */}
              {hasData(basicInfo, ['nearest_airport', 'nearest_railway', 'nearest_bus_stand']) && (
                <div className="info-card">
                  <h3>Transportation</h3>
                  {basicInfo.nearest_airport && (
                    <div className="info-item">
                      <span className="label">Nearest Airport:</span>
                      <span className="value">{basicInfo.nearest_airport}</span>
                    </div>
                  )}
                  {basicInfo.distance_from_airport && (
                    <div className="info-item">
                      <span className="label">Distance from Airport:</span>
                      <span className="value">{basicInfo.distance_from_airport}</span>
                    </div>
                  )}
                  {basicInfo.nearest_railway && (
                    <div className="info-item">
                      <span className="label">Nearest Railway:</span>
                      <span className="value">{basicInfo.nearest_railway}</span>
                    </div>
                  )}
                  {basicInfo.distance_from_railway && (
                    <div className="info-item">
                      <span className="label">Distance from Railway:</span>
                      <span className="value">{basicInfo.distance_from_railway}</span>
                    </div>
                  )}
                  {basicInfo.nearest_bus_stand && (
                    <div className="info-item">
                      <span className="label">Nearest Bus Stand:</span>
                      <span className="value">{basicInfo.nearest_bus_stand}</span>
                    </div>
                  )}
                  {basicInfo.distance_from_bus_stand && (
                    <div className="info-item">
                      <span className="label">Distance from Bus Stand:</span>
                      <span className="value">{basicInfo.distance_from_bus_stand}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Facilities and Contact Information in 2x2 grid */}
            <div className="basic-info-grid-2x2">
              {/* Facilities */}
              {hasData(basicInfo, ['parking_available', 'restroom_facilities', 'drinking_water', 'first_aid_facility', 'souvenir_shop', 'food_court']) && (
                <div className="info-card">
                  <h3>Facilities</h3>
                  {basicInfo.parking_available && (
                    <div className="info-item">
                      <span className="label">Parking Available:</span>
                      <span className="value">{basicInfo.parking_available}</span>
                    </div>
                  )}
                  {basicInfo.restroom_facilities && (
                    <div className="info-item">
                      <span className="label">Restroom Facilities:</span>
                      <span className="value">{basicInfo.restroom_facilities}</span>
                    </div>
                  )}
                  {basicInfo.drinking_water && (
                    <div className="info-item">
                      <span className="label">Drinking Water:</span>
                      <span className="value">{basicInfo.drinking_water}</span>
                    </div>
                  )}
                  {basicInfo.first_aid_facility && (
                    <div className="info-item">
                      <span className="label">First Aid Facility:</span>
                      <span className="value">{basicInfo.first_aid_facility}</span>
                    </div>
                  )}
                  {basicInfo.souvenir_shop && (
                    <div className="info-item">
                      <span className="label">Souvenir Shop:</span>
                      <span className="value">{basicInfo.souvenir_shop}</span>
                    </div>
                  )}
                  {basicInfo.food_court && (
                    <div className="info-item">
                      <span className="label">Food Court:</span>
                      <span className="value">{basicInfo.food_court}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              {hasData(basicInfo, ['contact_number', 'email_address', 'website', 'emergency_contact']) && (
                <div className="info-card">
                  <h3>Contact Information</h3>
                  {basicInfo.contact_number && (
                    <div className="info-item">
                      <span className="label">Contact Number:</span>
                      <span className="value">{basicInfo.contact_number}</span>
                    </div>
                  )}
                  {basicInfo.email_address && (
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{basicInfo.email_address}</span>
                    </div>
                  )}
                  {basicInfo.website && (
                    <div className="info-item">
                      <span className="label">Website:</span>
                      <span className="value">
                        <a href={basicInfo.website} target="_blank" rel="noopener noreferrer">
                          {basicInfo.website}
                        </a>
                      </span>
                    </div>
                  )}
                  {basicInfo.emergency_contact && (
                    <div className="info-item">
                      <span className="label">Emergency Contact:</span>
                      <span className="value">{basicInfo.emergency_contact}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* How to Reach */}
            {hasData(basicInfo, ['nearest_airport', 'nearest_railway', 'nearest_bus_stand']) && (
              <div className="info-card">
                <h3>How to Reach</h3>
                <div className="transportation-table-container">
                  <table className="transportation-table">
                    <thead>
                      <tr>
                        <th>Transport Mode</th>
                        <th>Nearest Station</th>
                        <th>Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {basicInfo.nearest_airport && (
                        <tr>
                          <td><i className="fas fa-plane"></i> By Air</td>
                          <td>{basicInfo.nearest_airport}</td>
                          <td>{basicInfo.distance_from_airport || 'Not specified'}</td>
                        </tr>
                      )}
                      {basicInfo.nearest_railway && (
                        <tr>
                          <td><i className="fas fa-train"></i> By Train</td>
                          <td>{basicInfo.nearest_railway}</td>
                          <td>{basicInfo.distance_from_railway || 'Not specified'}</td>
                        </tr>
                      )}
                      {basicInfo.nearest_bus_stand && (
                        <tr>
                          <td><i className="fas fa-bus"></i> By Bus</td>
                          <td>{basicInfo.nearest_bus_stand}</td>
                          <td>{basicInfo.distance_from_bus_stand || 'Not specified'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Accessibility */}
            {hasBooleanData(basicInfo, ['wheelchair_accessible', 'senior_citizen_friendly', 'child_friendly']) && (
              <div className="info-card">
                <h3>Accessibility</h3>
                <div className="accessibility-table-container">
                  <table className="accessibility-table">
                    <thead>
                      <tr>
                        <th>Accessibility Feature</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><i className="fas fa-wheelchair"></i> Wheelchair Accessible</td>
                        <td className={basicInfo.wheelchair_accessible ? 'available' : 'not-available'}>
                          {basicInfo.wheelchair_accessible ? 'Yes' : 'No'}
                        </td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-user-friends"></i> Senior Citizen Friendly</td>
                        <td className={basicInfo.senior_citizen_friendly ? 'available' : 'not-available'}>
                          {basicInfo.senior_citizen_friendly ? 'Yes' : 'No'}
                        </td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-baby"></i> Child Friendly</td>
                        <td className={basicInfo.child_friendly ? 'available' : 'not-available'}>
                          {basicInfo.child_friendly ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Visitor Capacity */}
            {hasData(basicInfo, ['daily_visitor_capacity', 'max_group_size']) && (
              <div className="info-card" data-section="visitor-capacity">
                <h3>Visitor Capacity</h3>
                {basicInfo.daily_visitor_capacity && (
                  <div className="info-item">
                    <span className="label">Daily Visitor Capacity:</span>
                    <span className="value">{basicInfo.daily_visitor_capacity}</span>
                  </div>
                )}
                {basicInfo.max_group_size && (
                  <div className="info-item">
                    <span className="label">Maximum Group Size:</span>
                    <span className="value">{basicInfo.max_group_size}</span>
                  </div>
                )}
              </div>
            )}

            {/* Photography & Rules */}
            {hasBooleanData(basicInfo, ['photography_allowed', 'drone_photography_allowed', 'flash_photography_allowed', 'tripod_allowed']) && (
              <div className="info-card" data-section="photography">
                <h3>Photography & Rules</h3>
                <div className="accessibility-table-container">
                  <table className="accessibility-table">
                    <thead>
                      <tr>
                        <th>Photography Feature</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><i className="fas fa-camera"></i> Photography Allowed</td>
                        <td className={basicInfo.photography_allowed ? 'available' : 'not-available'}>
                          {basicInfo.photography_allowed ? 'Yes' : 'No'}
                        </td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-drone"></i> Drone Photography</td>
                        <td className={basicInfo.drone_photography_allowed ? 'available' : 'not-available'}>
                          {basicInfo.drone_photography_allowed ? 'Yes' : 'No'}
                        </td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-bolt"></i> Flash Photography</td>
                        <td className={basicInfo.flash_photography_allowed ? 'available' : 'not-available'}>
                          {basicInfo.flash_photography_allowed ? 'Yes' : 'No'}
                        </td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-tripod"></i> Tripod Allowed</td>
                        <td className={basicInfo.tripod_allowed ? 'available' : 'not-available'}>
                          {basicInfo.tripod_allowed ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Permits & Booking */}
            {(hasBooleanData(basicInfo, ['advance_booking_required', 'online_booking_available', 'permit_required']) || hasData(basicInfo, ['permit_fee', 'permit_validity'])) && (
              <div className="info-card" data-section="permits">
                <h3>Permits & Booking</h3>
                <div className="accessibility-table-container">
                  <table className="accessibility-table">
                    <thead>
                      <tr>
                        <th>Booking Feature</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><i className="fas fa-calendar-check"></i> Advance Booking Required</td>
                        <td className={basicInfo.advance_booking_required ? 'available' : 'not-available'}>
                          {basicInfo.advance_booking_required ? 'Yes' : 'No'}
                        </td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-globe"></i> Online Booking Available</td>
                        <td className={basicInfo.online_booking_available ? 'available' : 'not-available'}>
                          {basicInfo.online_booking_available ? 'Yes' : 'No'}
                        </td>
                      </tr>
                      <tr>
                        <td><i className="fas fa-file-alt"></i> Special Permit Required</td>
                        <td className={basicInfo.permit_required ? 'available' : 'not-available'}>
                          {basicInfo.permit_required ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {basicInfo.permit_fee && (
                  <div className="info-item">
                    <span className="label">Permit Fee:</span>
                    <span className="value">₹{basicInfo.permit_fee}</span>
                  </div>
                )}
                {basicInfo.permit_validity && (
                  <div className="info-item">
                    <span className="label">Permit Validity:</span>
                    <span className="value">{basicInfo.permit_validity}</span>
                  </div>
                )}
              </div>
            )}

            {/* Weather & Climate */}
            {hasData(basicInfo, ['temperature_range', 'monsoon_info', 'weather_info']) && (
              <div className="info-card" data-section="weather">
                <h3>Weather & Climate</h3>
                {basicInfo.temperature_range && (
                  <div className="info-item">
                    <span className="label">Temperature Range:</span>
                    <span className="value">{basicInfo.temperature_range}</span>
                  </div>
                )}
                {basicInfo.monsoon_info && (
                  <div className="info-item">
                    <span className="label">Monsoon Information:</span>
                    <span className="value">{basicInfo.monsoon_info}</span>
                  </div>
                )}
                {basicInfo.weather_info && (
                  <div className="info-item">
                    <span className="label">Weather Information:</span>
                    <span className="value long-text">{basicInfo.weather_info}</span>
                  </div>
                )}
              </div>
            )}

            {/* Visitor Guidelines */}
            {hasData(basicInfo, ['dress_code', 'what_to_carry', 'what_not_to_carry', 'safety_guidelines', 'rules_and_regulations']) && (
              <div className="info-card" data-section="guidelines">
                <h3>Visitor Guidelines</h3>
                {basicInfo.dress_code && (
                  <div className="info-item">
                    <span className="label">Dress Code:</span>
                    <span className="value long-text">{basicInfo.dress_code}</span>
                  </div>
                )}
                {basicInfo.what_to_carry && (
                  <div className="info-item">
                    <span className="label">What to Carry:</span>
                    <span className="value long-text">{basicInfo.what_to_carry}</span>
                  </div>
                )}
                {basicInfo.what_not_to_carry && (
                  <div className="info-item">
                    <span className="label">What Not to Carry:</span>
                    <span className="value long-text">{basicInfo.what_not_to_carry}</span>
                  </div>
                )}
                {basicInfo.safety_guidelines && (
                  <div className="info-item">
                    <span className="label">Safety Guidelines:</span>
                    <span className="value long-text">{basicInfo.safety_guidelines}</span>
                  </div>
                )}
                {basicInfo.rules_and_regulations && (
                  <div className="info-item">
                    <span className="label">Rules & Regulations:</span>
                    <span className="value long-text">{basicInfo.rules_and_regulations}</span>
                  </div>
                )}
              </div>
            )}

            {/* Additional Information */}
            {hasData(basicInfo, ['special_instructions', 'important_notes', 'cancellation_policy', 'refund_policy']) && (
              <div className="info-card" data-section="additional">
                <h3>Additional Information</h3>
                {basicInfo.special_instructions && (
                  <div className="info-item">
                    <span className="label">Special Instructions:</span>
                    <span className="value long-text">{basicInfo.special_instructions}</span>
                  </div>
                )}
                {basicInfo.important_notes && (
                  <div className="info-item">
                    <span className="label">Important Notes:</span>
                    <span className="value long-text">{basicInfo.important_notes}</span>
                  </div>
                )}
                {basicInfo.cancellation_policy && (
                  <div className="info-item">
                    <span className="label">Cancellation Policy:</span>
                    <span className="value long-text">{basicInfo.cancellation_policy}</span>
                  </div>
                )}
                {basicInfo.refund_policy && (
                  <div className="info-item">
                    <span className="label">Refund Policy:</span>
                    <span className="value long-text">{basicInfo.refund_policy}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="no-info-available">
          <i className="fas fa-info-circle"></i>
          <h3>Information Coming Soon</h3>
          <p>Basic information for this sanctuary will be updated shortly.</p>
        </div>
      )}

      {/* Wildlife Section */}
      {wildlifeFlora.length > 0 && (
        <div className="wildlife-section">
          <h2>Wildlife & Flora</h2>
          <div className="wildlife-categories">
            {Object.entries(groupedWildlife).map(([category, items]) => (
              items.length > 0 && (
                <div key={category} className="wildlife-category" data-category={category}>
                  <h3>{category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}</h3>
                  <div className="wildlife-items">
                    {items.map((item, index) => (
                      <div 
                        key={item.id || index} 
                        className="wildlife-item"
                        onClick={() => handleCardClick(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.image_path && (
                          <div className="wildlife-item-image">
                            <img 
                              src={getImageUrl(item.image_path)} 
                              alt={item.name}
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="wildlife-item-info">
                          <h4>{item.name}</h4>
                          {item.description && <p>{item.description}</p>}
                          {item.scientific_name && (
                            <p className="scientific-name">
                              {item.scientific_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Back to Sanctuaries Link */}
      <div className="back-to-sanctuaries">
        <Link to="/wildlife" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Wildlife Sanctuaries
        </Link>
      </div>

      {/* Detailed Article Modal */}
      {showModal && selectedItem && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                setShowModal(false);
                setSelectedItem(null);
              }}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: '#222',
                color: '#fff',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: '50%',
                zIndex: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
              aria-label="Close"
            >
              ✕
            </button>
            {selectedItem.image_path && (
              <div style={{ 
                marginBottom: '20px',
                width: '100%',
                height: 'auto',
                overflow: 'hidden',
                borderRadius: '12px'
              }}>
                <img 
                  src={getImageUrl(selectedItem.image_path)} 
                  alt={selectedItem.name}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
            {selectedItem.description && (
              <p style={{ 
                margin: 0, 
                lineHeight: '1.7', 
                fontSize: '1.08rem',
                color: '#222',
                fontWeight: 400
              }}>
                {selectedItem.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WildlifeSanctuaryDetail;