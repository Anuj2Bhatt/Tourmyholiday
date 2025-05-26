import React, { useState } from 'react';
import './TerritoryDistrictGallery.css';

const TerritoryDistrictGallery = ({ images, loading, error }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setSelectedImage(images[(currentIndex - 1 + images.length) % images.length]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setSelectedImage(images[(currentIndex + 1) % images.length]);
  };

  if (loading) {
    return (
      <div className="tdg-loading">
        <div className="loading-spinner"></div>
        <p>Loading gallery images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tdg-error">
        <p>Error loading gallery: {error}</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="tdg-empty">
        <p>No images available for this district.</p>
      </div>
    );
  }

  // Get main image and side images
  const mainImg = images[0];
  const sideImgs = images.slice(1, 5);
  const hasMore = images.length > 5;

  return (
    <>
      <div className="tdg-hero">
        <div className="tdg-main-img">
          {mainImg && (
            <img 
              src={mainImg.image_url.startsWith('http') ? 
                mainImg.image_url : 
                `http://localhost:5000/${mainImg.image_url}`}
              alt={mainImg.alt_text || mainImg.caption || 'District Image'} 
              onClick={() => handleImageClick(mainImg, 0)}
            />
          )}
        </div>
        <div className="tdg-side-grid">
          {sideImgs.map((img, idx) => (
            <div key={img.id} className="tdg-side-img">
              <img 
                src={img.image_url.startsWith('http') ? 
                  img.image_url : 
                  `http://localhost:5000/${img.image_url}`}
                alt={img.alt_text || img.caption || 'District Image'} 
                onClick={() => handleImageClick(img, idx + 1)}
              />
              {hasMore && idx === 3 && (
                <div className="tdg-see-all-overlay" onClick={() => handleImageClick(img, idx + 1)}>
                  <span>See all</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div className="tdg-modal-bg" onClick={handleCloseModal}>
          <div className="tdg-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="tdg-modal-close" onClick={handleCloseModal} title="Close">&times;</button>
            <button 
              className="tdg-modal-nav left" 
              onClick={handlePrevImage}
            >
              &#8592;
            </button>
            <div className="tdg-modal-img-wrap">
              <img 
                src={selectedImage.image_url.startsWith('http') ? 
                  selectedImage.image_url : 
                  `http://localhost:5000/${selectedImage.image_url}`}
                alt={selectedImage.alt_text || selectedImage.caption || 'District Image'} 
              />
              {selectedImage.caption && <div className="tdg-modal-caption">{selectedImage.caption}</div>}
              {selectedImage.alt_text && <div className="tdg-modal-alt">{selectedImage.alt_text}</div>}
            </div>
            <button 
              className="tdg-modal-nav right" 
              onClick={handleNextImage}
            >
              &#8594;
            </button>
            <div className="tdg-modal-count">{currentIndex + 1} / {images.length}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default TerritoryDistrictGallery; 