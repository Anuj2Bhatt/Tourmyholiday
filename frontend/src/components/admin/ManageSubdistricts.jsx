import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import './ManageSubdistricts.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/ManageSubdistricts.css';
import WeatherActivityForm from './WeatherActivityForm';
import SeasonalGuideForm from './SeasonalGuideForm';
import TouristFeatureForm 

from './TouristFeatureForm';
import '../../styles/SeasonalGuides.css';

const TABS = [
  { key: 'districts', label: 'Districts' },
  { key: 'attractions', label: 'Attractions' },
  { key: 'culture', label: 'Culture' },
  { key: 'travel', label: 'Travel' },
  { key: 'images', label: 'Gallery' },
  { key: 'weather', label: 'Weather' },
  { key: 'virtual_tour', label: 'Virtual Tour' },
  { key: 'adventure', label: 'Adventure' }
];

const API_URL = 'http://localhost:5000';

const ManageSubdistricts = () => {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [territories, setTerritories] = useState([]);
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [subdistricts, setSubdistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);   
  const [subdistrictsLoading, setSubdistrictsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',  
    slug: '',
    description: '',
    status: 'publish',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    latitude: '',
    longitude: '',
    featured_image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [metaErrors, setMetaErrors] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [failedImages, setFailedImages] = useState(new Set());

  // Add tab state
  const [activeTab, setActiveTab] = useState('districts');

  // Inline add/edit state
  const [editingId, setEditingId] = useState(null); // id of subdistrict being edited, or 'new' for add
  const [editRowData, setEditRowData] = useState({
    title: '',
    slug: '',
    description: '',
    status: 'publish',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  // Attractions tab state
  const [showAttractionDashboard, setShowAttractionDashboard] = useState(false);
  const [isEditingAttraction, setIsEditingAttraction] = useState(false);
  const [attractionFormData, setAttractionFormData] = useState({
    id: null,
    title: '',
    slug: '',
    featured_image: null,
    featured_image_preview: null,
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  // Attractions save handler
  const [attractionError, setAttractionError] = useState(null);

  // Add attractions state
  const [attractions, setAttractions] = useState([]);
  const [attractionsLoading, setAttractionsLoading] = useState(false);

  // Add state to track if attractions should be shown
  const [showAttractionsList, setShowAttractionsList] = useState(false);

  // Move selectedSubdistrict state above fetchAttractions and any function/hook that uses it
  const [selectedSubdistrict, setSelectedSubdistrict] = useState(null);

  // Add state to track paste attempts and warnings for meta fields
  const [metaPasteAttempts, setMetaPasteAttempts] = useState({
    meta_title: 0,
    meta_description: 0,
    meta_keywords: 0
  });
  const [metaPasteWarning, setMetaPasteWarning] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  // Add culture & heritage state
  const [showCultureDashboard, setShowCultureDashboard] = useState(false);
  const [isEditingCulture, setIsEditingCulture] = useState(false);
  const [cultureFormData, setCultureFormData] = useState({
    id: null,
    title: '',
    slug: '',
    featured_image: null,
    featured_image_preview: null,
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [cultureError, setCultureError] = useState(null);
  const [cultures, setCultures] = useState([]);
  const [culturesLoading, setCulturesLoading] = useState(false);
  const [showCulturesList, setShowCulturesList] = useState(false);

  // Add travel information state
  const [showTravelDashboard, setShowTravelDashboard] = useState(false);
  const [isEditingTravel, setIsEditingTravel] = useState(false);
  const [travelFormData, setTravelFormData] = useState({
    id: null,
    title: '',  // Changed from meta_title to title
    slug: '',
    featured_image: null,
    featured_image_preview: null,
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    best_time_to_visit: '',
    how_to_reach: '',
    accommodation: '',
    local_transport: '',
    safety_tips: ''
  });
  const [travelError, setTravelError] = useState(null);
  const [travels, setTravels] = useState([]);
  const [travelsLoading, setTravelsLoading] = useState(false);
  const [showTravelsList, setShowTravelsList] = useState(false);

  // Add back the missing state declarations
  const [success, setSuccess] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingTravelInfo, setEditingTravelInfo] = useState(null);
  const [showTravelForm, setShowTravelForm] = useState(false);

  // Add new state for image management
  const [showImageDashboard, setShowImageDashboard] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageFormData, setImageFormData] = useState({
    id: null,
    image: null,
    image_preview: null,
    alt_text: '',
    description: '',
    subdistrict_id: null
  });
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [showImagesList, setShowImagesList] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Add these state variables after other state declarations
  const [adventureActivities, setAdventureActivities] = useState([]);
  const [showAdventureDashboard, setShowAdventureDashboard] = useState(false);
  const [editingAdventure, setEditingAdventure] = useState(null);
  const [adventureFormData, setAdventureFormData] = useState({
    title: '',
    slug: '',
    category: 'trekking',
    description: '',
    difficulty_level: 'easy',
    duration: '',
    best_season: '',
    location_details: '',
    coordinates: '',
    featured_image: null,
    gallery_images: [],
    safety_guidelines: '',
    required_permits: '',
    contact_info: '',
    price_range: ''
  });

  // Add virtual tour state variables
  const [showVirtualTourDashboard, setShowVirtualTourDashboard] = useState(false);
  const [virtualTourFormData, setVirtualTourFormData] = useState({
    id: null,
    title: '',
    slug: '',
    description: '',
    featured_image: null,
    featured_image_preview: null,
    scenes: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [virtualTourError, setVirtualTourError] = useState(null);
  const [virtualTours, setVirtualTours] = useState([]);
  const [virtualToursLoading, setVirtualToursLoading] = useState(false);
  const [selectedScene, setSelectedScene] = useState(null);

  // Weather related state variables - keep only this set
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [seasonalGuides, setSeasonalGuides] = useState([]);
  const [weatherStats, setWeatherStats] = useState([]);
  const [touristFeatures, setTouristFeatures] = useState([]);
  const [weatherActivities, setWeatherActivities] = useState([]);

  // Weather management state
  const [showWeatherAlertForm, setShowWeatherAlertForm] = useState(false);
  const [showSeasonalGuideForm, setShowSeasonalGuideForm] = useState(false);
  const [showWeatherStatsForm, setShowWeatherStatsForm] = useState(false);
  const [showTouristFeatureForm, setShowTouristFeatureForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  // Add weather form data states
  const [weatherAlertFormData, setWeatherAlertFormData] = useState({
    type: '',
    severity: 'medium',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    affected_areas: []
  });

  const [seasonalGuideFormData, setSeasonalGuideFormData] = useState({
    month: '',
    temperature_range: '',
    rainfall: '',
    activities: '',
    packing_suggestions: '',
    best_time: false
  });

  const [weatherStatsFormData, setWeatherStatsFormData] = useState({
    month: '',
    avg_temperature: '',
    rainfall: '',
    humidity: '',
    wind_speed: '',
    wind_direction: ''
  });

  const [touristFeatureFormData, setTouristFeatureFormData] = useState({
    feature_type: '',
    title: '',
    description: '',
    best_time: '',
    recommendations: ''
  });

  const [activityFormData, setActivityFormData] = useState({
    activity_type: '',
    title: '',
    description: '',
    weather_requirements: '',
    indoor_outdoor: 'outdoor',
    best_season: '',
    recommendations: ''
  });

  const fetchWeatherData = async () => {
    if (!selectedSubdistrict?.id) {
      console.log('No subdistrict ID provided for weather data fetch');
      return;
    }
    try {
      setWeatherLoading(true);
      // Fetch current weather from new backend endpoint
      const weatherResponse = await axios.get(`${API_URL}/api/weather/${selectedSubdistrict.id}`);
      setWeatherData(weatherResponse.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [selectedSubdistrict]);

  // Add this function to render weather alerts
  const renderWeatherAlerts = () => {
    if (!weatherData?.alerts?.length) {
      return <p className="no-data-message">No active weather alerts</p>;
    }

    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Severity</th>
            <th>Title</th>
            <th>Duration</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.alerts.map((alert, index) => (
            <tr key={index}>
              <td>{alert.type}</td>
              <td>
                <span className={`severity-badge ${alert.severity.toLowerCase()}`}>
                  {alert.severity}
                </span>
              </td>
              <td>{alert.title}</td>
              <td>
                {new Date(alert.start_date).toLocaleDateString()} - {new Date(alert.end_date).toLocaleDateString()}
              </td>
              <td>{alert.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Add this function to render current weather
  const renderCurrentWeather = () => {
    if (!weatherData?.current) {
      return null;
    }
    const { current } = weatherData;
    return (
      <div className="current-weather">
        <h4>Current Weather</h4>
        <div className="weather-info">
          <div className="weather-main">
            <div>
              <div className="temperature">{current.temperature}°C</div>
              <div className="weather-description">Weather Code: {current.weatherCode}</div>
              <div>Rain Intensity: {current.rainIntensity}</div>
              <div>Precipitation Probability: {current.precipitationProbability}%</div>
              <div>Time: {new Date(current.time).toLocaleString()}</div>
            </div>
          </div>
          <div className="weather-details">
            <div>Humidity: {current.humidity}%</div>
            <div>Wind: {current.wind_speed} m/s</div>
          </div>
        </div>
      </div>
    );
  };

  // Add this function to render weather forecast
  const renderWeatherForecast = () => {
    if (!weatherData?.forecast?.length) {
      return <div className="weather-section"><p className="no-data-message">No forecast data available</p></div>;
    }

    return (
      <div className="weather-section">
        <h3>Weather Forecast</h3>
        <div className="forecast-grid">
          {weatherData.forecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <div className="forecast-date">
                {new Date(day.date).toLocaleDateString()}
                </div>
              <img 
                src={`http://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                alt={day.weather_description}
                className="forecast-icon"
              />
                <div className="forecast-temp">
                {Math.round(day.temperature.max)}°C / {Math.round(day.temperature.min)}°C
                </div>
              <div className="forecast-desc">{day.weather_description}</div>
              </div>
          ))}
        </div>
      </div>
    );
  };

  // Add these handler functions after other handler functions
  const handleAddNewAdventure = () => {
    setAdventureFormData({
      title: '',
      slug: '',
      category: 'trekking',
      description: '',
      difficulty_level: 'easy',
      duration: '',
      best_season: '',
      location_details: '',
      coordinates: '',
      featured_image: null,
      gallery_images: [],
      safety_guidelines: '',
      required_permits: '',
      contact_info: '',
      price_range: ''
    });
    setEditingAdventure(null);
    setShowAdventureDashboard(true);
  };

  const handleEditAdventure = (adventure) => {
    setAdventureFormData({
      ...adventure,
      featured_image: null,
      gallery_images: adventure.gallery_images || []
    });
    setEditingAdventure(adventure);
    setShowAdventureDashboard(true);
  };

  const handleAdventureFieldChange = (e) => {
    const { name, value } = e.target;
    setAdventureFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdventureImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdventureFormData(prev => ({
        ...prev,
        featured_image: file
      }));
    }
  };

  const handleCancelAdventureDashboard = () => {
    setShowAdventureDashboard(false);
    setEditingAdventure(null);
    setAdventureFormData({
      title: '',
      slug: '',
      category: 'trekking',
      description: '',
      difficulty_level: 'easy',
      duration: '',
      best_season: '',
      location_details: '',
      coordinates: '',
      featured_image: null,
      gallery_images: [],
      safety_guidelines: '',
      required_permits: '',
      contact_info: '',
      price_range: ''
    });
  };

  const handleSaveAdventure = async () => {
    try {
      const formData = new FormData();
      Object.keys(adventureFormData).forEach(key => {
        if (key === 'gallery_images') {
          formData.append(key, JSON.stringify(adventureFormData[key]));
        } else if (key === 'featured_image' && adventureFormData[key]) {
          formData.append(key, adventureFormData[key]);
        } else if (key !== 'featured_image') {
          formData.append(key, adventureFormData[key]);
        }
      });

      // Generate slug if not provided
      if (!adventureFormData.slug) {
        formData.set('slug', generateSlug(adventureFormData.title));
      }

      const endpoint = selectedSubdistrict.is_territory
        ? `/api/adventure-activities/territory${editingAdventure ? `/${editingAdventure.id}` : ''}`
        : `/api/adventure-activities/state${editingAdventure ? `/${editingAdventure.id}` : ''}`;

      const method = editingAdventure ? 'PUT' : 'POST';
      if (!editingAdventure) {
        formData.append(
          selectedSubdistrict.is_territory ? 'territory_subdistrict_id' : 'subdistrict_id',
          selectedSubdistrict.id
        );
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save adventure activity');
      }

      // Refresh the activities list
      fetchAdventureActivities();
      handleCancelAdventureDashboard();
    } catch (error) {
      console.error('Error saving adventure activity:', error);
      alert('Failed to save adventure activity. Please try again.');
    }
  };

  const handleDeleteAdventure = async (adventureId) => {
    if (!window.confirm('Are you sure you want to delete this adventure activity?')) {
      return;
    }

    try {
      const endpoint = selectedSubdistrict.is_territory
        ? `/api/adventure-activities/territory/${adventureId}`
        : `/api/adventure-activities/state/${adventureId}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete adventure activity');
      }

      // Refresh the activities list
      fetchAdventureActivities();
    } catch (error) {
      console.error('Error deleting adventure activity:', error);
      alert('Failed to delete adventure activity. Please try again.');
    }
  };

  const fetchAdventureActivities = async () => {
    if (!selectedSubdistrict) return;

    try {
      const endpoint = selectedSubdistrict.is_territory
        ? `/api/adventure-activities/territory/${selectedSubdistrict.id}`
        : `/api/adventure-activities/state/${selectedSubdistrict.id}`;

      const response = await fetch(`${API_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error('Failed to fetch adventure activities');
      }

      const data = await response.json();
      setAdventureActivities(data);
    } catch (error) {
      console.error('Error fetching adventure activities:', error);
      setAdventureActivities([]);
    }
  };

  // Add this to useEffect where other fetch calls are made
  useEffect(() => {
    if (selectedSubdistrict) {
      fetchAdventureActivities();
    }
  }, [selectedSubdistrict]);

  // Add this to the renderTabContent function
  const renderAdventureActivitiesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Adventure Activities</h3>
        <button
          onClick={handleAddNewAdventure}
          className="manage-btn manage-btn-primary"
        >
          Add New Activity
        </button>
      </div>

      {showAdventureDashboard ? (
        <div className="manage-card">
          <div className="manage-card-content">
            <h4 className="manage-card-title mb-4">
              {editingAdventure ? 'Edit Adventure Activity' : 'Add New Adventure Activity'}
            </h4>
            <div className="manage-form-grid">
              <div className="manage-form-group">
                <label className="manage-form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={adventureFormData.title}
                  onChange={handleAdventureFieldChange}
                  className="manage-form-input"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Category</label>
                <select
                  name="category"
                  value={adventureFormData.category}
                  onChange={handleAdventureFieldChange}
                  className="manage-form-select"
                >
                  <option value="trekking">Trekking</option>
                  <option value="adventure_sports">Adventure Sports</option>
                  <option value="nature_trails">Nature Trails</option>
                  <option value="wildlife">Wildlife</option>
                  <option value="camping">Camping</option>
                </select>
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Difficulty Level</label>
                <select
                  name="difficulty_level"
                  value={adventureFormData.difficulty_level}
                  onChange={handleAdventureFieldChange}
                  className="manage-form-select"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={adventureFormData.duration}
                  onChange={handleAdventureFieldChange}
                  placeholder="e.g., 2-3 hours"
                  className="manage-form-input"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Best Season</label>
                <input
                  type="text"
                  name="best_season"
                  value={adventureFormData.best_season}
                  onChange={handleAdventureFieldChange}
                  placeholder="e.g., October to March"
                  className="manage-form-input"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Price Range</label>
                <input
                  type="text"
                  name="price_range"
                  value={adventureFormData.price_range}
                  onChange={handleAdventureFieldChange}
                  placeholder="e.g., ₹500-2000"
                  className="manage-form-input"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Description</label>
                <textarea
                  name="description"
                  value={adventureFormData.description}
                  onChange={handleAdventureFieldChange}
                  rows="3"
                  className="manage-form-textarea"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Location Details</label>
                <textarea
                  name="location_details"
                  value={adventureFormData.location_details}
                  onChange={handleAdventureFieldChange}
                  rows="2"
                  className="manage-form-textarea"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Coordinates</label>
                <input
                  type="text"
                  name="coordinates"
                  value={adventureFormData.coordinates}
                  onChange={handleAdventureFieldChange}
                  placeholder="e.g., 28.6139° N, 77.2090° E"
                  className="manage-form-input"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Featured Image</label>
                <div className="manage-file-input">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdventureImageChange}
                    className="manage-file-input"
                  />
                  <div className="manage-file-input-label">
                    {adventureFormData.featured_image ? 'Change Image' : 'Choose Image'}
                  </div>
                </div>
                {adventureFormData.featured_image && (
                  <img
                    src={URL.createObjectURL(adventureFormData.featured_image)}
                    alt="Preview"
                    className="manage-image-preview"
                  />
                )}
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Safety Guidelines</label>
                <textarea
                  name="safety_guidelines"
                  value={adventureFormData.safety_guidelines}
                  onChange={handleAdventureFieldChange}
                  rows="2"
                  className="manage-form-textarea"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Required Permits</label>
                <textarea
                  name="required_permits"
                  value={adventureFormData.required_permits}
                  onChange={handleAdventureFieldChange}
                  rows="2"
                  className="manage-form-textarea"
                />
              </div>
              <div className="manage-form-group">
                <label className="manage-form-label">Contact Information</label>
                <textarea
                  name="contact_info"
                  value={adventureFormData.contact_info}
                  onChange={handleAdventureFieldChange}
                  rows="2"
                  className="manage-form-textarea"
                />
              </div>
            </div>
            <div className="manage-action-buttons">
              <button
                onClick={handleCancelAdventureDashboard}
                className="manage-btn manage-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdventure}
                className="manage-btn manage-btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="manage-grid">
          {adventureActivities.length === 0 ? (
            <div className="manage-empty-state">
              <div className="manage-empty-state-icon">🏔️</div>
              <div className="manage-empty-state-text">No adventure activities found</div>
              <button
                onClick={handleAddNewAdventure}
                className="manage-btn manage-btn-primary"
              >
                Add Your First Activity
              </button>
            </div>
          ) : (
            adventureActivities.map((activity) => (
              <div key={activity.id} className="manage-card">
                {activity.featured_image && (
                  <img
                    src={`${API_URL}/${activity.featured_image}`}
                    alt={activity.title}
                    className="manage-card-image"
                  />
                )}
                <div className="manage-card-content">
                  <h4 className="manage-card-title">{activity.title}</h4>
                  <p className="manage-card-text">
                    <span className="font-medium">Category:</span> {activity.category.replace('_', ' ')}
                  </p>
                  <p className="manage-card-text">
                    <span className="font-medium">Difficulty:</span> {activity.difficulty_level}
                  </p>
                  <p className="manage-card-text">
                    <span className="font-medium">Duration:</span> {activity.duration}
                  </p>
                  <div className="manage-action-buttons">
                    <button
                      onClick={() => handleEditAdventure(activity)}
                      className="manage-action-btn manage-action-btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAdventure(activity.id)}
                      className="manage-action-btn manage-action-btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Add this to the tabs array in renderTabContent
  const tabs = [
    // ... existing tabs ...
    {
      id: 'adventure',
      label: 'Adventure Activities',
      content: renderAdventureActivitiesTab()
    }
  ];

  // Add fetchImages function
  const fetchImages = useCallback(async () => {
    if (!selectedSubdistrict?.id) {
      setImages([]);
      setShowImagesList(false);
      return;
    }

    try {
      setImagesLoading(true);
      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-subdistrict-images` : 
        `${API_URL}/api/subdistrict-images`;
      
      const response = await axios.get(`${baseUrl}/${selectedSubdistrict.id}`);
      setImages(response.data);
      setShowImagesList(true);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images');
      setImages([]);
      setShowImagesList(false);
    } finally {
      setImagesLoading(false);
    }
  }, [selectedSubdistrict, selectedTerritory]);

  // Add image handlers
  const handleAddNewImage = () => {
    setIsEditingImage(false);
    setImageFormData({
      id: null,
      image: null,
      image_preview: null,
      alt_text: '',
      description: '',
      subdistrict_id: selectedSubdistrict
    });
    setShowImageDashboard(true);
  };

  const handleEditImage = (image) => {
    setIsEditingImage(true);
    setImageFormData({
      id: image.id,
      image: null,
      image_preview: image.image_url,
      alt_text: image.alt_text || '',
      description: image.description || '',
      subdistrict_id: selectedSubdistrict
    });
    setShowImageDashboard(true);
  };

  const handleImageFieldChange = (e) => {
    const { name, value } = e.target;
    setImageFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFormData(prev => ({
        ...prev,
        image: file,
        image_preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCancelImageDashboard = () => {
    setShowImageDashboard(false);
    setIsEditingImage(false);
    setImageFormData({
      id: null,
      image: null,
      image_preview: null,
      alt_text: '',
      description: '',
      subdistrict_id: null
    });
  };

  const handleSaveImage = async () => {
    setImageError(null);
    if (!selectedSubdistrict) {
      setImageError('Please select a subdistrict first');
      return;
    }
    if (!imageFormData.image && !imageFormData.image_preview) {
      setImageError('Please select an image');
      return;
    }

    try {
      console.log('Starting image save process...');
      console.log('Selected subdistrict:', selectedSubdistrict);
      console.log('Is territory:', selectedTerritory);
      console.log('Image data:', {
        hasImage: !!imageFormData.image,
        hasPreview: !!imageFormData.image_preview,
        altText: imageFormData.alt_text,
        description: imageFormData.description
      });

      const formData = new FormData();
      if (imageFormData.image) {
        console.log('Appending image file to form data');
        formData.append('image', imageFormData.image);
      }
      formData.append('alt_text', imageFormData.alt_text);
      formData.append('caption', imageFormData.description);
      
      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-subdistrict-images` : 
        `${API_URL}/api/subdistrict-images`;

      console.log('Making request to:', baseUrl);
      console.log('Method:', isEditingImage ? 'PUT' : 'POST');
      console.log('Form data entries:', Array.from(formData.entries()));

      let response;
      if (isEditingImage && imageFormData.id) {
        response = await axios.put(`${baseUrl}/${imageFormData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post(`${baseUrl}/${selectedSubdistrict.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      console.log('Server response:', response.data);

      await fetchImages();
      setShowImageDashboard(false);
      setIsEditingImage(false);
      setImageFormData({
        id: null,
        image: null,
        image_preview: null,
        alt_text: '',
        description: '',
        subdistrict_id: null
      });
    } catch (err) {
      console.error('Error saving image:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response) {
        setImageError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setImageError('No response from server. Please check your connection.');
      } else {
        setImageError(`Error: ${err.message}`);
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-subdistrict-images` : 
        `${API_URL}/api/subdistrict-images`;
      await axios.delete(`${baseUrl}/${imageId}`);
      await fetchImages();
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  // Add useEffect for images tab
  useEffect(() => {
    if (activeTab === 'images') {
      setImages([]);
      setShowImagesList(false);
      
      if (selectedSubdistrict) {
        setImagesLoading(true);
        fetchImages()
          .then(() => {
            setShowImagesList(true);
          })
          .catch(error => {
            console.error('Error fetching images:', error);
            setError('Failed to fetch images');
          })
          .finally(() => {
            setImagesLoading(false);
          });
      }
    }
  }, [selectedSubdistrict, activeTab, fetchImages]);

  // Place fetchAttractions after all state declarations and before any useEffect or function that uses it
  const fetchAttractions = useCallback(async () => {
    if (!selectedSubdistrict) {
      setAttractions([]);
      return;
    }
    try {
      setAttractionsLoading(true);
      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-attractions` : 
        `${API_URL}/api/attractions`;
      const endpoint = selectedTerritory ? 
        `${baseUrl}/territory-subdistrict/${selectedSubdistrict.id}` :
        `${baseUrl}/subdistrict/${selectedSubdistrict.id}`;
      const response = await axios.get(endpoint);
      setAttractions(response.data);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      setError('Failed to fetch attractions');
      setAttractions([]);
    } finally {
      setAttractionsLoading(false);
    }
  }, [selectedSubdistrict, selectedTerritory]);

  // Add fetchCultures function
  const fetchCultures = useCallback(async () => {
    if (!selectedSubdistrict) {
      setCultures([]);
      return;
    }
    try {
      setCulturesLoading(true);
      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-cultures` : 
        `${API_URL}/api/cultures`;
      const endpoint = selectedTerritory ? 
        `${baseUrl}/territory-subdistrict/${selectedSubdistrict.id}` :
        `${baseUrl}/subdistrict/${selectedSubdistrict.id}`;
      const response = await axios.get(endpoint);
      setCultures(response.data);
    } catch (error) {
      console.error('Error fetching cultures:', error);
      setError('Failed to fetch cultures');
      setCultures([]);
    } finally {
      setCulturesLoading(false);
    }
  }, [selectedSubdistrict, selectedTerritory]);

  // Update fetchTravels function 
  const fetchTravels = useCallback(async () => {
    if (!selectedSubdistrict) {
      setTravels([]);
      setShowTravelsList(false);
      return;
    }

    try {
      setTravelsLoading(true);
      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-travel-info` : 
        `${API_URL}/api/subdistrict-travel-info`;
      
      // Get the selected district data to check if it's a state district
      const selectedDistrictData = districts.find(d => d.id === parseInt(selectedDistrict));
      
      let endpoint;
      if (selectedTerritory) {
        // For territory subdistricts
        endpoint = `${baseUrl}/subdistrict/${selectedSubdistrict.id}`;
      } else if (selectedDistrictData?.stateName) {
        // For state subdistricts
        endpoint = `${baseUrl}/state/${selectedSubdistrict.id}`;
      } else {
        throw new Error('Invalid district type');
      }
      
      console.log('Fetching travels from:', endpoint);
      const response = await axios.get(endpoint);
      let travelsData = Array.isArray(response.data) ? response.data : [response.data];
      
      // Filter out any null entries and map the data
      travelsData = travelsData
        .filter(travel => travel && travel.id)
        .map(travel => ({
          id: travel.id,
          title: travel.title,
          description: travel.description,
          featured_image: travel.featured_image,
          slug: travel.slug,
          meta_title: travel.meta_title,
          meta_description: travel.meta_description,
          meta_keywords: travel.meta_keywords,
          best_time_to_visit: travel.best_time_to_visit,
          transportation: travel.transportation || {},
          accommodation: travel.accommodation || {},
          local_cuisine: travel.local_cuisine || {},
          travel_tips: travel.travel_tips || {},
          created_at: travel.created_at,
          updated_at: travel.updated_at
        }));

      console.log('Fetched travels data:', travelsData);
      setTravels(travelsData);
      setShowTravelsList(true);
    } catch (error) {
      console.error('Error fetching travel information:', error);
      setError('Failed to fetch travel information');
      setTravels([]);
      setShowTravelsList(false);
    } finally {
      setTravelsLoading(false);
    }
  }, [selectedSubdistrict, selectedTerritory, selectedDistrict, districts]);

  // Add culture handlers
  const handleAddNewCulture = () => {
    setIsEditingCulture(false);
    setCultureFormData({
      id: null,
      title: '',
      slug: '',
      featured_image: null,
      featured_image_preview: null,
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setShowCultureDashboard(true);
  };

  const handleEditCulture = (culture) => {
    setIsEditingCulture(true);
    setCultureFormData({
      id: culture.id,
      title: culture.title,
      slug: culture.slug,
      featured_image: null,
      featured_image_preview: culture.featured_image || null,
      description: culture.description || '',
      meta_title: culture.meta_title || '',
      meta_description: culture.meta_description || '',
      meta_keywords: culture.meta_keywords || ''
    });
    setShowCultureDashboard(true);
  };

  const handleCultureFieldChange = (e) => {
    const { name, value } = e.target;
    setCultureFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? { slug: generateSlug(value) } : {})
    }));
  };

  const handleCultureImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the new image
      const previewUrl = URL.createObjectURL(file);
      setCultureFormData(prev => ({
        ...prev,
        featured_image: file,
        featured_image_preview: previewUrl
      }));
    }
  };

  const handleCancelCultureDashboard = () => {
    setShowCultureDashboard(false);
    setIsEditingCulture(false);
    setCultureFormData({
      id: null,
      title: '',
      slug: '',
      featured_image: null,
      featured_image_preview: null,
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
  };

  const handleSaveCulture = async () => {
    setCultureError(null);
    if (!selectedSubdistrict) {
      setCultureError('Please select a subdistrict first.');
      return;
    }
    if (!cultureFormData.title || !cultureFormData.slug) {
      setCultureError('Title and slug are required.');
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', cultureFormData.title);
      formDataToSend.append('slug', cultureFormData.slug);
      formDataToSend.append('description', cultureFormData.description);
      formDataToSend.append('meta_title', cultureFormData.meta_title);
      formDataToSend.append('meta_description', cultureFormData.meta_description);
      formDataToSend.append('meta_keywords', cultureFormData.meta_keywords);
      if (cultureFormData.featured_image) {
        formDataToSend.append('featured_image', cultureFormData.featured_image);
      }

      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-cultures` : 
        `${API_URL}/api/cultures`;

      if (isEditingCulture && cultureFormData.id) {
        // Update
        await axios.put(`${baseUrl}/${cultureFormData.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create
        if (selectedTerritory) {
          formDataToSend.append('territory_subdistrict_id', selectedSubdistrict.id);
        } else {
          formDataToSend.append('subdistrict_id', selectedSubdistrict.id);
        }
        await axios.post(baseUrl, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Refresh cultures list
      await fetchCultures();
      // Reset form and close dashboard
      setShowCultureDashboard(false);
      setIsEditingCulture(false);
      setCultureFormData({
        id: null,
        title: '',
        slug: '',
        featured_image: null,
        featured_image_preview: null,
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: ''
      });
    } catch (err) {
      console.error('Error saving culture:', err);
      setCultureError('Failed to save culture. Please try again.');
    }
  };

  // Function to generate slug from title
  const generateSlug = (title, existingSlug = '') => {
    if (!title) return '';
    
    // Generate base slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace special chars with hyphens
      .replace(/(^-|-$)/g, '')      // Remove leading/trailing hyphens
      .replace(/-+/g, '-');         // Replace multiple hyphens with single hyphen
    
    // If this is an edit and the slug hasn't changed, keep the existing slug
    if (existingSlug && slug === existingSlug) {
      return existingSlug;
    }
    
    return slug;
  };

  // Function to validate meta fields
  const validateMetaFields = (name, value) => {
    let error = '';
    
    if (name === 'meta_title') {
      const length = value.length;
      if (length > 0 && (length < 50 || length > 60)) {
        error = `Meta title must be between 50-60 characters (current: ${length})`;
      }
    }
    
    if (name === 'meta_description') {
      const length = value.length;
      if (length > 0 && (length < 150 || length > 160)) {
        error = `Meta description must be between 150-160 characters (current: ${length})`;
      }
    }
    
    if (name === 'meta_keywords') {
      const keywords = value.split(/[,\n]/).filter(k => k.trim().length > 0);
      if (keywords.length > 0 && keywords.length < 8) {
        error = `Please enter at least 8 keywords (current: ${keywords.length})`;
      }
    }
    
    return error;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      status: 'publish',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      latitude: '',
      longitude: '',
      featured_image: null
    });
    setImagePreview(null);
    setMetaErrors({
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setIsEditing(false);
  };

  const handleEdit = (subdistrict) => {
    setIsEditing(true);
    setFormData({
      id: subdistrict.id,
      title: subdistrict.title,
      slug: subdistrict.slug,
      description: subdistrict.description || '',
      featured_image: null,
      status: subdistrict.status || 'publish',
      meta_title: subdistrict.meta_title || '',
      meta_description: subdistrict.meta_description || '',
      meta_keywords: subdistrict.meta_keywords || '',
      latitude: subdistrict.latitude || '',
      longitude: subdistrict.longitude || '',
    });
    if (subdistrict.featured_image) {
      setImagePreview(subdistrict.featured_image);
    }
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const error = validateMetaFields(name, value);
    setMetaErrors(prev => ({ ...prev, [name]: error }));
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'title') {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featured_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate coordinates
    if (!validateCoordinates(formData.latitude, formData.longitude)) {
      alert('Please enter valid coordinates within India\'s range:\nLatitude: 8°N to 37°N\nLongitude: 68°E to 97°E');
      return;
    }

    const errors = {
      meta_title: validateMetaFields('meta_title', formData.meta_title),
      meta_description: validateMetaFields('meta_description', formData.meta_description),
      meta_keywords: validateMetaFields('meta_keywords', formData.meta_keywords)
    };
    setMetaErrors(errors);
    if (Object.values(errors).some(error => error !== '')) {
      setError('Please fix the meta field errors before submitting');
      return;
    }
    try {
      const formDataToSend = new FormData();
      // Only append non-null values
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (!isEditing) {
        if (selectedTerritory) {
          formDataToSend.append('territory_district_id', selectedDistrict);
        } else {
          formDataToSend.append('district_id', selectedDistrict);
        }
      }

      let response;
      const baseUrl = selectedTerritory ? `${API_URL}/api/territory-subdistricts` : `${API_URL}/api/subdistricts`;
      if (isEditing) {
        response = await axios.put(
          `${baseUrl}/${formData.id}`,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        response = await axios.post(
          baseUrl,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      resetForm();
      setShowForm(false);
      fetchSubdistricts();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} subdistrict: ${error.response?.data?.message || error.message}`);
    }
  };

  // Fetch states on mount
  const fetchStates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/states`);
      setStates(response.data);
    } catch (err) {
      console.error('Error fetching states:', err);
      setError('Failed to fetch states. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch territories on mount
  const fetchTerritories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/territories`);
      setTerritories(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching territories:', err);
      setError('Failed to fetch territories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of states and territories
  useEffect(() => {
    fetchStates();
    fetchTerritories();
  }, []);

  // Update handleStateChange to reset territory and clear entries
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedTerritory(''); // Reset territory when state is selected
    setSelectedDistrict('');
    // Clear all entries
    setAttractions([]);
    setShowAttractionsList(false);
    setCultures([]);
    setShowCulturesList(false);
    setTravels([]);
    setShowTravelsList(false);
    setImages([]);
    setShowImagesList(false);
    setVirtualTours([]);
    setSelectedSubdistrict(null);
  };

  // Update handleTerritoryChange to reset state and clear entries
  const handleTerritoryChange = (e) => {
    const territoryId = e.target.value;
    setSelectedTerritory(territoryId);
    setSelectedState(''); // Reset state when territory is selected
    setSelectedDistrict('');
    // Clear all entries
    setAttractions([]);
    setShowAttractionsList(false);
    setCultures([]);
    setShowCulturesList(false);
    setTravels([]);
    setShowTravelsList(false);
    setImages([]);
    setShowImagesList(false);
    setVirtualTours([]);
    setSelectedSubdistrict(null);
  };

  // Add handler for district change
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    // Clear all entries
    setAttractions([]);
    setShowAttractionsList(false);
    setCultures([]);
    setShowCulturesList(false);
    setTravels([]);
    setShowTravelsList(false);
    setImages([]);
    setShowImagesList(false);
    setVirtualTours([]);
    setSelectedSubdistrict(null);
  };

  // Update fetchDistricts to handle both state and territory
  const fetchDistricts = async () => {
    if (!selectedState && !selectedTerritory) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let response;
      let districtsWithState = [];

      if (selectedState) {
        // Existing state districts logic
        const selectedStateData = states.find(s => s.id === parseInt(selectedState));
        if (!selectedStateData) {
          throw new Error('Selected state not found');
        }
        response = await axios.get(`${API_URL}/api/districts/state/${selectedStateData.name}`);
        districtsWithState = response.data.map(district => ({
          ...district,
          stateName: selectedStateData.name,
          featured_image: district.featured_image ? 
            `${API_URL}/${district.featured_image}` : 
            null
        }));
      } else if (selectedTerritory) {
        // Territory districts logic
        response = await axios.get(`${API_URL}/api/territory-districts/territory/${selectedTerritory}`);
        const selectedTerritoryData = territories.find(t => t.id === parseInt(selectedTerritory));
        districtsWithState = response.data.map(district => ({
          ...district,
          stateName: selectedTerritoryData?.title || 'Territory',
          featured_image: district.featured_image ? 
            `${API_URL}/${district.featured_image}` : 
            null
        }));
      }

      setDistricts(districtsWithState);
      setSelectedDistrict('');
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError('Failed to fetch districts. Please try again.');
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to watch both state and territory
  useEffect(() => {
    fetchDistricts();
  }, [selectedState, selectedTerritory]);

  // Move fetchSubdistricts into useCallback
  const fetchSubdistricts = useCallback(async () => {
    if (!selectedDistrict) return;
    
    try {
      setSubdistrictsLoading(true);
      let response;
      
      // Get the selected district data to check if it's a state district
      const selectedDistrictData = districts.find(d => d.id === parseInt(selectedDistrict));
      
      if (!selectedDistrictData) {
        throw new Error('Selected district not found');
      }

      // If the district has stateName from a state, use state subdistricts endpoint
      if (selectedState && selectedDistrictData.stateName) {
        response = await axios.get(`${API_URL}/api/subdistricts/district/${selectedDistrict}`);
      } 
      // If the district is from a territory, use territory subdistricts endpoint
      else if (selectedTerritory) {
        response = await axios.get(`${API_URL}/api/territory-subdistricts/district/${selectedDistrict}`);
      }
      
      if (response) {
        setSubdistricts(response.data);
      }
    } catch (error) {
      console.error('Error fetching subdistricts:', error);
      setError('Failed to fetch subdistricts');
    } finally {
      setSubdistrictsLoading(false);
    }
  }, [selectedDistrict, selectedState, selectedTerritory, districts]); // Add districts to dependencies

  // Update useEffect to use the memoized fetchSubdistricts
  useEffect(() => {
    if (selectedDistrict) {
    fetchSubdistricts();
    }
  }, [selectedDistrict, fetchSubdistricts]); // Only depend on selectedDistrict and fetchSubdistricts

  const handleDelete = async (subdistrictId) => {
    if (window.confirm('Are you sure you want to delete this subdistrict?')) {
      try {
        setError(null);
        const baseUrl = selectedTerritory ? 
          `${API_URL}/api/territory-subdistricts` : 
          `${API_URL}/api/subdistricts`;
          
        await axios.delete(`${baseUrl}/${subdistrictId}`);
        setSubdistricts(subdistricts.filter(sub => sub.id !== subdistrictId));
      } catch (err) {
        console.error('Error deleting subdistrict:', err);
        setError('Failed to delete subdistrict. Please try again.');
      }
    }
  };

  // Update the formatImageUrl function to handle all image URL cases
  const formatImageUrl = (imagePath) => {
    if (!imagePath) {
      return '/placeholder-image.jpg';
    }
    
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // For gallery images, they are stored directly in uploads folder
    return `${API_URL}/uploads/${imagePath}`;
  };

  // Add this function after the other state declarations
  const updateSubdistrictImage = async (subdistrictId, newImagePath) => {
    try {
      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-subdistricts` : 
        `${API_URL}/api/subdistricts`;
      
      const response = await axios.patch(`${baseUrl}/${subdistrictId}/update-image`, {
        newImagePath: `uploads/${newImagePath}`
      });
      
      // Update local state
      setSubdistricts(prev => 
        prev.map(sub => 
          sub.id === subdistrictId 
            ? { ...sub, featured_image: response.data.featured_image }
            : sub
        )
      );
      
      // Remove from failed images set if it was there
      setFailedImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(subdistrictId);
        return newSet;
      });
      
      return true;
    } catch (err) {
      console.error('Failed to update image path:', err);
      setError('Failed to update image path. Please try again.');
      return false;
    }
  };

  // Fetch subdistricts when district changes (for non-districts tabs)
  useEffect(() => {
    if (activeTab !== 'districts' && selectedDistrict) {
      fetchSubdistricts();
    }
  }, [selectedDistrict, activeTab, fetchSubdistricts]);

  // Handle Add New click
  const handleAddNewClick = () => {
    setEditingId('new');
    setEditRowData({
      title: '',
      slug: '',
      description: '',
      status: 'publish',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
  };

  // Handle Edit click
  const handleEditClick = (sub) => {
    setEditingId(sub.id);
    setEditRowData({
      title: sub.title,
      slug: sub.slug,
      description: sub.description || '',
      status: sub.status || 'publish',
      meta_title: sub.meta_title || '',
      meta_description: sub.meta_description || '',
      meta_keywords: sub.meta_keywords || ''
    });
  };

  // Handle Cancel
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRowData({
      title: '',
      slug: '',
      description: '',
      status: 'publish',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
  };

  // Handle input change in inline row
  const handleEditRowChange = (e) => {
    const { name, value } = e.target;
    setEditRowData(prev => ({ ...prev, [name]: value, ...(name === 'title' ? { slug: generateSlug(value) } : {}) }));
  };

  // Handle Save (add or update)
  const handleSaveEdit = async () => {
    try {
      if (editingId === 'new') {
        // Add new subdistrict
        const formDataToSend = new FormData();
        Object.keys(editRowData).forEach(key => {
          formDataToSend.append(key, editRowData[key]);
        });
        if (selectedTerritory) {
          formDataToSend.append('territory_district_id', selectedDistrict);
        } else {
          formDataToSend.append('district_id', selectedDistrict);
        }
        const baseUrl = selectedTerritory ? `${API_URL}/api/territory-subdistricts` : `${API_URL}/api/subdistricts`;
        await axios.post(baseUrl, formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        // Update existing subdistrict
        const formDataToSend = new FormData();
        Object.keys(editRowData).forEach(key => {
          formDataToSend.append(key, editRowData[key]);
        });
        const baseUrl = selectedTerritory ? `${API_URL}/api/territory-subdistricts` : `${API_URL}/api/subdistricts`;
        await axios.put(`${baseUrl}/${editingId}`, formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setEditingId(null);
      setEditRowData({
        title: '', slug: '', description: '', status: 'publish', meta_title: '', meta_description: '', meta_keywords: ''
      });
      fetchSubdistricts();
    } catch (err) {
      alert('Failed to save subdistrict.');
    }
  };

  // Handle Add New Attraction
  const handleAddNewAttraction = () => {
    setIsEditingAttraction(false);
    setAttractionFormData({
      id: null,
      title: '',
      slug: '',
      featured_image: null,
      featured_image_preview: null,
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setShowAttractionDashboard(true);
  };

  // Handle Edit Attraction
  const handleEditAttraction = (attraction) => {
    setIsEditingAttraction(true);
    setAttractionFormData({
      id: attraction.id,
      title: attraction.title,
      slug: attraction.slug,
      featured_image: null,
      featured_image_preview: attraction.featured_image || null,
      description: attraction.description || '',
      meta_title: attraction.meta_title || '',
      meta_description: attraction.meta_description || '',
      meta_keywords: attraction.meta_keywords || ''
    });
    setShowAttractionDashboard(true);
  };

  // Handle Attraction Dashboard field changes
  const handleAttractionFieldChange = (e) => {
    const { name, value } = e.target;
    setAttractionFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? { slug: generateSlug(value) } : {})
    }));
  };

  // Handle Attraction Image Change
  const handleAttractionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttractionFormData(prev => ({
        ...prev,
        featured_image: file,
        featured_image_preview: URL.createObjectURL(file)
      }));
    }
  };

  // Handle Cancel Attraction Dashboard
  const handleCancelAttractionDashboard = () => {
    setShowAttractionDashboard(false);
    setIsEditingAttraction(false);
    setAttractionFormData({
      id: null,
      title: '',
      slug: '',
      featured_image: null,
      featured_image_preview: null,
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
  };

  // Update useEffect for subdistrict selection
  useEffect(() => {
    if (activeTab === 'attractions') {
      // Always clear attractions when subdistrict changes or is unselected
      setAttractions([]);
      setShowAttractionsList(false);
      
      // Only fetch attractions if a subdistrict is selected
      if (selectedSubdistrict) {
        setAttractionsLoading(true);
        fetchAttractions().then(() => {
          setShowAttractionsList(true);
        }).catch(error => {
          console.error('Error fetching attractions:', error);
          setError('Failed to fetch attractions');
        }).finally(() => {
          setAttractionsLoading(false);
        });
      }
    }
  }, [selectedSubdistrict, activeTab, fetchAttractions]);

  // Add useEffect for culture tab
  useEffect(() => {
    if (activeTab === 'culture') {
      // Always clear cultures when subdistrict changes or is unselected
      setCultures([]);
      setShowCulturesList(false);
      
      // Only fetch cultures if a subdistrict is selected
      if (selectedSubdistrict) {
        setCulturesLoading(true);
        fetchCultures().then(() => {
          setShowCulturesList(true);
        }).catch(error => {
          console.error('Error fetching cultures:', error);
          setError('Failed to fetch cultures');
        }).finally(() => {
          setCulturesLoading(false);
        });
      }
    }
  }, [selectedSubdistrict, activeTab, fetchCultures]);

  // Update useEffect for state/district changes
  useEffect(() => {
    if (activeTab === 'attractions' || activeTab === 'culture') {
      // Clear data when state or district changes
      if (activeTab === 'attractions') {
        setAttractions([]);
        setShowAttractionsList(false);
      } else if (activeTab === 'culture') {
        setCultures([]);
        setShowCulturesList(false);
      }
      setSelectedSubdistrict(''); // Reset subdistrict selection
    }
  }, [selectedState, selectedTerritory, selectedDistrict, activeTab]);

  // Add function to strip HTML and truncate description
  const formatDescription = (description) => {
    if (!description) return '';
    // Strip HTML tags
    const plainText = description.replace(/<[^>]+>/g, '');
    // Get first line and truncate if too long
    const firstLine = plainText.split('\n')[0];
    return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
  };

  // Tab content renderers
  const renderTabContent = () => {
    if (activeTab === 'districts') {
      return (
        <div className="tab-content-districts">
          <div style={{ marginBottom: '20px', display: selectedDistrict ? 'block' : 'none' }}>
            <button className="add-new-btn" onClick={() => { resetForm(); setShowForm(true); }}>
              + Add New Subdistrict
            </button>
          </div>
          {selectedDistrict && (
            subdistrictsLoading ? (
              <div>Loading subdistricts...</div>
            ) : subdistricts.length > 0 ? (
              <table className="subdistricts-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Featured Image</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subdistricts.map((sub, idx) => (
                    <tr key={sub.id}>
                      <td>{idx + 1}</td>
                      <td>
                        {sub.featured_image ? (
                          <img
                            src={formatImageUrl(sub.featured_image)}
                            alt={sub.title}
                            style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                            onError={e => { e.target.src = '/placeholder-image.jpg'; }}
                          />
                        ) : (
                          <span style={{ color: '#aaa' }}>No Image</span>
                        )}
                      </td>
                      <td>{sub.title}</td>
                      <td>{sub.description}</td>
                      <td>
                        <div className="action-btn-row" style={{ display: 'flex', gap: '8px' }}>
                          <button className="edit-btn" onClick={() => handleEdit(sub)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(sub.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: '#888', marginTop: '20px' }}>No subdistricts found for this district.</div>
            )
          )}
          {/* Subdistrict Form Modal */}
          {showForm && (
            <div className="modal">
              <div className="modal-content">
                <h2>{isEditing ? 'Edit Subdistrict' : 'Add New Subdistrict'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-section">
                    <label>Title:</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-section">
                    <label>Slug:</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-section">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="manage-form-textarea"
                    />
                  </div>
                  <div className="form-section">
                    <label>Featured Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '120px', height: '70px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px' }}
                      />
                    )}
                  </div>
                  <div className="form-section">
                    <label>Status:</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="publish">Publish</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="form-section">
                    <label>Meta Title:</label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                    />
                    {metaErrors.meta_title && <div className="error">{metaErrors.meta_title}</div>}
                  </div>
                  <div className="form-section">
                    <label>Meta Description:</label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                    {metaErrors.meta_description && <div className="error">{metaErrors.meta_description}</div>}
                  </div>
                  <div className="form-section">
                    <label>Meta Keywords:</label>
                    <input
                      type="text"
                      name="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={handleInputChange}
                      placeholder="Comma separated keywords"
                    />
                    {metaErrors.meta_keywords && <div className="error">{metaErrors.meta_keywords}</div>}
                  </div>
                  <div className="form-section">
                    <h3>Location Details</h3>
                    <div className="form-group">
                      <label>Latitude (अक्षांश)</label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="Enter latitude (e.g. 19.0760)"
                        min="8"
                        max="37"
                        required
                      />
                      <small className="helper-text">
                        Enter latitude between 8°N to 37°N (India's range)
                        <br />
                        Example: Mumbai (19.0760°N), Delhi (28.6139°N)
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Longitude (देशांतर)</label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="Enter longitude (e.g. 72.8777)"
                        min="68"
                        max="97"
                        required
                      />
                      <small className="helper-text">
                        Enter longitude between 68°E to 97°E (India's range)
                        <br />
                        Example: Mumbai (72.8777°E), Delhi (77.2090°E)
                      </small>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">{isEditing ? 'Update' : 'Create'} Subdistrict</button>
                    <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                  </div>
                  {error && <div className="error">{error}</div>}
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
    if (activeTab === 'attractions') {
      return (
        <div className="tab-content-attractions">
          <div className="tab-header-row">
            {!showAttractionDashboard && selectedSubdistrict && (
              <button className="add-new-btn" onClick={handleAddNewAttraction}>Add New</button>
            )}
          </div>
          {showAttractionDashboard ? (
            <div className="attraction-dashboard-panel">
              <div className="dashboard-row">
                <div className="dashboard-col">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={attractionFormData.title}
                    onChange={handleAttractionFieldChange}
                  />
                </div>
                <div className="dashboard-col">
                  <label>Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={attractionFormData.slug}
                    onChange={handleAttractionFieldChange}
                  />
                </div>
              </div>
              <div className="dashboard-row image-desc-row">
                <div className="dashboard-col">
                  <label>Featured Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAttractionImageChange}
                  />
                  {attractionFormData.featured_image_preview && (
                    <img
                      src={attractionFormData.featured_image_preview}
                      alt="Preview"
                      style={{ width: '120px', height: '70px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px' }}
                    />
                  )}
                </div>
              </div>
              <div className="dashboard-row image-desc-row">
                <div className="dashboard-col">
                  <label>Description</label>
                  <ReactQuill
                    theme="snow"
                    value={attractionFormData.description}
                    onChange={val => setAttractionFormData(prev => ({ ...prev, description: val }))}
                    style={{ width: '100%' }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </div>
              <div className="dashboard-row">
                <div className="dashboard-col">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    name="meta_title"
                    value={attractionFormData.meta_title}
                    onChange={handleAttractionFieldChange}
                    onPaste={handleMetaPaste('meta_title')}
                    maxLength={60}
                  />
                  {metaPasteWarning.meta_title && <div className="error">{metaPasteWarning.meta_title}</div>}
                  {getMetaError('meta_title', attractionFormData.meta_title) && <div className="error">{getMetaError('meta_title', attractionFormData.meta_title)}</div>}
                </div>
                <div className="dashboard-col">
                  <label>Meta Description</label>
                  <textarea
                    name="meta_description"
                    value={attractionFormData.meta_description}
                    onChange={handleAttractionFieldChange}
                    onPaste={handleMetaPaste('meta_description')}
                    rows="2"
                    maxLength={160}
                  />
                  {metaPasteWarning.meta_description && <div className="error">{metaPasteWarning.meta_description}</div>}
                  {getMetaError('meta_description', attractionFormData.meta_description) && <div className="error">{getMetaError('meta_description', attractionFormData.meta_description)}</div>}
                </div>
              </div>
              <div className="dashboard-row">
                <div className="dashboard-col">
                  <label>Meta Keywords</label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={attractionFormData.meta_keywords}
                    onChange={handleAttractionFieldChange}
                    onPaste={handleMetaPaste('meta_keywords')}
                    onKeyDown={(e) => handleMetaKeywordsInput(e, 'attraction')}
                    placeholder="Type keywords and press Enter or comma to add"
                  />
                  {metaPasteWarning.meta_keywords && <div className="error">{metaPasteWarning.meta_keywords}</div>}
                  {getMetaError('meta_keywords', attractionFormData.meta_keywords) && <div className="error">{getMetaError('meta_keywords', attractionFormData.meta_keywords)}</div>}
                </div>
              </div>
              <div className="dashboard-actions-row">
                <button
                  className="save-btn"
                  style={{
                    background: isEditingAttraction ? '#1976d2' : '#43a047',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '10px 22px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                  }}
                  onClick={handleSaveAttraction}
                >
                  {isEditingAttraction ? 'Update' : 'Create'}
                </button>
                <button className="cancel-btn" onClick={handleCancelAttractionDashboard}>Cancel</button>
                {attractionError && <div className="error" style={{marginTop: '10px'}}>{attractionError}</div>}
              </div>
            </div>
          ) : (
            <div className="attractions-list">
              {!selectedSubdistrict ? (
                <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
                  Please select a subdistrict to view its attractions
                </div>
              ) : attractionsLoading ? (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading attractions...</div>
              ) : !showAttractionsList ? (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  Loading attractions for {selectedSubdistrict.title || 'selected subdistrict'}...
                </div>
              ) : attractions.length > 0 ? (
                <table className="attractions-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Featured Image</th>
                      <th>Title</th>
                      <th style={{ maxWidth: '300px' }}>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attractions.map((attraction, idx) => (
                      <tr key={attraction.id}>
                        <td>{idx + 1}</td>
                        <td>
                          {attraction.featured_image ? (
                            <img
                              src={formatImageUrl(attraction.featured_image)}
                              alt={attraction.title}
                              style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                              onError={e => { e.target.src = '/placeholder-image.jpg'; }}
                            />
                          ) : (
                            <span style={{ color: '#aaa' }}>No Image</span>
                          )}
                        </td>
                        <td>{attraction.title}</td>
                        <td style={{ 
                          maxWidth: '300px', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          color: '#666'
                        }}>
                          {formatDescription(attraction.description)}
                        </td>
                        <td>
                          <div className="action-btn-row" style={{ display: 'flex', gap: '8px' }}>
                            <button className="edit-btn" onClick={() => handleEditAttraction(attraction)}>Edit</button>
                            <button 
                              className="delete-btn" 
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this attraction?')) {
                                  try {
                                    const baseUrl = selectedTerritory ? 
                                      `${API_URL}/api/territory-attractions` : 
                                      `${API_URL}/api/attractions`;
                                    await axios.delete(`${baseUrl}/${attraction.id}`);
                                    await fetchAttractions();
                                  } catch (err) {
                                    console.error('Error deleting attraction:', err);
                                    setError('Failed to delete attraction');
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
                  No attractions found for this subdistrict
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    if (activeTab === 'culture') {
      return (
        <div className="tab-content-culture">
          <div className="tab-header-row">
            {!showCultureDashboard && selectedSubdistrict && (
              <button className="add-new-btn" onClick={handleAddNewCulture}>Add New</button>
            )}
          </div>
          {showCultureDashboard ? (
            <div className="culture-dashboard-panel">
              <div className="dashboard-row">
                <div className="dashboard-col">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={cultureFormData.title}
                    onChange={handleCultureFieldChange}
                  />
                </div>
                <div className="dashboard-col">
                  <label>Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={cultureFormData.slug}
                    onChange={handleCultureFieldChange}
                  />
                </div>
              </div>
              <div className="dashboard-row image-desc-row">
                <div className="dashboard-col">
                  <label>Featured Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCultureImageChange}
                    style={{ marginBottom: '10px' }}
                  />
                  <div style={{ 
                    marginTop: '10px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                    minHeight: '170px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {cultureFormData.featured_image_preview ? (
                      <div style={{ position: 'relative', textAlign: 'center' }}>
                        <img
                          src={cultureFormData.featured_image_preview}
                          alt="Preview"
                          style={{ 
                            maxWidth: '200px',
                            maxHeight: '150px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                          onError={(e) => {
                            console.error('Preview image failed to load:', cultureFormData.featured_image_preview);
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCultureFormData(prev => ({
                              ...prev,
                              featured_image: null,
                              featured_image_preview: null
                            }));
                          }}
                          style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#666',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div style={{ 
                        width: '200px',
                        height: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        color: '#888',
                        fontSize: '14px'
                      }}>
                        No image selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="dashboard-row image-desc-row">
                <div className="dashboard-col">
                  <label>Description</label>
                  <ReactQuill
                    theme="snow"
                    value={cultureFormData.description}
                    onChange={val => setCultureFormData(prev => ({ ...prev, description: val }))}
                    style={{ width: '100%' }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </div>
              <div className="dashboard-row">
                <div className="dashboard-col">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    name="meta_title"
                    value={cultureFormData.meta_title}
                    onChange={handleCultureFieldChange}
                    onPaste={handleMetaPaste('meta_title')}
                    maxLength={60}
                  />
                  {metaPasteWarning.meta_title && <div className="error">{metaPasteWarning.meta_title}</div>}
                  {getMetaError('meta_title', cultureFormData.meta_title) && <div className="error">{getMetaError('meta_title', cultureFormData.meta_title)}</div>}
                </div>
                <div className="dashboard-col">
                  <label>Meta Description</label>
                  <textarea
                    name="meta_description"
                    value={cultureFormData.meta_description}
                    onChange={handleCultureFieldChange}
                    onPaste={handleMetaPaste('meta_description')}
                    rows="2"
                    maxLength={160}
                  />
                  {metaPasteWarning.meta_description && <div className="error">{metaPasteWarning.meta_description}</div>}
                  {getMetaError('meta_description', cultureFormData.meta_description) && <div className="error">{getMetaError('meta_description', cultureFormData.meta_description)}</div>}
                </div>
              </div>
              <div className="dashboard-row">
                <div className="dashboard-col">
                  <label>Meta Keywords</label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={cultureFormData.meta_keywords}
                    onChange={handleCultureFieldChange}
                    onPaste={handleMetaPaste('meta_keywords')}
                    onKeyDown={(e) => handleMetaKeywordsInput(e, 'culture')}
                    placeholder="Type keywords and press Enter or comma to add"
                  />
                  {metaPasteWarning.meta_keywords && <div className="error">{metaPasteWarning.meta_keywords}</div>}
                  {getMetaError('meta_keywords', cultureFormData.meta_keywords) && <div className="error">{getMetaError('meta_keywords', cultureFormData.meta_keywords)}</div>}
                </div>
              </div>
              <div className="dashboard-actions-row">
                <button
                  className="save-btn"
                  style={{
                    background: isEditingCulture ? '#1976d2' : '#43a047',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '10px 22px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                  }}
                  onClick={handleSaveCulture}
                >
                  {isEditingCulture ? 'Update' : 'Create'}
                </button>
                <button className="cancel-btn" onClick={handleCancelCultureDashboard}>Cancel</button>
                {cultureError && <div className="error" style={{marginTop: '10px'}}>{cultureError}</div>}
              </div>
            </div>
          ) : (
            <div className="cultures-list">
              {!selectedSubdistrict ? (
                <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
                  Please select a subdistrict to view its culture & heritage
                </div>
              ) : culturesLoading ? (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading culture & heritage...</div>
              ) : !showCulturesList ? (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  Loading culture & heritage for {selectedSubdistrict.title || 'selected subdistrict'}...
                </div>
              ) : cultures.length > 0 ? (
                <table className="cultures-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Featured Image</th>
                      <th>Title</th>
                      <th style={{ maxWidth: '300px' }}>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cultures.map((culture, idx) => (
                      <tr key={culture.id}>
                        <td>{idx + 1}</td>
                        <td>
                          {culture.featured_image ? (
                            <img
                              src={formatImageUrl(culture.featured_image)}
                              alt={culture.title}
                              style={{ 
                                width: '120px', 
                                height: '80px', 
                                objectFit: 'cover', 
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', culture.featured_image);
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
                          ) : (
                            <span style={{ color: '#aaa' }}>No Image</span>
                          )}
                        </td>
                        <td>{culture.title}</td>
                        <td style={{ 
                          maxWidth: '300px', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          color: '#666'
                        }}>
                          {formatDescription(culture.description)}
                        </td>
                        <td>
                          <div className="action-btn-row" style={{ display: 'flex', gap: '8px' }}>
                            <button className="edit-btn" onClick={() => handleEditCulture(culture)}>Edit</button>
                            <button 
                              className="delete-btn" 
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this culture & heritage entry?')) {
                                  try {
                                    const baseUrl = selectedTerritory ? 
                                      `${API_URL}/api/territory-cultures` : 
                                      `${API_URL}/api/cultures`;
                                    await axios.delete(`${baseUrl}/${culture.id}`);
                                    await fetchCultures();
                                  } catch (err) {
                                    console.error('Error deleting culture:', err);
                                    setError('Failed to delete culture & heritage entry');
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
                  No culture & heritage entries found for this subdistrict
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    if (activeTab === 'travel') {
      return (
        <div className="tab-content-travel">
          {!selectedDistrict ? (
            <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
              Please select a district first
            </div>
          ) : !selectedSubdistrict ? (
            <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
              Please select a subdistrict to view its travel information
            </div>
          ) : (
            <>
              <div className="tab-header-row">
                {!showTravelDashboard && (
                  <button className="add-new-btn" onClick={handleAddNewTravel}>Add New</button>
                )}
              </div>
              {showTravelDashboard ? (
                <div className="travel-dashboard-panel">
                  {/* Basic Information Section */}
                  <div className="dashboard-section">
                    <h3>Basic Information</h3>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>Title</label>
                        <input
                          type="text"
                          name="title"
                          value={travelFormData.title}
                          onChange={handleTravelFieldChange}
                          placeholder="Enter a title for the travel information"
                          required
                        />
                      </div>
                      <div className="dashboard-col">
                        <label>Slug</label>
                        <input
                          type="text"
                          name="slug"
                          value={travelFormData.slug}
                          readOnly
                          placeholder="URL will be generated from title"
                        />
                      </div>
                    </div>
                    <div className="dashboard-row image-desc-row">
                      <div className="dashboard-col">
                        <label>Featured Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleTravelImageChange}
                          style={{ marginBottom: '10px' }}
                        />
                        {travelFormData.featured_image_preview && (
                          <img
                            src={travelFormData.featured_image_preview}
                            alt="Preview"
                            style={{ width: '120px', height: '70px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px' }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="dashboard-row image-desc-row">
                      <div className="dashboard-col">
                        <label>Description</label>
                        <ReactQuill
                          theme="snow"
                          value={travelFormData.description}
                          onChange={val => setTravelFormData(prev => ({ ...prev, description: val }))}
                          style={{ width: '100%' }}
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, false] }],
                              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              ['link', 'image'],
                              ['clean']
                            ]
                          }}
                        />
                      </div>
                    </div>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>How to Reach</label>
                        <textarea
                          name="how_to_reach"
                          value={travelFormData.how_to_reach}
                          onChange={handleTravelFieldChange}
                          rows="3"
                          placeholder="Describe how to reach this destination"
                        />
                      </div>
                      <div className="dashboard-col">
                        <label>Best Time to Visit</label>
                        <textarea
                          name="best_time_to_visit"
                          value={travelFormData.best_time_to_visit}
                          onChange={handleTravelFieldChange}
                          rows="3"
                          placeholder="Describe the best time to visit"
                        />
                      </div>
                    </div>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>Accommodation</label>
                        <textarea
                          name="accommodation"
                          value={travelFormData.accommodation}
                          onChange={handleTravelFieldChange}
                          rows="3"
                          placeholder="Describe accommodation options"
                        />
                      </div>
                      <div className="dashboard-col">
                        <label>Local Transport</label>
                        <textarea
                          name="local_transport"
                          value={travelFormData.local_transport}
                          onChange={handleTravelFieldChange}
                          rows="3"
                          placeholder="Describe local transportation options"
                        />
                      </div>
                    </div>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>Safety Tips</label>
                        <textarea
                          name="safety_tips"
                          value={travelFormData.safety_tips}
                          onChange={handleTravelFieldChange}
                          rows="3"
                          placeholder="Provide safety tips for travelers"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Travel Details Section */}
                  <div className="dashboard-section">
                    <h3>Travel Details</h3>
                    {/* ... travel details fields ... */}
                  </div>

                  {/* SEO Section */}
                  <div className="dashboard-section">
                    <h3>SEO Information</h3>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>Meta Title</label>
                        <input
                          type="text"
                          name="meta_title"
                          value={travelFormData.meta_title}
                          onChange={handleTravelFieldChange}
                          onPaste={handleMetaPaste('meta_title')}
                          maxLength={60}
                          placeholder="Enter meta title for SEO (50-60 characters)"
                        />
                        {metaPasteWarning.meta_title && <div className="error">{metaPasteWarning.meta_title}</div>}
                        {getMetaError('meta_title', travelFormData.meta_title) && <div className="error">{getMetaError('meta_title', travelFormData.meta_title)}</div>}
                      </div>
                      <div className="dashboard-col">
                        <label>Meta Description</label>
                        <textarea
                          name="meta_description"
                          value={travelFormData.meta_description}
                          onChange={handleTravelFieldChange}
                          onPaste={handleMetaPaste('meta_description')}
                          rows="2"
                          maxLength={160}
                          placeholder="Enter meta description for SEO (150-160 characters)"
                        />
                        {metaPasteWarning.meta_description && <div className="error">{metaPasteWarning.meta_description}</div>}
                        {getMetaError('meta_description', travelFormData.meta_description) && <div className="error">{getMetaError('meta_description', travelFormData.meta_description)}</div>}
                      </div>
                    </div>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>Meta Keywords</label>
                        <input
                          type="text"
                          name="meta_keywords"
                          value={travelFormData.meta_keywords}
                          onChange={handleTravelFieldChange}
                          onPaste={handleMetaPaste('meta_keywords')}
                          onKeyDown={(e) => handleMetaKeywordsInput(e, 'travel')}
                          placeholder="Type keywords and press Enter or comma to add"
                        />
                        {metaPasteWarning.meta_keywords && <div className="error">{metaPasteWarning.meta_keywords}</div>}
                        {getMetaError('meta_keywords', travelFormData.meta_keywords) && <div className="error">{getMetaError('meta_keywords', travelFormData.meta_keywords)}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-actions-row">
                    <button
                      className="save-btn"
                      style={{
                        background: isEditingTravel ? '#1976d2' : '#43a047',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px 22px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.18s',
                      }}
                      onClick={handleSaveTravel}
                    >
                      {isEditingTravel ? 'Update' : 'Create'}
                    </button>
                    <button className="cancel-btn" onClick={handleCancelTravelDashboard}>Cancel</button>
                    {travelError && <div className="error" style={{marginTop: '10px'}}>{travelError}</div>}
                  </div>
                </div>
              ) : (
                <div className="travels-list">
                  {travelsLoading ? (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      Loading travel information for {selectedSubdistrict.title || 'selected subdistrict'}...
                    </div>
                  ) : travels.length > 0 ? (
                    <table className="travels-table" style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginTop: '20px',
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <thead>
                        <tr style={{
                          backgroundColor: '#f5f5f5',
                          borderBottom: '2px solid #ddd'
                        }}>
                          <th style={{ padding: '12px', textAlign: 'left', width: '60px' }}>Sr. No.</th>
                          <th style={{ padding: '12px', textAlign: 'left', width: '150px' }}>Featured Image</th>
                          <th style={{ padding: '12px', textAlign: 'left', width: '200px' }}>Title</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                          <th style={{ padding: '12px', textAlign: 'left', width: '120px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {travels.map((travel, idx) => (
                          <tr key={travel.id} style={{
                            borderBottom: '1px solid #eee',
                            '&:hover': { backgroundColor: '#f9f9f9' }
                          }}>
                            <td style={{ padding: '12px', color: '#666' }}>{idx + 1}</td>
                            <td style={{ padding: '12px' }}>
                              {travel.featured_image ? (
                                <div style={{
                                  width: '120px',
                                  height: '80px',
                                  position: 'relative',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                  border: '1px solid #ddd'
                                }}>
                                  <img
                                    src={formatImageUrl(travel.featured_image)}
                                    alt={travel.title || travel.meta_title}
                                    style={{ 
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      console.error('Image failed to load:', travel.featured_image);
                                      e.target.src = '/placeholder-image.jpg';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div style={{
                                  width: '120px',
                                  height: '80px',
                                  backgroundColor: '#f5f5f5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd',
                                  color: '#999',
                                  fontSize: '12px'
                                }}>
                                  No Image
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{
                                fontWeight: '500',
                                fontSize: '15px',
                                color: '#333',
                                marginBottom: '4px'
                              }}>
                                {travel.title || travel.meta_title}
                              </div>
                              {travel.slug && (
                                <div style={{
                                  fontSize: '12px',
                                  color: '#666',
                                  fontStyle: 'italic'
                                }}>
                                  /{travel.slug}
                                </div>
                              )}
                            </td>
                            <td style={{ 
                              padding: '12px',
                              maxWidth: '400px',
                              color: '#666',
                              lineHeight: '1.4'
                            }}>
                              {formatDescription(travel.description)}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div className="action-btn-row" style={{ 
                                display: 'flex', 
                                gap: '8px',
                                justifyContent: 'flex-start'
                              }}>
                                <button 
                                  className="edit-btn" 
                                  onClick={() => handleEditTravel(travel)}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    '&:hover': { backgroundColor: '#1565c0' }
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="delete-btn" 
                                  onClick={() => handleDeleteTravel(travel.id)}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    '&:hover': { backgroundColor: '#c82333' }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ 
                      color: '#666', 
                      marginTop: '20px', 
                      textAlign: 'center',
                      padding: '20px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      border: '1px solid #eee'
                    }}>
                      No travel information found for {selectedSubdistrict.title || 'this subdistrict'}. Click "Add New" to create travel information.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    if (activeTab === 'images') {
      return (
        <div className="tab-content-images">
          {!selectedDistrict ? (
            <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
              Please select a district first
            </div>
          ) : !selectedSubdistrict ? (
            <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
              Please select a subdistrict to manage its images
            </div>
          ) : (
            <>
              <div className="tab-header-row">
                {!showImageDashboard && (
                  <button className="add-new-btn" onClick={handleAddNewImage}>Add New Image</button>
                )}
              </div>
              {showImageDashboard ? (
                <div className="image-dashboard-panel">
                  <div className="dashboard-section">
                    <h3>Image Information</h3>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          style={{ marginBottom: '10px' }}
                        />
                        {imageFormData.image_preview && (
                          <div style={{ marginTop: '10px' }}>
                            <img
                              src={imageFormData.image_preview}
                              alt="Preview"
                              style={{
                                maxWidth: '200px',
                                maxHeight: '150px',
                                objectFit: 'contain',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>Alt Text</label>
                        <input
                          type="text"
                          name="alt_text"
                          value={imageFormData.alt_text}
                          onChange={handleImageFieldChange}
                          placeholder="Enter alt text for the image"
                        />
                      </div>
                    </div>
                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <label>Description</label>
                        <textarea
                          name="description"
                          value={imageFormData.description}
                          onChange={handleImageFieldChange}
                          rows="3"
                          placeholder="Enter description for the image"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-actions-row">
                    <button
                      className="save-btn"
                      onClick={handleSaveImage}
                      style={{
                        background: isEditingImage ? '#1976d2' : '#43a047',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px 22px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      {isEditingImage ? 'Update' : 'Save'} Image
                    </button>
                    <button className="cancel-btn" onClick={handleCancelImageDashboard}>Cancel</button>
                    {imageError && <div className="error" style={{marginTop: '10px'}}>{imageError}</div>}
                  </div>
                </div>
              ) : (
                <div className="images-list">
                  {imagesLoading ? (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      Loading images...
                    </div>
                  ) : images.length > 0 ? (
                    <div className="images-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '20px',
                      padding: '20px 0'
                    }}>
                      {images.map((image, idx) => (
                        <div 
                          key={image.id} 
                          className="image-card" 
                          style={{
                            aspectRatio: '1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.querySelector('.image-overlay').style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.querySelector('.image-overlay').style.opacity = '0';
                          }}
                        >
                          <img
                            src={formatImageUrl(image.image_url)} 
                            alt={image.alt_text || 'Subdistrict image'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => {
                              console.error('Image failed to load:', image.image_url);
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className="image-overlay" style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.6)',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '16px'
                          }}>
                            <button
                              className="edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditImage(image);
                              }}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: 'white',
                                color: '#1976d2',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                '&:hover': {
                                  backgroundColor: '#f0f0f0',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                }
                              }}
                            >
                              <span style={{ fontSize: '18px' }}>✏️</span> Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(image.id);
                              }}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: 'white',
                                color: '#dc3545',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                '&:hover': {
                                  backgroundColor: '#f0f0f0',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                }
                              }}
                            >
                              <span style={{ fontSize: '18px' }}>🗑️</span> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      color: '#666',
                      marginTop: '20px',
                      textAlign: 'center',
                      padding: '20px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      border: '1px solid #eee'
                    }}>
                      No images found for this subdistrict. Click "Add New Image" to upload images.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    if (activeTab === 'virtual_tour') {
      return (
        <div className="tab-content-virtual-tour">
          <div className="tab-header-row">
            {!showVirtualTourDashboard && selectedSubdistrict && (
              <button className="add-new-btn" onClick={handleAddNewVirtualTour}>
                Add New Virtual Tour
              </button>
            )}
          </div>

          {showVirtualTourDashboard ? (
            <div className="virtual-tour-dashboard-panel">
              {/* Basic Information Section */}
              <div className="dashboard-section">
                <h3>Basic Information</h3>
                <div className="dashboard-row">
                  <div className="dashboard-col">
                    <label>Institution Type</label>
                    <select
                      name="institution_type"
                      value={virtualTourFormData.institution_type}
                      onChange={handleVirtualTourFieldChange}
                      className="form-select"
                    >
                      <option value="">Select Type</option>
                      <option value="education">Education</option>
                      <option value="healthcare">Healthcare</option>
                    </select>
                  </div>
                  <div className="dashboard-col">
                    <label>Institution Name</label>
                    <select
                      name="institution_id"
                      value={virtualTourFormData.institution_id}
                      onChange={handleVirtualTourFieldChange}
                      className="form-select"
                      disabled={!virtualTourFormData.institution_type}
                    >
                      <option value="">Select Institution</option>
                      {/* Institutions list will be loaded dynamically */}
                    </select>
                  </div>
                </div>

                <div className="dashboard-row">
                  <div className="dashboard-col">
                    <label>Tour Title</label>
                    <input
                      type="text"
                      name="title"
                      value={virtualTourFormData.title}
                      onChange={handleVirtualTourFieldChange}
                      placeholder="Enter tour title"
                      className="form-input"
                    />
                  </div>
                  <div className="dashboard-col">
                    <label>Tour Type</label>
                    <select
                      name="tour_type"
                      value={virtualTourFormData.tour_type}
                      onChange={handleVirtualTourFieldChange}
                      className="form-select"
                    >
                      <option value="interactive">Interactive Tour</option>
                      <option value="360">360° Panorama</option>
                      <option value="video">Video Tour</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="dashboard-actions-row">
                <button 
                  className="save-btn"
                  onClick={() => {/* TODO: Implement next step */}}
                  disabled={!virtualTourFormData.institution_type || !virtualTourFormData.institution_id || !virtualTourFormData.title}
                >
                  Next Step
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancelVirtualTour}
                >
                  Cancel
                </button>
              </div>

              {virtualTourError && (
                <div className="error-message">
                  {virtualTourError}
                </div>
              )}
            </div>
          ) : (
            <div className="virtual-tours-list">
              {!selectedSubdistrict ? (
                <div className="no-selection-message">
                  Please select a subdistrict to view or manage virtual tours
                </div>
              ) : virtualToursLoading ? (
                <div className="loading-message">
                  Loading virtual tours...
                </div>
              ) : virtualTours.length > 0 ? (
                <table className="virtual-tours-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Institution</th>
                      <th>Tour Title</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {virtualTours.map((tour, index) => (
                      <tr key={tour.id}>
                        <td>{index + 1}</td>
                        <td>{tour.institution_name}</td>
                        <td>{tour.title}</td>
                        <td>{tour.tour_type}</td>
                        <td>{tour.status}</td>
                        <td>
                          <div className="action-btn-row">
                            <button className="edit-btn">Edit</button>
                            <button className="preview-btn">Preview</button>
                            <button className="delete-btn">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-tours-message">
                  No virtual tours found. Click "Add New Virtual Tour" to create one.
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    if (activeTab === 'weather') {
      if (!selectedSubdistrict) {
      return (
          <div className="tab-content-weather">
            <div style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>
              Please select a subdistrict to view its weather information
            </div>
                </div>
        );
      }

      if (weatherLoading) {
        return (
          <div className="tab-content-weather">
            <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading weather data...</div>
          </div>
        );
      }

      if (weatherError) {
        return (
          <div className="tab-content-weather">
            <div style={{ color: '#dc3545', marginTop: '20px', textAlign: 'center' }}>{weatherError}</div>
          </div>
        );
      }

      return (
        <div className="tab-content-weather">
          <div className="weather-sections">
            {/* Current Weather Section */}
            {renderCurrentWeather()}

            {/* Weather Alerts Section - Only live alerts */}
            <div className="weather-section">
              <h3>Live Weather Alerts</h3>
              {weatherData?.alerts?.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Title</th>
                        <th>Duration</th>
                      <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                    {weatherData.alerts.map((alert, index) => (
                      <tr key={`live-${index}`}>
                          <td>{alert.type}</td>
                          <td>
                            <span className={`severity-badge ${alert.severity.toLowerCase()}`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td>{alert.title}</td>
                          <td>
                            {new Date(alert.start_date).toLocaleDateString()} - {new Date(alert.end_date).toLocaleDateString()}
                          </td>
                        <td>OpenWeatherMap</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                <p className="no-data-message">No active weather alerts</p>
                )}
              </div>

              {/* Seasonal Guides Section */}
              <div className="weather-section">
                  <h3>Seasonal Guides</h3>
              {!selectedSubdistrict ? (
                <p className="no-data-message">Please select a subdistrict to view seasonal guides</p>
              ) : seasonalGuides.length > 0 ? (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Temperature</th>
                        <th>Rainfall</th>
                        <th>Activities</th>
                        <th>Best Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                    {seasonalGuides.map((guide) => (
                        <tr key={guide.id}>
                          <td>{guide.month}</td>
                          <td>{guide.temperature_range}</td>
                          <td>{guide.rainfall}</td>
                          <td>{formatDescription(guide.activities)}</td>
                          <td>{guide.best_time ? 'Yes' : 'No'}</td>
                        <td>
                          <div className="action-btn-row">
                              <button 
                                className="edit-btn" 
                                onClick={() => {
                                  setSeasonalGuideFormData(guide);
                                  setShowSeasonalGuideForm(true);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="delete-btn" 
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this seasonal guide?')) {
                                    handleDeleteSeasonalGuide(guide.id);
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button 
                    className="add-new-btn" 
                    onClick={() => {
                      setSeasonalGuideFormData({
                        month: '',
                        temperature_range: '',
                        rainfall: '',
                        activities: '',
                        packing_suggestions: '',
                        best_time: false
                      });
                      setShowSeasonalGuideForm(true);
                    }}
                  >
                    + Add New Guide
                  </button>
                </>
              ) : (
                <>
                  <p className="no-data-message">No seasonal guides available for {selectedSubdistrict.title}</p>
                  <button 
                    className="add-new-btn" 
                    onClick={() => {
                      setSeasonalGuideFormData({
                        month: '',
                        temperature_range: '',
                        rainfall: '',
                        activities: '',
                        packing_suggestions: '',
                        best_time: false
                      });
                      setShowSeasonalGuideForm(true);
                    }}
                  >
                + Add New Guide
                  </button>
                </>
              )}
              </div>

              {/* Tourist Features Section */}
              <div className="weather-section">
                  <h3>Tourist Features</h3>
              {touristFeatures?.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                      <th>Best Season</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                    {touristFeatures.map((feature) => (
                        <tr key={feature.id}>
                          <td>{feature.title}</td>
                        <td>{formatDescription(feature.description)}</td>
                        <td>{feature.best_season}</td>
                          <td>
                          <div className="action-btn-row">
                              <button className="edit-btn" onClick={() => handleEditTouristFeature(feature)}>Edit</button>
                              <button className="delete-btn" onClick={() => handleDeleteTouristFeature(feature.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                <p className="no-data-message">No tourist features available</p>
                )}
              <button className="add-new-btn" onClick={() => setShowTouristFeatureForm(true)}>
                + Add New Feature
              </button>
              </div>

              {/* Weather Activities Section */}
              <div className="weather-section">
                  <h3>Weather Activities</h3>
              {weatherActivities?.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Best Season</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                    {weatherActivities.map((activity) => (
                        <tr key={activity.id}>
                          <td>{activity.title}</td>
                        <td>{formatDescription(activity.description)}</td>
                          <td>{activity.best_season}</td>
                          <td>
                          <div className="action-btn-row">
                              <button className="edit-btn" onClick={() => handleEditActivity(activity)}>Edit</button>
                              <button className="delete-btn" onClick={() => handleDeleteActivity(activity.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                <p className="no-data-message">No weather activities available</p>
                )}
              <button className="add-new-btn" onClick={() => setShowActivityForm(true)}>
                + Add New Activity
              </button>
              </div>

            {/* Conditionally render forms for add/edit */}
              {showSeasonalGuideForm && (
                <SeasonalGuideForm
                  formData={seasonalGuideFormData}
                onChange={handleSeasonalGuideChange}
                  onSubmit={handleSeasonalGuideSubmit}
                  onCancel={() => setShowSeasonalGuideForm(false)}
                />
              )}
              {showTouristFeatureForm && (
                <TouristFeatureForm
                  formData={touristFeatureFormData}
                onChange={handleTouristFeatureChange}
                  onSubmit={handleTouristFeatureSubmit}
                  onCancel={() => setShowTouristFeatureForm(false)}
                />
              )}
              {showActivityForm && (
                <WeatherActivityForm
                  formData={activityFormData}
                onChange={handleActivityChange}
                  onSubmit={handleActivitySubmit}
                  onCancel={() => setShowActivityForm(false)}
                />
              )}

          </div>
        </div>
      );
    }
    // For other tabs, show dropdowns, Add New button, and placeholder list
      return (
      <div className="tab-content-section">
        {selectedSubdistrict ? (
          <>
            <div className="tab-header-row">
              <button className="add-new-btn">Add New</button>
            </div>
            <div className="tab-list-placeholder">
              {/* Placeholder: Replace with actual list for each tab */}
              <p>List for <b>{TABS.find(t => t.key === activeTab).label}</b> of selected subdistrict will appear here.</p>
            </div>
          </>
        ) : (
          <div className="tab-list-placeholder">
            <p>Please select a subdistrict to view or manage {TABS.find(t => t.key === activeTab).label}.</p>
          </div>
        )}
      </div>
    );
  };

  // Dropdowns UI (shared for all tabs)
  const renderDropdowns = () => (
    <div className="state-district-selector">
      <div className="selector-group">
        <label htmlFor="state-select">Select State:</label>
        {loading ? (
          <span>Loading states...</span>
        ) : (
          <select
            id="state-select"
            value={selectedState}
            onChange={handleStateChange}
            disabled={!!selectedTerritory}
          >
            <option value="">-- Select State --</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="selector-group">
        <label htmlFor="territory-select">Select Territory:</label>
        {loading ? (
          <span>Loading territories...</span>
        ) : (
          <select
            id="territory-select"
            value={selectedTerritory}
            onChange={handleTerritoryChange}
            disabled={!!selectedState}
          >
            <option value="">-- Select Territory --</option>
            {territories.map(t => (
              <option key={t.id} value={t.id}>{t.title || t.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="selector-group">
        <label htmlFor="district-select">Select District:</label>
        {loading ? (
          <span>Loading districts...</span>
        ) : (
          <select
            id="district-select"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedState && !selectedTerritory}
          >
            <option value="">-- Select District --</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.stateName})
              </option>
            ))}
          </select>
        )}
      </div>
      {activeTab !== 'districts' && (
        <div className="selector-group">
          <label htmlFor="subdistrict-select">Select Subdistrict:</label>
          <select
            id="subdistrict-select"
            value={selectedSubdistrict?.id || ''}
            onChange={e => {
              const subdistrict = subdistricts.find(s => s.id === parseInt(e.target.value));
              setSelectedSubdistrict(subdistrict || null);
            }}
            disabled={!selectedDistrict}
          >
            <option value="">-- Select Subdistrict --</option>
            {subdistricts.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // Restore handleSaveAttraction function
  const handleSaveAttraction = async () => {
    setAttractionError(null);
    if (!selectedSubdistrict?.id) {
      setAttractionError('Please select a subdistrict first.');
      return;
    }
    if (!attractionFormData.title || !attractionFormData.slug) {
      setAttractionError('Title and slug are required.');
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', attractionFormData.title);
      formDataToSend.append('slug', attractionFormData.slug);
      formDataToSend.append('description', attractionFormData.description);
      formDataToSend.append('meta_title', attractionFormData.meta_title);
      formDataToSend.append('meta_description', attractionFormData.meta_description);
      formDataToSend.append('meta_keywords', attractionFormData.meta_keywords);
      if (attractionFormData.featured_image) {
        formDataToSend.append('featured_image', attractionFormData.featured_image);
      }

      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-attractions` : 
        `${API_URL}/api/attractions`;

      if (isEditingAttraction && attractionFormData.id) {
        // Update
        await axios.put(`${baseUrl}/${attractionFormData.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create
        if (selectedTerritory) {
          formDataToSend.append('territory_subdistrict_id', selectedSubdistrict.id);
        } else {
          formDataToSend.append('subdistrict_id', selectedSubdistrict.id);
        }
        await axios.post(baseUrl, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Refresh attractions list
      await fetchAttractions();
      // Reset form and close dashboard
      setShowAttractionDashboard(false);
      setIsEditingAttraction(false);
      setAttractionFormData({
        id: null,
        title: '',
        slug: '',
        featured_image: null,
        featured_image_preview: null,
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: ''
      });
    } catch (err) {
      console.error('Error saving attraction:', err);
      setAttractionError('Failed to save attraction. Please try again.');
    }
  };

  // Helper to handle paste blocking and warning
  const handleMetaPaste = (field) => (e) => {
    if (metaPasteAttempts[field] < 5) {
      e.preventDefault();
      setMetaPasteAttempts(prev => ({ ...prev, [field]: prev[field] + 1 }));
      setMetaPasteWarning(prev => ({ ...prev, [field]: 'Pasting is not allowed' }));
      setTimeout(() => setMetaPasteWarning(prev => ({ ...prev, [field]: '' })), 2000);
    }
  };

  // Helper to show length/keyword warnings only after 5 attempts
  const getMetaError = (field, value) => {
    if (metaPasteAttempts[field] < 5) return '';
    if (field === 'meta_title') {
      if (value.length > 0 && (value.length < 50 || value.length > 60)) {
        return `Meta title must be between 50-60 characters (current: ${value.length})`;
      }
    }
    if (field === 'meta_description') {
      if (value.length > 0 && (value.length < 150 || value.length > 160)) {
        return `Meta description must be between 150-160 characters (current: ${value.length})`;
      }
    }
    if (field === 'meta_keywords') {
      const keywords = value.split(/[,\n]/).map(k => k.trim()).filter(k => k.length > 0);
      if (keywords.length > 0 && keywords.length < 8) {
        return `Please enter at least 8 keywords (current: ${keywords.length})`;
      }
    }
    return '';
  };

  // Handle meta keywords input for all form types (attraction, culture, travel)
  const handleMetaKeywordsInput = (e, formType = 'attraction') => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      let currentValue;
      if (formType === 'attraction') {
        currentValue = attractionFormData.meta_keywords || '';
      } else if (formType === 'culture') {
        currentValue = cultureFormData.meta_keywords || '';
      } else if (formType === 'travel') {
        currentValue = travelFormData.meta_keywords || '';
      }
      
      const keywords = currentValue.split(/[,\n]/).map(k => k.trim()).filter(k => k.length > 0);
      const lastKeyword = keywords[keywords.length - 1] || '';
      
      // Only add comma if there's text and it doesn't end with comma
      if (lastKeyword && !currentValue.endsWith(', ')) {
        const newValue = currentValue + ', ';
        if (formType === 'attraction') {
          setAttractionFormData(prev => ({ ...prev, meta_keywords: newValue }));
        } else if (formType === 'culture') {
          setCultureFormData(prev => ({ ...prev, meta_keywords: newValue }));
        } else if (formType === 'travel') {
          setTravelFormData(prev => ({ ...prev, meta_keywords: newValue }));
        }
      }
    }
  };

  // Add travel handlers
  const handleAddNewTravel = () => {
    setIsEditingTravel(false);
    setTravelFormData({
      id: null,
      title: '',  // Changed from meta_title to title
      slug: '',
      featured_image: null,
      featured_image_preview: null,
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      best_time_to_visit: '',
      how_to_reach: '',
      accommodation: '',
      local_transport: '',
      safety_tips: ''
    });
    setShowTravelDashboard(true);
  };

  const handleEditTravel = (travel) => {
    console.log('Editing travel:', travel);
    setIsEditingTravel(true);
    setTravelFormData({
      id: travel.id,
      title: travel.title || '',
      slug: travel.slug || '',
      featured_image: null,
      featured_image_preview: travel.featured_image || null,
      description: travel.description || '',
      meta_title: travel.meta_title || '',
      meta_description: travel.meta_description || '',
      meta_keywords: travel.meta_keywords || '',
      best_time_to_visit: travel.best_time_to_visit || '',
      how_to_reach: travel.transportation?.how_to_reach || '',
      accommodation: travel.accommodation?.details || '',
      local_transport: travel.transportation?.local_transport || '',
      safety_tips: travel.travel_tips?.safety || ''
    });
    setShowTravelDashboard(true);
  };

  // Update handleTravelFieldChange to use the simplified generateSlug
  const handleTravelFieldChange = (e) => {
    const { name, value } = e.target;
    setTravelFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Generate slug from title whenever title changes
      if (name === 'title') {
        newData.slug = generateSlug(value, prev.slug);
      }
      return newData;
    });
  };

  const handleTravelImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTravelFormData(prev => ({
        ...prev,
        featured_image: file,
        featured_image_preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCancelTravelDashboard = () => {
    setShowTravelDashboard(false);
    setIsEditingTravel(false);
    setTravelFormData({
      id: null,
      title: '',  // Changed from meta_title to title
      slug: '',
      featured_image: null,
      featured_image_preview: null,
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      best_time_to_visit: '',
      how_to_reach: '',
      accommodation: '',
      local_transport: '',
      safety_tips: ''
    });
  };

  // Update handleSaveTravel for slug duplicate error only on true duplicate
  const handleSaveTravel = async () => {
    setTravelError(null);
    if (!selectedSubdistrict?.id) {
        setTravelError('Please select a subdistrict first');
        return;
      }
      if (!travelFormData.title) {
        setTravelError('Title is required');
        return;
      }
    const currentSubdistrict = subdistricts.find(s => s.id === parseInt(selectedSubdistrict.id));
      if (!currentSubdistrict) {
        setTravelError('Invalid subdistrict selection');
        return;
      }

      // Modified slug handling for updates
      let slug;
      if (isEditingTravel && travelFormData.id) {
        // When updating, keep the existing slug if title hasn't changed
        const existingTravel = travels.find(t => t.id === travelFormData.id);
        if (existingTravel) {
          if (existingTravel.title === travelFormData.title) {
            // If title hasn't changed, keep the existing slug
            slug = existingTravel.slug;
          } else {
            // If title has changed, generate a new slug with a timestamp to ensure uniqueness
            const timestamp = new Date().getTime();
            slug = `${generateSlug(travelFormData.title)}-${timestamp}`;
          }
        }
      } else {
        // For new entries, generate a slug with timestamp
        const timestamp = new Date().getTime();
        slug = `${generateSlug(travelFormData.title)}-${timestamp}`;
      }

      const baseUrl = selectedTerritory ? 
      `${API_URL}/api/territory-travel-info` : 
      `${API_URL}/api/subdistrict-travel-info`;

      let endpoint;
      if (isEditingTravel && travelFormData.id) {
        endpoint = `${baseUrl}/${travelFormData.id}`;
      } else {
      endpoint = `${baseUrl}/subdistrict/${selectedSubdistrict.id}`;
      }

      const formData = new FormData();
      // Always send the ID when updating
      if (isEditingTravel && travelFormData.id) {
        formData.append('id', travelFormData.id);
      }
      formData.append('title', travelFormData.title);
      formData.append('slug', slug);
      if (travelFormData.description) formData.append('description', travelFormData.description);
      if (travelFormData.meta_title) formData.append('meta_title', travelFormData.meta_title);
      if (travelFormData.meta_description) formData.append('meta_description', travelFormData.meta_description);
      if (travelFormData.meta_keywords) formData.append('meta_keywords', travelFormData.meta_keywords);
      if (travelFormData.best_time_to_visit) formData.append('best_time_to_visit', travelFormData.best_time_to_visit);
      if (travelFormData.how_to_reach) formData.append('how_to_reach', travelFormData.how_to_reach);
      if (travelFormData.accommodation) formData.append('accommodation', travelFormData.accommodation);
      if (travelFormData.local_transport) formData.append('local_transport', travelFormData.local_transport);
      if (travelFormData.safety_tips) formData.append('safety_tips', travelFormData.safety_tips);
      if (travelFormData.featured_image instanceof File) {
        formData.append('featured_image', travelFormData.featured_image);
      }
      if (!isEditingTravel) {
      formData.append('subdistrict_id', selectedSubdistrict.id);
      }

      console.log('Sending request to:', endpoint);
      console.log('Method:', isEditingTravel ? 'PUT' : 'POST');
      console.log('Form data:', Object.fromEntries(formData.entries()));

      const method = isEditingTravel ? 'PUT' : 'POST';
      const response = await axios({
        method,
        url: endpoint,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200 || response.status === 201) {
        await fetchTravels();
        setShowTravelDashboard(false);
        setIsEditingTravel(false);
        setTravelFormData({
          id: null,
          title: '',
          slug: '',
          description: '',
          featured_image: null,
          featured_image_preview: null,
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          best_time_to_visit: '',
          how_to_reach: '',
          accommodation: '',
          local_transport: '',
          safety_tips: ''
        });
        setTravelError(null);
    }
  };

  // Update delete handler in the travels list
  const handleDeleteTravel = async (travelId) => {
    if (!window.confirm('Are you sure you want to delete this travel information?')) return;
    try {
      const baseUrl = selectedTerritory ? 
        `${API_URL}/api/territory-travels` : 
        `${API_URL}/api/subdistrict-travel-info`;
      const endpoint = selectedTerritory ? 
        `${baseUrl}/${travelId}` : 
        `${baseUrl}/state/${travelId}`;
      const response = await axios.delete(endpoint);
      if (response.status === 200 || response.status === 204) {
        await fetchTravels();
        setError(null);
      } else {
        throw new Error('Failed to delete travel information');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete travel information. Please try again.');
    }
  };

  // Add this useEffect after the other useEffects
  useEffect(() => {
    if (activeTab === 'travel') {
      // Clear travels and hide list when subdistrict changes or is unselected
      setTravels([]);
      setShowTravelsList(false);
      
      // Only fetch travels if a subdistrict is selected
      if (selectedSubdistrict) {
        console.log('Fetching travels for subdistrict:', selectedSubdistrict);
        setTravelsLoading(true);
        fetchTravels()
          .then(() => {
            console.log('Travels fetched successfully for subdistrict:', selectedSubdistrict);
          })
          .catch(error => {
            console.error('Error fetching travels:', error);
            setError('Failed to fetch travel information');
            setTravels([]); // Clear travels on error
          })
          .finally(() => {
            setTravelsLoading(false);
          });
      }
    }
  }, [selectedSubdistrict, activeTab, fetchTravels]);

  // Add virtual tour handlers
  const handleAddNewVirtualTour = () => {
    setShowVirtualTourDashboard(true);
    setVirtualTourFormData({
      id: null,
      institution_type: '',
      institution_id: '',
      title: '',
      tour_type: 'interactive',
      scenes: [],
      status: 'draft',
      created_at: null,
      updated_at: null
    });
  };

  const handleCancelVirtualTour = () => {
    setShowVirtualTourDashboard(false);
    setSelectedScene(null);
    setVirtualTourFormData({
      id: null,
      institution_type: '',
      institution_id: '',
      title: '',
      tour_type: 'interactive',
      scenes: [],
      status: 'draft',
      created_at: null,
      updated_at: null
    });
  };

  const handleVirtualTourFieldChange = (e) => {
    const { name, value } = e.target;
    setVirtualTourFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add these handler functions after other handler functions
  const handleWeatherAlertChange = (e) => {
    const { name, value } = e.target;
    setWeatherAlertFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeasonalGuideChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeasonalGuideFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWeatherStatsChange = (e) => {
    const { name, value } = e.target;
    setWeatherStatsFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTouristFeatureChange = (e) => {
    const { name, value } = e.target;
    setTouristFeatureFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setActivityFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWeatherAlertSubmit = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/api/weather/alerts`, {
        ...formData,
        subdistrict_id: selectedSubdistrict.id
      });
      setWeatherAlerts(prev => [...prev, response.data]);
      setShowWeatherAlertForm(false);
    } catch (error) {
      console.error('Error creating weather alert:', error);
      // Handle error appropriately
    }
  };

  const handleEditWeatherAlert = (alert) => {
    setWeatherAlertFormData(alert);
    setShowWeatherAlertForm(true);
  };

  const handleEditSeasonalGuide = (guide) => {
    setSeasonalGuideFormData(guide);
    setShowSeasonalGuideForm(true);
  };

  const handleEditWeatherStats = (stats) => {
    setWeatherStatsFormData(stats);
    setShowWeatherStatsForm(true);
  };

  const handleEditTouristFeature = (feature) => {
    setTouristFeatureFormData(feature);
    setShowTouristFeatureForm(true);
  };

  const handleEditActivity = (activity) => {
    setActivityFormData(activity);
    setShowActivityForm(true);
  };

  const handleDeleteWeatherAlert = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/weather/alerts/${id}`);
      setWeatherAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (error) {
      console.error('Error deleting weather alert:', error);
      // Handle error appropriately
    }
  };

  const handleDeleteSeasonalGuide = async (id) => {
    if (window.confirm('Are you sure you want to delete this seasonal guide?')) {
    try {
      await axios.delete(`${API_URL}/api/weather/seasonal-guides/${id}`);
      setSeasonalGuides(prev => prev.filter(guide => guide.id !== id));
    } catch (error) {
      console.error('Error deleting seasonal guide:', error);
        alert('Failed to delete seasonal guide: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleDeleteWeatherStats = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/weather/statistics/${id}`);
      setWeatherStats(prev => prev.filter(stat => stat.id !== id));
    } catch (error) {
      console.error('Error deleting weather statistics:', error);
      // Handle error appropriately
    }
  };

  const handleDeleteTouristFeature = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/weather/tourist-features/${id}`);
      setTouristFeatures(prev => prev.filter(feature => feature.id !== id));
    } catch (error) {
      console.error('Error deleting tourist feature:', error);
      // Handle error appropriately
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/weather/activities/${id}`);
      setWeatherActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (error) {
      console.error('Error deleting weather activity:', error);
      // Handle error appropriately
    }
  };

  // Add this to useEffect to fetch weather data when a subdistrict is selected
  useEffect(() => {
    fetchWeatherData();
  }, [selectedSubdistrict]);

  // Validation function
  const validateCoordinates = (lat, lng) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return false;
    }
    
    // India ke coordinates ke liye validation
    if (latNum < 8 || latNum > 37 || lngNum < 68 || lngNum > 97) {
      return false;
    }
    
    return true;
  };

  // Add these new functions for handling form submissions
  const handleSeasonalGuideSubmit = async (formData) => {
    try {
      if (!selectedSubdistrict) {
        alert('Please select a subdistrict first');
        return;
      }

      // Prepare guide data with images
      const guideData = {
        subdistrict_id: selectedSubdistrict.id,
        month: formData.month,
        temperature_range: formData.temperature_range,
        rainfall: formData.rainfall,
        activities: formData.activities || '',
        detailed_description: formData.detailed_description || '',
        packing_suggestions: formData.packing_suggestions || '',
        things_to_carry: formData.things_to_carry || [],
        local_events: formData.local_events || '',
        seasonal_food: formData.seasonal_food || '',
        seasonal_attractions: formData.seasonal_attractions || '',
        travel_tips: formData.travel_tips || '',
        images: formData.images || []
      };

      console.log('Submitting guide data:', guideData);
      const response = await axios.post(`${API_URL}/api/weather/seasonal-guides`, guideData);
      
      if (response.data) {
        alert('Seasonal guide saved successfully!');
      setShowSeasonalGuideForm(false);
        fetchSeasonalGuides();
      }
    } catch (error) {
      console.error('Error saving seasonal guide:', error);
      alert(error.response?.data?.message || 'Error saving seasonal guide');
    }
  };

  const handleWeatherStatsSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/weather/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subdistrict_id: selectedSubdistrict.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add weather statistics');
      }

      // Refresh weather data after successful submission
      await fetchWeatherData();
      setShowWeatherStatsForm(false);
    } catch (error) {
      console.error('Error adding weather statistics:', error);
      alert('Failed to add weather statistics. Please try again.');
    }
  };

  const handleTouristFeatureSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/weather/tourist-features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subdistrict_id: selectedSubdistrict.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tourist feature');
      }

      // Refresh weather data after successful submission
      await fetchWeatherData();
      setShowTouristFeatureForm(false);
    } catch (error) {
      console.error('Error adding tourist feature:', error);
      alert('Failed to add tourist feature. Please try again.');
    }
  };

  const handleActivitySubmit = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/weather/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subdistrict_id: selectedSubdistrict.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add weather activity');
      }

      // Refresh weather data after successful submission
      await fetchWeatherData();
      setShowActivityForm(false);
    } catch (error) {
      console.error('Error adding weather activity:', error);
      alert('Failed to add weather activity. Please try again.');
    }
  };

  // Add this function to fetch seasonal guides
  const fetchSeasonalGuides = async () => {
    if (!selectedSubdistrict?.id) {
      console.log('No subdistrict selected for seasonal guides');
      setSeasonalGuides([]);
      return;
    }

    try {
      console.log('Fetching seasonal guides for subdistrict:', selectedSubdistrict.id);
      const response = await axios.get(`${API_URL}/api/weather/seasonal-guides/${selectedSubdistrict.id}`);
      console.log('Received seasonal guides:', response.data);
      setSeasonalGuides(response.data);
    } catch (error) {
      console.error('Error fetching seasonal guides:', error);
      setSeasonalGuides([]);
    }
  };

  // Update useEffect to fetch seasonal guides when subdistrict changes
  useEffect(() => {
    if (selectedSubdistrict?.id) {
      console.log('Selected subdistrict changed, fetching data...');
      fetchWeatherData();
      fetchSeasonalGuides();
    } else {
      setSeasonalGuides([]);
    }
  }, [selectedSubdistrict]);

  const renderSeasonalGuidesSection = () => {
    if (!selectedSubdistrict) {
      return (
        <div className="no-selection-message">
          Please select a subdistrict to view or manage seasonal guides
        </div>
      );
    }

    return (
      <div className="seasonal-guides-section">
        <div className="section-header">
          <h3>Seasonal Guides</h3>
          <button 
            className="add-new-btn"
            onClick={() => {
              setSeasonalGuideFormData({
                month: '',
                temperature_range: '',
                rainfall: '',
                activities: '',
                detailed_description: '',
                packing_suggestions: '',
                things_to_carry: [],
                local_events: '',
                seasonal_food: '',
                seasonal_attractions: '',
                travel_tips: '',
                images: []
              });
              setShowSeasonalGuideForm(true);
            }}
          >
            <i className="fas fa-plus"></i> Add New Guide
          </button>
        </div>

        {seasonalGuides.length === 0 ? (
          <div className="no-data-message">No seasonal guides available for this subdistrict</div>
        ) : (
          <div className="guides-table-container">
            <table className="guides-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Temperature</th>
                  <th>Rainfall</th>
                  <th>Activities</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {seasonalGuides.map((guide, index) => (
                  <tr key={guide.id || index}>
                    <td>{guide.month}</td>
                    <td>{guide.temperature_range}</td>
                    <td>{guide.rainfall}</td>
                    <td>{guide.activities}</td>
                    <td>
                      {guide.images && guide.images.length > 0 ? (
                        <div className="guide-images">
                          {guide.images.map((image, imgIndex) => (
                            <img 
                              key={imgIndex}
                              src={formatImageUrl(image.path)}
                              alt={image.alt_text || `Seasonal guide image ${imgIndex + 1}`}
                              className="guide-thumbnail"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="no-images">No images</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditSeasonalGuide(guide)}
                          title="Edit Guide"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this guide?')) {
                              handleDeleteSeasonalGuide(guide.id);
                            }
                          }}
                          title="Delete Guide"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="manage-subdistricts-container">
      <div className="manage-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`manage-tab-btn${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderDropdowns()}

      <div className="manage-tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ManageSubdistricts;