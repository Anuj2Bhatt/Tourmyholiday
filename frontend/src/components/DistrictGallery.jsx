import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DistrictGallery.css';
import DistrictGalleryModal from './DistrictGalleryModal';

const DistrictGallery = ({ districtId, slug }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        let id = districtId;
        if (!id && slug) {
          // Fetch district by slug to get id
          const res = await axios.get(`http://localhost:5000/api/districts/slug/${slug}`);
          id = res.data.id;
        }
        if (id) {
          const res = await axios.get(`http://localhost:5000/api/districts/${id}/images`);
          setImages(res.data);
        } else {
          setImages([]);
        }
      } catch (err) {
        setError('Failed to load images');
        setImages([]);
      }
      setLoading(false);
    };
    fetchImages();
  }, [districtId, slug]);

  if (loading) return <div className="district-gallery-loading">Loading gallery...</div>;
  if (error) return <div className="district-gallery-error">{error}</div>;
  if (!images.length) return <div className="district-gallery-empty">No images available.</div>;

  const mainImg = images[0];
  const sideImgs = images.slice(1, 5);
  const hasMore = images.length > 5;

  return (
    <>
      <div className="district-gallery-hero">
        <div className="district-gallery-main-img">
          {mainImg && (
            <img src={mainImg.image_url} alt={mainImg.alt_text || mainImg.caption || 'District Image'} />
          )}
        </div>
        <div className="district-gallery-side-grid">
          {sideImgs.map((img, idx) => (
            <div key={img.id} className="district-gallery-side-img">
              <img src={img.image_url} alt={img.alt_text || img.caption || 'District Image'} />
              {hasMore && idx === 3 && (
                <div className="district-gallery-see-all-overlay" onClick={() => setModalOpen(true)}>
                  <span>See all</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <DistrictGalleryModal
        images={images}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialIndex={4}
      />
    </>
  );
};

export default DistrictGallery; 