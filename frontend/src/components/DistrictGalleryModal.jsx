import React, { useEffect, useRef, useState } from 'react';
import './DistrictGalleryModal.css';

const DistrictGalleryModal = ({ images, open, onClose, initialIndex = 0 }) => {
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
    <div className="district-gallery-modal-bg" ref={modalRef}>
      <div className="district-gallery-modal-content">
        <button className="district-gallery-modal-close" onClick={onClose} title="Close">&times;</button>
        <button className="district-gallery-modal-nav left" onClick={() => setCurrent((c) => (c - 1 >= 0 ? c - 1 : images.length - 1))}>&#8592;</button>
        <div className="district-gallery-modal-img-wrap">
          <img src={img.image_url} alt={img.alt_text || img.caption || 'District Image'} />
          {img.caption && <div className="district-gallery-modal-caption">{img.caption}</div>}
          {img.alt_text && <div className="district-gallery-modal-alt">{img.alt_text}</div>}
        </div>
        <button className="district-gallery-modal-nav right" onClick={() => setCurrent((c) => (c + 1 < images.length ? c + 1 : 0))}>&#8594;</button>
        <div className="district-gallery-modal-count">{current + 1} / {images.length}</div>
      </div>
    </div>
  );
};

export default DistrictGalleryModal; 