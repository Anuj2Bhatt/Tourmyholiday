import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './CultureDetail.css';

const CultureDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [culture, setCulture] = useState(null);
  const [relatedCultures, setRelatedCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCultureDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get culture by slug (for state cultures)
        try {
          const response = await axios.get(`http://localhost:5000/api/cultures/slug/${slug}`);
          if (response.data) {
            setCulture(response.data);
            // Fetch related cultures from the same subdistrict
            const relatedResponse = await axios.get(`http://localhost:5000/api/cultures/subdistrict/${response.data.subdistrict_id}`);
            // Filter out current culture and get up to 4 related cultures
            const related = relatedResponse.data
              .filter(c => c.slug !== slug)
              .slice(0, 4);
            setRelatedCultures(related);
            return;
          }
        } catch (error) {
          
        }

        // If not found in state cultures, try territory cultures
        try {
          const subdistrictResponse = await axios.get(`http://localhost:5000/api/territory-subdistricts/slug/${slug}`);
          if (subdistrictResponse.data) {
            const subdistrictId = subdistrictResponse.data.id;
            const territoryResponse = await axios.get(`http://localhost:5000/api/cultures/territory-subdistrict/${subdistrictId}`);
            const culture = territoryResponse.data.find(c => c.slug === slug);
            if (culture) {
              setCulture(culture);
              // Fetch related territory cultures
              const related = territoryResponse.data
                .filter(c => c.slug !== slug)
                .slice(0, 4);
              setRelatedCultures(related);
              return;
            }
          }
        } catch (error) {
          
        }

        setError('Culture not found');
      } catch (err) {
        
        setError(err.response?.data?.message || 'Error loading culture details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCultureDetail();
    }
  }, [slug]);

  const formatImageUrl = (path) => {
    if (!path) return '/placeholder-image.jpg';
    // If it's a full URL, return as is
    if (path.startsWith('http')) return path;
    // If it's a relative path, prepend the backend URL
    return `http://localhost:5000/uploads/${path}`;
  };

  if (loading) {
    return (
      <div className="culture-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading culture details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="culture-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  if (!culture) {
    return (
      <div className="culture-detail-not-found">
        <h2>Culture Not Found</h2>
        <p>The requested culture information could not be found.</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="culture-detail-container">
      <div className="culture-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{culture.title}</h1>
      </div>

      <div className="culture-detail-content">
        <div className="culture-detail-main">
          <div className="culture-detail-featured-image">
            {culture.featured_image ? (
              <img
                src={formatImageUrl(culture.featured_image)}
                alt={culture.title}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
          </div>

          <div className="culture-detail-info">
            <div className="culture-detail-description">
              <h2>About</h2>
              <div dangerouslySetInnerHTML={{ __html: culture.description }} />
            </div>

            {culture.image_paths && culture.image_paths.length > 0 && (
              <div className="culture-detail-gallery">
                <h2>Gallery</h2>
                <div className="gallery-grid">
                  {culture.image_paths.map((imagePath, index) => (
                    <div key={index} className="gallery-item">
                      <img
                        src={formatImageUrl(imagePath)}
                        alt={`${culture.title} - Image ${index + 1}`}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="culture-detail-sidebar">
          <div className="related-cultures">
            <h3>More Cultures to Explore</h3>
            {relatedCultures.length > 0 ? (
              <div className="related-cultures-grid">
                {relatedCultures.map((relatedCulture) => (
                  <Link 
                    to={`/culture/${relatedCulture.slug}`} 
                    key={relatedCulture.id} 
                    className="related-culture-card"
                  >
                    <div className="related-culture-image">
                      <img
                        src={formatImageUrl(relatedCulture.featured_image)}
                        alt={relatedCulture.title}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    <h4>{relatedCulture.title}</h4>
                  </Link>
                ))}
              </div>
            ) : (
              <p>No related cultures found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CultureDetail; 