import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherForms.css';

const WeatherStatsForm = ({ formData, onSubmit, onCancel }) => {
  const [formState, setFormState] = useState({
    month: '',
    avg_temperature: '',
    max_temperature: '',
    min_temperature: '',
    rainfall: '',
    humidity: '',
    wind_speed: '',
    wind_direction: '',
    description: '',
    weather_charts: []
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
        weather_charts: [...prev.weather_charts, ...response.data.imagePaths]
      }));
    } catch (error) {
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="weather-form-overlay">
      <div className="weather-form-container">
        <h2>{formData?.id ? 'Edit Weather Statistics' : 'Add Weather Statistics'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="month">Month</label>
            <select
              id="month"
              name="month"
              value={formState.month}
              onChange={handleChange}
              required
            >
              <option value="">Select Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="avg_temperature">Average Temperature (°C)</label>
              <input
                type="number"
                id="avg_temperature"
                name="avg_temperature"
                value={formState.avg_temperature}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="max_temperature">Maximum Temperature (°C)</label>
              <input
                type="number"
                id="max_temperature"
                name="max_temperature"
                value={formState.max_temperature}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="min_temperature">Minimum Temperature (°C)</label>
              <input
                type="number"
                id="min_temperature"
                name="min_temperature"
                value={formState.min_temperature}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rainfall">Rainfall (mm)</label>
              <input
                type="number"
                id="rainfall"
                name="rainfall"
                value={formState.rainfall}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="humidity">Humidity (%)</label>
              <input
                type="number"
                id="humidity"
                name="humidity"
                value={formState.humidity}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="wind_speed">Wind Speed (m/s)</label>
              <input
                type="number"
                id="wind_speed"
                name="wind_speed"
                value={formState.wind_speed}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="wind_direction">Wind Direction</label>
              <select
                id="wind_direction"
                name="wind_direction"
                value={formState.wind_direction}
                onChange={handleChange}
                required
              >
                <option value="">Select Direction</option>
                <option value="N">North</option>
                <option value="NE">Northeast</option>
                <option value="E">East</option>
                <option value="SE">Southeast</option>
                <option value="S">South</option>
                <option value="SW">Southwest</option>
                <option value="W">West</option>
                <option value="NW">Northwest</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weather_charts">Weather Charts</label>
            <input
              type="file"
              id="weather_charts"
              name="weather_charts"
              onChange={handleImageChange}
              multiple
              accept="image/*"
            />
            {formState.weather_charts.length > 0 && (
              <div className="image-preview">
                {formState.weather_charts.map((image, index) => (
                  <div key={index} className="preview-item">
                    <img src={`${process.env.REACT_APP_API_URL}/${image}`} alt={`Chart ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {formData?.id ? 'Update Statistics' : 'Add Statistics'}
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

export default WeatherStatsForm; 