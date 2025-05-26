import React, { useState, useEffect, useRef } from 'react';
import './StoryViewer.css';

const StoryViewer = ({ story, onClose }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [direction, setDirection] = useState('next');
  const timerRef = useRef(null);
  const pageDuration = 8000; // 8 seconds per page

  // Handle story progression
  useEffect(() => {
    if (isPaused) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Reset progress
    setProgress(0);

    // Create progress timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / pageDuration) * 100;
      
      if (newProgress >= 100) {
        // Go to next page or close if on last page
        if (currentPageIndex < story.pages.length - 1) {
          setDirection('next');
          setCurrentPageIndex(prevIndex => prevIndex + 1);
        } else {
          onClose();
        }
      } else {
        setProgress(newProgress);
      }
    }, 100);

    // Cleanup timer on unmount or when page changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentPageIndex, isPaused, onClose, story.pages.length]);

  const handleNext = () => {
    if (currentPageIndex < story.pages.length - 1) {
      setDirection('next');
      setCurrentPageIndex(prevIndex => prevIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setDirection('prev');
      setCurrentPageIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      setShowLikeAnimation(true);
      setTimeout(() => {
        setShowLikeAnimation(false);
      }, 1500);
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    // In a real app, this would send the comment to a backend
    alert(`Comment submitted: ${comment}`);
    setComment('');
  };

  const currentPage = story.pages[currentPageIndex];

  return (
    <div 
      className="story-viewer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button className="close-btn" onClick={onClose}>×</button>
      <button className="cut-btn" onClick={onClose}>Exit Story</button>
      
      <div className="progress-container">
        {story.pages.map((_, index) => (
          <div 
            key={index} 
            className={`progress-bar ${index === currentPageIndex ? 'active' : index < currentPageIndex ? 'completed' : ''}`}
          >
            <div 
              className="progress-fill" 
              style={{ width: index === currentPageIndex ? `${progress}%` : index < currentPageIndex ? '100%' : '0%' }}
            ></div>
          </div>
        ))}
      </div>
      
      <div className={`story-content ${direction === 'next' ? 'slide-left' : 'slide-right'}`}>
        <div className="story-image">
          <img src={currentPage.image} alt={currentPage.title} />
        </div>
        
        <div className="story-text">
          <h2 className="story-title animate-text">{currentPage.title}</h2>
          <p className="story-description animate-text">{currentPage.description}</p>
        </div>
      </div>
      
      <div className="navigation-controls">
        <button 
          className="nav-btn prev-btn" 
          onClick={handlePrev}
          disabled={currentPageIndex === 0}
        >
          &#10094;
        </button>
        <button 
          className="nav-btn next-btn" 
          onClick={handleNext}
        >
          &#10095;
        </button>
      </div>

      <div className="story-interactions">
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <input 
            type="text" 
            placeholder="Add a comment..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button 
            className={`like-btn ${liked ? 'liked' : ''}`} 
            type="button"
            onClick={handleLike}
          >
            {liked ? '❤️' : '🤍'}
          </button>
          <button type="submit" disabled={!comment.trim()}>Send</button>
        </form>
      </div>

      {showLikeAnimation && (
        <div className="like-animation">
          ❤️
        </div>
      )}
    </div>
  );
};

export default StoryViewer; 