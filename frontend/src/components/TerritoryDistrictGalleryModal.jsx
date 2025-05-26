import React, { useEffect, useRef, useState } from 'react';
import './TerritoryDistrictGallery.css';

const TerritoryDistrictGalleryModal = ({ images, open, onClose, initialIndex = 0 }) => {
  const [current, setCurrent] = useState(initialIndex);
  const modalRef = useRef();

  useEffect(() => {
    if (open) setCurrent(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1 < images.length ? c + 1 : 0));
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 >= 0 ? c - 1 : images.length - 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, images.length, onClose]);

  if (!open || !images.length) return null;

  const img = images[current];

  return (
    <div className="tdg-modal-bg" ref={modalRef}>
      <div className="tdg-modal-content">
        <button className="tdg-modal-close" onClick={onClose} title="Close">&times;</button>
        <button 
          className="tdg-modal-nav left" 
          onClick={() => setCurrent((c) => (c - 1 >= 0 ? c - 1 : images.length - 1))}
        >
          &#8592;
        </button>
        <div className="tdg-modal-img-wrap">
          <img 
            src={img.image_url.startsWith('http') ? 
              img.image_url : 
              `http://localhost:5000/${img.image_url.replace(/^\/+/, '')}`} 
            alt={img.alt_text || img.caption || 'District Image'} 
          />
          {img.caption && <div className="tdg-modal-caption">{img.caption}</div>}
          {img.alt_text && <div className="tdg-modal-alt">{img.alt_text}</div>}
        </div>
        <button 
          className="tdg-modal-nav right" 
          onClick={() => setCurrent((c) => (c + 1 < images.length ? c + 1 : 0))}
        >
          &#8594;
        </button>
        <div className="tdg-modal-count">{current + 1} / {images.length}</div>
      </div>
    </div>
  );
};

export default TerritoryDistrictGalleryModal; 