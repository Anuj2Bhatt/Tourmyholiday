import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './TerritoryHistoryDetail.module.css';

const TerritoryHistoryDetail = () => {
  const { slug, historySlug } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [territoryData, setTerritoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch territory data first
        const territoryResponse = await axios.get(`http://localhost:5000/api/territories/slug/${slug}`);
        if (!territoryResponse.data.success) {
          throw new Error('Failed to fetch territory data');
        }
        setTerritoryData(territoryResponse.data.data);

        // Fetch history data
        const historyResponse = await axios.get(`http://localhost:5000/api/territory-history/${historySlug}`);
        if (!historyResponse.data.success) {
          throw new Error('Failed to fetch history data');
        }
        setHistoryData(historyResponse.data.data);

      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, historySlug]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className={styles.historyDetailPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading history content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.historyDetailPage}>
        <div className={styles.errorContainer}>
          <h2>Error Loading Content</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            ← Back to Previous Page
          </button>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className={styles.historyDetailPage}>
        <div className={styles.notFoundContainer}>
          <h2>Content Not Found</h2>
          <p>The requested history content could not be found.</p>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            ← Back to Previous Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.historyDetailPage}>
      <div className={styles.historyDetailContainer}>
        {/* Left Section - Main Content */}
        <section className={styles.historyContentSection}>
          <div className={styles.historyContentWrapper}>
            {historyData.image && (
              <div className={styles.historyFeaturedImage}>
                <img 
                  src={historyData.image.startsWith('http') ? historyData.image : `http://localhost:5000${historyData.image}`}
                  alt={historyData.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                  }}
                />
              </div>
            )}
            <h1 className={styles.historyTitle}>{historyData.title}</h1>
            <div className={styles.historyMeta}>
              <span className={styles.historyDate}>
                {new Date(historyData.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className={styles.historyContent}>
              {historyData.content}
            </div>
          </div>
        </section>

        {/* Right Section - Navigation and Tools */}
        <aside className={styles.historySidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.sidebarSection}>
              <Link to={`/territories/${slug}`} className={styles.backToTerritory}>
                ← Back to {territoryData?.title || 'Territory'} Page
              </Link>
            </div>

            <div className={styles.sidebarSection}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Search in content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                  Search
                </button>
              </form>
            </div>

            <div className={styles.sidebarSection}>
              <h3>Quick Links</h3>
              <ul className={styles.quickLinks}>
                <li>
                  <Link to={`/territories/${slug}/places`}>
                    Places to Visit
                  </Link>
                </li>
                <li>
                  <Link to={`/territories/${slug}/hotels`}>
                    Hotels
                  </Link>
                </li>
                <li>
                  <Link to={`/territories/${slug}/packages`}>
                    Travel Packages
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TerritoryHistoryDetail; 