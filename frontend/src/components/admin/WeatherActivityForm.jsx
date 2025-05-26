import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherForms.css';

const WeatherActivityForm = ({ formData, onSubmit, onCancel }) => {
  const [formState, setFormState] = useState({
    activity_type: '',
    title: '',
    description: '',
    detailed_description: '',
    activity_images: [],
    weather_requirements: '',
    indoor_outdoor: 'outdoor',
    best_season: '',
    recommendations: '',
    things_to_carry: '',
    difficulty_level: 'easy',
    duration: '',
    cost_range: '',
    age_restrictions: '',
    safety_guidelines: '',
    required_permits: '',
    contact_info: ''
  });

  useEffect(() => {
    if (formData) {
      setFormState(formData);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/weather/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormState(prev => ({
        ...prev,
        activity_images: [...prev.activity_images, ...response.data.imagePaths]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="weather-form-overlay">
      <div className="weather-form-container">
        <h2>{formData?.id ? 'Edit Weather Activity' : 'Add Weather Activity'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="activity_type">Activity Type</label>
            <select
              id="activity_type"
              name="activity_type"
              value={formState.activity_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="trekking">Trekking</option>
              <option value="camping">Camping</option>
              <option value="water_sports">Water Sports</option>
              <option value="adventure_sports">Adventure Sports</option>
              <option value="wildlife_safari">Wildlife Safari</option>
              <option value="bird_watching">Bird Watching</option>
              <option value="photography">Photography</option>
              <option value="cultural_tour">Cultural Tour</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Short Description</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleChange}
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
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weather_requirements">Weather Requirements</label>
            <textarea
              id="weather_requirements"
              name="weather_requirements"
              value={formState.weather_requirements}
              onChange={handleChange}
              placeholder="Enter weather conditions required for this activity"
            />
          </div>

          <div className="form-group">
            <label htmlFor="indoor_outdoor">Indoor/Outdoor</label>
            <select
              id="indoor_outdoor"
              name="indoor_outdoor"
              value={formState.indoor_outdoor}
              onChange={handleChange}
              required
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="best_season">Best Season</label>
            <input
              type="text"
              id="best_season"
              name="best_season"
              value={formState.best_season}
              onChange={handleChange}
              placeholder="e.g., Winter, Summer, Monsoon"
            />
          </div>

          <div className="form-group">
            <label htmlFor="recommendations">Recommendations</label>
            <textarea
              id="recommendations"
              name="recommendations"
              value={formState.recommendations}
              onChange={handleChange}
              placeholder="Enter recommendations, separated by commas"
            />
          </div>

          <div className="form-group">
            <label htmlFor="things_to_carry">Things to Carry</label>
            <textarea
              id="things_to_carry"
              name="things_to_carry"
              value={formState.things_to_carry}
              onChange={handleChange}
              placeholder="Enter items to carry, separated by commas"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty_level">Difficulty Level</label>
              <select
                id="difficulty_level"
                name="difficulty_level"
                value={formState.difficulty_level}
                onChange={handleChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="difficult">Difficult</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formState.duration}
                onChange={handleChange}
                placeholder="e.g., 2 hours, 1 day"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cost_range">Cost Range</label>
              <input
                type="text"
                id="cost_range"
                name="cost_range"
                value={formState.cost_range}
                onChange={handleChange}
                placeholder="e.g., ₹500-1000 per person"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="age_restrictions">Age Restrictions</label>
            <input
              type="text"
              id="age_restrictions"
              name="age_restrictions"
              value={formState.age_restrictions}
              onChange={handleChange}
              placeholder="e.g., 12+ years"
            />
          </div>

          <div className="form-group">
            <label htmlFor="safety_guidelines">Safety Guidelines</label>
            <textarea
              id="safety_guidelines"
              name="safety_guidelines"
              value={formState.safety_guidelines}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="required_permits">Required Permits</label>
            <textarea
              id="required_permits"
              name="required_permits"
              value={formState.required_permits}
              onChange={handleChange}
              placeholder="Enter permit requirements"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact_info">Contact Information</label>
            <textarea
              id="contact_info"
              name="contact_info"
              value={formState.contact_info}
              onChange={handleChange}
              placeholder="Enter contact details"
            />
          </div>

          <div className="form-group">
            <label htmlFor="activity_images">Activity Images</label>
            <input
              type="file"
              id="activity_images"
              name="activity_images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
            />
            {formState.activity_images.length > 0 && (
              <div className="image-preview">
                {formState.activity_images.map((image, index) => (
                  <div key={index} className="preview-item">
                    <img src={`${process.env.REACT_APP_API_URL}/${image}`} alt={`Activity ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {formData?.id ? 'Update Activity' : 'Add Activity'}
            </button>
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeatherActivityForm; 