import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherForms.css';

const WeatherAlertForm = ({ formData, onSubmit, onCancel }) => {
  const [formState, setFormState] = useState({
    type: '',
    severity: 'low',
    title: '',
    description: '',
    detailed_description: '',
    start_date: '',
    end_date: '',
    affected_areas: '',
    safety_instructions: '',
    emergency_contacts: '',
    alert_images: []
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
        alert_images: [...prev.alert_images, ...response.data.imagePaths]
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
        <h2>{formData?.id ? 'Edit Weather Alert' : 'Add Weather Alert'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Alert Type</label>
            <select
              id="type"
              name="type"
              value={formState.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="storm">Storm</option>
              <option value="flood">Flood</option>
              <option value="heatwave">Heatwave</option>
              <option value="coldwave">Coldwave</option>
              <option value="rain">Heavy Rain</option>
              <option value="snow">Snow</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity</label>
            <select
              id="severity"
              name="severity"
              value={formState.severity}
              onChange={handleChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="extreme">Extreme</option>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Start Date</label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={formState.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={formState.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="affected_areas">Affected Areas</label>
            <textarea
              id="affected_areas"
              name="affected_areas"
              value={formState.affected_areas}
              onChange={handleChange}
              placeholder="Enter affected areas, separated by commas"
            />
          </div>

          <div className="form-group">
            <label htmlFor="safety_instructions">Safety Instructions</label>
            <textarea
              id="safety_instructions"
              name="safety_instructions"
              value={formState.safety_instructions}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="emergency_contacts">Emergency Contacts</label>
            <textarea
              id="emergency_contacts"
              name="emergency_contacts"
              value={formState.emergency_contacts}
              onChange={handleChange}
              placeholder="Enter emergency contact numbers, separated by commas"
            />
          </div>

          <div className="form-group">
            <label htmlFor="alert_images">Alert Images</label>
            <input
              type="file"
              id="alert_images"
              name="alert_images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
            />
            {formState.alert_images.length > 0 && (
              <div className="image-preview">
                {formState.alert_images.map((image, index) => (
                  <div key={index} className="preview-item">
                    <img src={`${process.env.REACT_APP_API_URL}/${image}`} alt={`Alert ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {formData?.id ? 'Update Alert' : 'Add Alert'}
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

export default WeatherAlertForm; 