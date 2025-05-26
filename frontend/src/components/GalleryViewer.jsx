import React, { useState, useEffect, useCallback } from 'react';
import './GalleryViewer.css';

const GalleryViewer = ({ images, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');

  // Memoize the navigation functions using useCallback
  const handleNext = useCallback(() => {
    if (isAnimating) return;
    
    setDirection('next');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setProgress(0);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, images.length]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    
    setDirection('prev');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setProgress(0);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, images.length]);

  // Auto-advance timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + (100 / 80); // 8 seconds total
        return newProgress >= 100 ? 0 : newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // When progress reaches 100%, go to next image
  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]); // Now properly include handleNext in the dependency array

  const currentImage = images[currentIndex];

  return (
    <div className="gallery-viewer-overlay">
      <div className="gallery-viewer">
        <button className="close-btn" onClick={onClose} aria-label="Close gallery">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        
        <div className="progress-container">
          {images.map((_, index) => (
            <div key={index} className="progress-item">
              <div 
                className={`progress-bar ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}
                style={{ width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' }}
              ></div>
            </div>
          ))}
        </div>
        
        <div className="gallery-content">
          <div className={`gallery-slide ${isAnimating ? `animate-${direction}` : ''}`}>
            <div className="gallery-image">
              <img src={currentImage.url} alt={currentImage.altText || currentImage.title} />
            </div>
            <div className="gallery-info">
              <h2 className="gallery-title">{currentImage.title}</h2>
              <p className="gallery-description">{currentImage.description}</p>
            </div>
          </div>
        </div>
        
        <div className="gallery-navigation">
          <button className="nav-btn prev-btn" onClick={handlePrev}>
            ←
          </button>
          <div className="gallery-indicator">
            {currentIndex + 1} / {images.length}
          </div>
          <button className="nav-btn next-btn" onClick={handleNext}>
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryViewer; 