import React, { useState, useEffect } from 'react';
import './StateImages.css';
import { API_BASE_URL } from '../config';

const StateImages = ({ stateId }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/states/images/${stateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await response.json();
        setImages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (stateId) {
      fetchImages();
    }
  }, [stateId]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  if (loading) return <div className="loading">Loading images...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (images.length === 0) return null; // Don't show anything if no images

  return (
    <div className="image-slider">
      <button className="slider-button prev" onClick={prevSlide}>&lt;</button>
      <div className="slider-container">
        <img 
          src={images[currentIndex].url} 
          alt={images[currentIndex].caption || 'State image'} 
          className="slider-image"
        />
        {images[currentIndex].caption && (
          <div className="image-caption">{images[currentIndex].caption}</div>
        )}
      </div>
      <button className="slider-button next" onClick={nextSlide}>&gt;</button>
      <div className="slider-dots">
        {images.map((_, index) => (
          <span 
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default StateImages; 