import React, { useState } from 'react';
import './styles/WeatherForms.css';

const TouristFeatureForm = ({ formData, onSubmit, onCancel }) => {
  const [formState, setFormState] = useState(formData || {
    feature_type: '',
    title: '',
    description: '',
    detailed_description: '',
    feature_images: [],
    best_time: '',
    recommendations: '',
    things_to_carry: '',
    entry_fee: '',
    timings: '',
    location_details: '',
    how_to_reach: '',
    nearby_attractions: ''
  });

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
      const response = await fetch('http://localhost:5000/api/weather/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      setFormState(prev => ({
        ...prev,
        feature_images: [...prev.feature_images, ...data.imagePaths]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="weather-form-overlay">
      <div className="weather-form-container">
        <h2>Add Tourist Feature</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="feature_type">Feature Type</label>
            <select
              id="feature_type"
              name="feature_type"
              value={formState.feature_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Natural">Natural</option>
              <option value="Historical">Historical</option>
              <option value="Cultural">Cultural</option>
              <option value="Adventure">Adventure</option>
              <option value="Religious">Religious</option>
              <option value="Entertainment">Entertainment</option>
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
              placeholder="Enter feature title"
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
              placeholder="Brief description of the feature"
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
              placeholder="Detailed description of the feature"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="feature_images">Feature Images</label>
            <input
              type="file"
              id="feature_images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <div className="image-preview">
              {formState.feature_images.map((image, index) => (
                <div key={index} className="preview-item">
                  <img src={`http://localhost:5000/${image}`} alt={`Feature ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="best_time">Best Time to Visit</label>
            <input
              type="text"
              id="best_time"
              name="best_time"
              value={formState.best_time}
              onChange={handleChange}
              placeholder="e.g., Morning, Evening, Specific months"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="recommendations">Recommendations</label>
            <textarea
              id="recommendations"
              name="recommendations"
              value={formState.recommendations}
              onChange={handleChange}
              placeholder="Recommendations for visitors"
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="entry_fee">Entry Fee</label>
              <input
                type="text"
                id="entry_fee"
                name="entry_fee"
                value={formState.entry_fee}
                onChange={handleChange}
                placeholder="e.g., ₹100, Free"
              />
            </div>

            <div className="form-group">
              <label htmlFor="timings">Timings</label>
              <input
                type="text"
                id="timings"
                name="timings"
                value={formState.timings}
                onChange={handleChange}
                placeholder="e.g., 9:00 AM - 5:00 PM"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location_details">Location Details</label>
            <textarea
              id="location_details"
              name="location_details"
              value={formState.location_details}
              onChange={handleChange}
              placeholder="Detailed location information"
            />
          </div>

          <div className="form-group">
            <label htmlFor="how_to_reach">How to Reach</label>
            <textarea
              id="how_to_reach"
              name="how_to_reach"
              value={formState.how_to_reach}
              onChange={handleChange}
              placeholder="Transportation and directions"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nearby_attractions">Nearby Attractions</label>
            <textarea
              id="nearby_attractions"
              name="nearby_attractions"
              value={formState.nearby_attractions}
              onChange={handleChange}
              placeholder="Other attractions in the vicinity"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TouristFeatureForm; 