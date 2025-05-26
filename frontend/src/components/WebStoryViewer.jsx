import React, { useState, useEffect, useCallback } from 'react';
import './WebStoryViewer.css';

const WebStoryViewer = ({ story, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [likes, setLikes] = useState({}); // {imageIndex: true}
  const [showCommentPrompt, setShowCommentPrompt] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shareMsg, setShareMsg] = useState('');

  const nextSlide = useCallback(() => {
    if (story?.images && currentSlide < story.images.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentSlide, story, onClose]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    if (!isPaused && story?.images) {
      const timer = setTimeout(nextSlide, 7000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, isPaused, nextSlide, story]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'Escape') onClose();
  }, [nextSlide, prevSlide, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!story || !story.images || story.images.length === 0) {
    return null;
  }

  // Like handler
  const handleLike = () => {
    setLikes(likes => ({ ...likes, [currentSlide]: !likes[currentSlide] }));
  };

  // Comment handler
  const handleComment = () => {
    setShowCommentPrompt(true);
  };
  const handleCommentSubmit = () => {
    setShowCommentPrompt(false);
    setCommentText('');
    // You can add backend logic here
    alert('Comment submitted!');
  };

  // Share handler
  const handleShare = () => {
    const url = window.location.origin + '/web-story/' + (story.slug || story.id);
    navigator.clipboard.writeText(url);
    setShareMsg('Link copied!');
    setTimeout(() => setShareMsg(''), 1500);
  };

  return (
    <div className="web-story-viewer">
      <div className="story-content">
        <div className="story-slide"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="story-progress">
            {story.images.map((_, index) => (
              <div
                key={index}
                className={`progress-bar ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'completed' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          {/* Image and description overlay */}
          <div className="story-image-wrap">
            <img
              src={story.images[currentSlide].image_url}
              alt={story.images[currentSlide].alt_text || 'Story image'}
            />
            <div className="story-text-overlay">
              <h3>{story.images[currentSlide].description}</h3>
            </div>
          </div>
          {/* Like, Comment, Share Controls */}
          <div className="story-controls-row">
            <button className={`like-btn${likes[currentSlide] ? ' liked' : ''}`} onClick={handleLike}>
              {likes[currentSlide] ? '❤️' : '🤍'} Like
            </button>
            <button className="comment-btn" onClick={handleComment}>💬 Comment</button>
            <button className="share-btn" onClick={handleShare}>🔗 Share</button>
            {shareMsg && <span className="share-msg">{shareMsg}</span>}
          </div>
          {/* Comment Prompt */}
          {showCommentPrompt && (
            <div className="comment-prompt-modal">
              <div className="comment-prompt-content">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write your comment..."
                  rows={3}
                />
                <div className="comment-prompt-actions">
                  <button onClick={handleCommentSubmit} disabled={!commentText.trim()}>Submit</button>
                  <button onClick={() => setShowCommentPrompt(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="nav-button prev" onClick={prevSlide} disabled={currentSlide === 0}>
          ←
        </button>
        <button className="nav-button next" onClick={nextSlide}>
          →
        </button>
      </div>
      <div className="story-controls">
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default WebStoryViewer; 