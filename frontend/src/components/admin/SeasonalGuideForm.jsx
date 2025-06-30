import React, { useState, useEffect } from 'react';
import './styles/WeatherForms.css';

const seasons = [
  { name: 'Winter', months: ['December', 'January', 'February'] },
  { name: 'Summer', months: ['March', 'April', 'May', 'June'] },
  { name: 'Monsoon', months: ['July', 'August', 'September'] },
  { name: 'Autumn', months: ['October', 'November'] },
];

const SeasonalGuideForm = ({ formData, onSubmit, onCancel }) => {
  const [formState, setFormState] = useState(formData || {
    season: '',
    temperature_range: '',
    rainfall: '',
    activities: '',
    detailed_description: '',
    month_images: [],
    packing_suggestions: '',
    things_to_carry: '',
    best_time: '',
    local_events: '',
    seasonal_food: '',
    seasonal_attractions: '',
    travel_tips: ''
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageAltTexts, setImageAltTexts] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.preview) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [imagePreviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploadingImages(true);

    try {
      // Create preview URLs for selected images
      const previews = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        alt: ''
      }));
      setImagePreviews(prev => [...prev, ...previews]);

      // Initialize alt texts for new images
      const newAltTexts = {};
      previews.forEach((_, index) => {
        newAltTexts[`image_${Date.now()}_${index}`] = '';
      });
      setImageAltTexts(prev => ({ ...prev, ...newAltTexts }));

    } catch (error) {
      alert('Error creating image previews. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAltTextChange = (imageId, value) => {
    setImageAltTexts(prev => ({
      ...prev,
      [imageId]: value
    }));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formState.season || !formState.temperature_range || !formState.rainfall) {
        alert('Please fill in all required fields: Season, Temperature Range, and Rainfall');
        return;
      }

      // Prepare the data to match backend schema
      const formDataToSubmit = {
        month: formState.season, // Using season as month
        temperature_range: formState.temperature_range,
        rainfall: formState.rainfall,
        activities: formState.activities || '',
        detailed_description: formState.detailed_description || '',
        packing_suggestions: formState.packing_suggestions || '',
        things_to_carry: formState.things_to_carry || [],
        best_time: formState.best_time || false,
        local_events: formState.local_events || '',
        seasonal_food: formState.seasonal_food || '',
        seasonal_attractions: formState.seasonal_attractions || '',
        travel_tips: formState.travel_tips || ''
      };

      await onSubmit(formDataToSubmit);
    } catch (error) {
      alert('Error submitting form: ' + error.message);
    }
  };

  // Find selected season's months
  const selectedSeason = seasons.find(s => s.name === formState.season);
  const seasonMonths = selectedSeason ? selectedSeason.months : [];

  return (
    <div className="weather-form-overlay">
      <div className="weather-form-container">
        <h2>Add Seasonal Guide</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="season">Season</label>
            <select
              id="season"
              name="season"
              value={formState.season}
              onChange={handleChange}
              required
            >
              <option value="">Select Season</option>
              {seasons.map(season => (
                <option key={season.name} value={season.name}>{season.name}</option>
              ))}
            </select>
          </div>
          {formState.season && (
            <div className="form-group">
              <label>Months in this season:</label>
              <div style={{ fontWeight: 'bold', color: '#1976d2' }}>{seasonMonths.join(', ')}</div>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="temperature_range">Temperature Range</label>
              <input
                type="text"
                id="temperature_range"
                name="temperature_range"
                value={formState.temperature_range}
                onChange={handleChange}
                placeholder="e.g., 20°C - 30°C"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="rainfall">Rainfall</label>
              <input
                type="text"
                id="rainfall"
                name="rainfall"
                value={formState.rainfall}
                onChange={handleChange}
                placeholder="e.g., 100mm"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="activities">Activities</label>
            <textarea
              id="activities"
              name="activities"
              value={formState.activities}
              onChange={handleChange}
              placeholder="List of activities available during this season"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="detailed_description">Detailed Description</label>
            <textarea
              id="detailed_description"
              name="detailed_description"
              value={formState.detailed_description}
              onChange={handleChange}
              placeholder="Detailed description of the season"
              required
            />
          </div>
          <div className="form-group">
            <label>Seasonal Images</label>
            <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
                className="image-upload-input"
              />
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                      title="Remove image"
                    >
                      ✕
                    </button>
                    <img src={preview.preview} alt="Preview" />
                    <input
                      type="text"
                      placeholder="Enter alt text"
                      value={imageAltTexts[`image_${index}`] || ''}
                      onChange={(e) => handleAltTextChange(`image_${index}`, e.target.value)}
                      className="alt-text-input"
                    />
                </div>
              ))}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="packing_suggestions">Packing Suggestions</label>
            <textarea
              id="packing_suggestions"
              name="packing_suggestions"
              value={formState.packing_suggestions}
              onChange={handleChange}
              placeholder="What to pack for this season"
            />
          </div>
          <div className="form-group">
            <label htmlFor="things_to_carry">Things to Carry</label>
            <textarea
              id="things_to_carry"
              name="things_to_carry"
              value={formState.things_to_carry}
              onChange={handleChange}
              placeholder="Essential items to carry"
            />
          </div>
          <div className="form-group">
            <label htmlFor="best_time">Best Time to Visit</label>
            <input
              type="text"
              id="best_time"
              name="best_time"
              value={formState.best_time}
              onChange={handleChange}
              placeholder="e.g., Early morning, Afternoon"
            />
          </div>
          <div className="form-group">
            <label htmlFor="local_events">Local Events</label>
            <textarea
              id="local_events"
              name="local_events"
              value={formState.local_events}
              onChange={handleChange}
              placeholder="Festivals, fairs, or events during this season"
            />
          </div>
          <div className="form-group">
            <label htmlFor="seasonal_food">Seasonal Food</label>
            <textarea
              id="seasonal_food"
              name="seasonal_food"
              value={formState.seasonal_food}
              onChange={handleChange}
              placeholder="Special food items available during this season"
            />
          </div>
          <div className="form-group">
            <label htmlFor="seasonal_attractions">Seasonal Attractions</label>
            <textarea
              id="seasonal_attractions"
              name="seasonal_attractions"
              value={formState.seasonal_attractions}
              onChange={handleChange}
              placeholder="Special attractions during this season"
            />
          </div>
          <div className="form-group">
            <label htmlFor="travel_tips">Travel Tips</label>
            <textarea
              id="travel_tips"
              name="travel_tips"
              value={formState.travel_tips}
              onChange={handleChange}
              placeholder="Tips for traveling during this season"
            />
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={uploadingImages}
            >
              {uploadingImages ? 'Uploading...' : 'Save'}
            </button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onCancel}
              disabled={uploadingImages}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeasonalGuideForm; 