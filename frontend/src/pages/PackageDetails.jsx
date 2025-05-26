import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './PackageDetails.module.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const PackageDetails = () => {
  const { slug } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [showAllImages, setShowAllImages] = useState(false);
  const [activeTab, setActiveTab] = useState('Inclusion');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: '',
    persons: '',
    packageType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/packages/packages/${slug}`);
        if (!response.ok) {
          throw new Error('Package not found');
        }
        const data = await response.json();
        
        // Parse itinerary if it's a string
        if (data.itinerary && typeof data.itinerary === 'string') {
          try {
            data.itinerary = JSON.parse(data.itinerary);
          } catch (e) {
            console.error('Error parsing itinerary:', e);
            data.itinerary = [];
          }
        } else if (!data.itinerary) {
          data.itinerary = [];
        }

        setPkg(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [slug]);

  // Handle image load success
  const handleImageLoad = (index) => {
    setLoadedImages(prev => [...prev, index]);
  };

  // Handle image load error
  const handleImageError = (index, img) => {
    console.error(`Error loading image ${index}:`, img);
    setLoadedImages(prev => [...prev, index]); // Still mark as loaded to show placeholder
  };

  // Helper to render string or HTML as a list
  const renderList = (content) => {
    if (!content) return null;
    // If content is already HTML with <ul> or <ol>, render as is
    if (/<ul|<ol|<li/i.test(content)) {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    // Otherwise, split by line breaks or commas and render as list
    const items = content.split(/\n|<br\s*\/?>|,/).map(i => i.trim()).filter(Boolean);
    return (
      <ul style={{ paddingLeft: 20, margin: 0 }}>
        {items.map((item, idx) => <li key={idx}>{item}</li>)}
      </ul>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Sending enquiry with data:', formData);
      const response = await axios.post('http://localhost:5000/api/enquiry', {
        ...formData,
        packageName: pkg?.package_name || 'Tour Package'
      });

      console.log('Response from server:', response.data);

      if (response.data.success) {
        toast.success('Enquiry sent successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          message: '',
          persons: '',
          packageType: ''
        });
      }
    } catch (error) {
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to parse hotel data from HTML string
  const parseHotels = (hotelsHtml) => {
    if (!hotelsHtml) return [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = hotelsHtml;
    const hotelElements = tempDiv.querySelectorAll('li, p');
    return Array.from(hotelElements).map(element => {
      const text = element.textContent.trim();
      if (!text) return null;
      
      // Extract hotel name and details
      const nameMatch = text.match(/^(.*?)(?:\s*[-–]\s*|\s*$)/);
      const name = nameMatch ? nameMatch[1].trim() : text;
      
      // Extract star rating if present
      const starMatch = text.match(/(\d+)\s*star/i);
      const stars = starMatch ? parseInt(starMatch[1]) : null;
      
      return {
        name,
        stars,
        fullText: text,
        image: null, // We'll add this later from your hotel images
        contact: null // We'll add this later from your hotel data
      };
    }).filter(Boolean);
  };

  // Function to render hotel list with links
  const renderHotels = (hotelsHtml) => {
    const hotels = parseHotels(hotelsHtml);
    return (
      <div className={styles.hotelList}>
        {hotels.map((hotel, index) => (
          <div key={index} className={styles.hotelItem}>
            <button 
              className={styles.hotelLink}
              onClick={() => {
                setSelectedHotel(hotel);
                setShowHotelModal(true);
              }}
            >
              <span className={styles.hotelName}>{hotel.name}</span>
              {hotel.stars && (
                <span className={styles.hotelStars}>
                  {'★'.repeat(hotel.stars)}
                  {'☆'.repeat(5 - hotel.stars)}
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading package...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pkg) return <div className="error">Package not found</div>;

  // Collect all images (featured + image1-5)
  const allImages = [
    { src: pkg.featured_image, type: 'featured' },
    { src: pkg.image1, type: 'image1' },
    { src: pkg.image2, type: 'image2' },
    { src: pkg.image3, type: 'image3' },
    { src: pkg.image4, type: 'image4' },
    { src: pkg.image5, type: 'image5' }
  ];

  // Filter out null/undefined images and log the results
  const images = allImages.filter(img => img.src);
  console.log('All available images:', allImages);
  console.log('Filtered images to display:', images);

  // Separate featured image and grid images
  const featuredImage = images[0];
  const gridImages = images.slice(1, 5); // Next 4 images for grid
  const remainingImages = images.slice(5); // For modal

  return (
    <div className={styles.container}>
      {/* Brick-by-brick Gallery Section */}
      <section className={styles.brickGallerySection}>
        <div className={styles.brickGalleryGrid}>
          {/* Left: Featured image */}
          {featuredImage && (
            <div className={styles.featuredImageWrapper}>
              <img
                src={featuredImage.src}
                alt={`Package ${featuredImage.type}`}
                className={styles.featuredImage}
                onLoad={() => handleImageLoad(0)}
                onError={e => {
                  handleImageError(0, featuredImage.src);
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              {!loadedImages.includes(0) && (
                <div className={styles.imagePlaceholder}>Loading...</div>
              )}
            </div>
          )}
          {/* Right: 2x2 grid images */}
          <div className={styles.rightGrid}>
            {gridImages.map((img, idx) => (
              <div key={idx} className={styles.gridImageWrapper}>
                <img
                  src={img.src}
                  alt={`Package ${img.type}`}
                  className={styles.gridImage}
                  onLoad={() => handleImageLoad(idx + 1)}
                  onError={e => {
                    handleImageError(idx + 1, img.src);
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                {/* Overlay 'See all' on the last grid image if there are more images */}
                {idx === gridImages.length - 1 && remainingImages.length > 0 && (
                  <button
                    className={styles.seeAllOverlay}
                    onClick={() => setShowAllImages(true)}
                  >
                    <span className={styles.seeAllIcon}>＋</span>
                    See all
                  </button>
                )}
                {!loadedImages.includes(idx + 1) && (
                  <div className={styles.imagePlaceholder}>Loading...</div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Modal for all images */}
        {showAllImages && (
          <div className={styles.imageModal}>
            <div className={styles.modalContent}>
              <button
                className={styles.closeModalBtn}
                onClick={() => setShowAllImages(false)}
              >
                ×
              </button>
              <div className={styles.modalImages}>
                {images.map((img, idx) => (
                  <div key={idx} className={styles.modalImageWrapper}>
                    <img
                      src={img.src}
                      alt={`Package ${img.type}`}
                      className={styles.modalImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className={styles.titleRow}>
        <h1 className={styles.title}>{pkg.package_name}</h1>
        <span className={styles.priceTag}>₹{pkg.price}</span>
        <span className={styles.daysTag}>{pkg.duration || '7 Days'}</span>
      </div>
      {/* Row: Itinerary | Tabs | Form */}
      <div className={styles.rowBelowTitle}>
        {/* Itinerary */}
        <div className={styles.itineraryBlock}>
          <h2 className={styles.itineraryTitle}>Tour Itinerary</h2>
          <div className={styles.itineraryContent}>
            {Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 ? (
              <div className="itinerary-section">
                <div className="itinerary-content">
                  <div className="itinerary-days">
                    {pkg.itinerary.map((day, index) => (
                      <div key={index} className="itinerary-day">
                        <div 
                          className="itinerary-day-header"
                          onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                          style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'}}
                        >
                          <span className="day-number">Day {day.dayNumber}</span>
                          <span className="day-title">{day.title}</span>
                          <span 
                            className="toggle-icon"
                            style={{
                              display: 'inline-block',
                              transition: 'transform 0.3s',
                              transform: expandedDay === index ? 'rotate(180deg)' : 'rotate(0deg)',
                              marginLeft: 'auto',
                              fontSize: '16px'
                            }}
                          >
                            ▼
                          </span>
                        </div>
                        <div 
                          className={`itinerary-day-description${expandedDay === index ? ' show' : ''}`}
                          style={{
                            maxHeight: expandedDay === index ? '500px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease',
                            padding: expandedDay === index ? '15px 20px' : '0 20px',
                            borderTop: expandedDay === index ? '1px solid #eee' : 'none',
                            color: '#666',
                            lineHeight: 1.6
                          }}
                        >
                          {day.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="no-itinerary">No itinerary available for this package.</p>
            )}
            <button className={styles.itineraryActionBtn}>Places to visit in Arunachal</button>
          </div>
        </div>
        {/* Tabs: Inclusion, Exclusion, Hotels, Flight, Train, FAQ, Note */}
        <div className={styles.centerContent}>
          <div className={styles.tabHeader}>
            {['Inclusion', 'Exclusion', 'Hotels', 'Flight', 'Train', 'FAQ', 'Note'].map(tab => (
              <button
                key={tab}
                className={activeTab === tab ? styles.activeTab : styles.tabBtn}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'Inclusion' && (
              <div style={{textAlign: 'left'}}>{renderList(pkg.inclusion)}</div>
            )}
            {activeTab === 'Exclusion' && (
              <div style={{textAlign: 'left'}}>{renderList(pkg.exclusion)}</div>
            )}
            {activeTab === 'Hotels' && (
              <div style={{textAlign: 'left'}}>
                <h3>Accommodation Details</h3>
                {pkg.hotels ? (
                  renderHotels(pkg.hotels)
                ) : (
                  <p>Hotel details will be provided upon booking.</p>
                )}
              </div>
            )}
            {activeTab === 'Flight' && (
              <div className={styles.horizontalScroll}>
                <h3>Flight Details</h3>
                {pkg.flight ? (
                  <div dangerouslySetInnerHTML={{ __html: pkg.flight }} />
                ) : (
                  <p>Flight details will be provided upon booking or are not available for this package.</p>
                )}
              </div>
            )}
            {activeTab === 'Train' && (
              <div className={styles.horizontalScroll}>
                <h3>Train Details</h3>
                {pkg.train ? (
                  <div dangerouslySetInnerHTML={{ __html: pkg.train }} />
                ) : (
                  <p>Train details will be provided upon booking or are not available for this package.</p>
                )}
              </div>
            )}
            {activeTab === 'FAQ' && (
              <div style={{textAlign: 'left'}} dangerouslySetInnerHTML={{ __html: (pkg.faq || '').replace(/\n/g, '<br />') }} />
            )}
            {activeTab === 'Note' && (
              <div style={{textAlign: 'left'}}>
                <div dangerouslySetInnerHTML={{ __html: (pkg.note || '').replace(/\n/g, '<br />') }} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <div className={styles.meta}>
                    <span className={styles.category}>{pkg.category}</span>
                    <span className={styles.location}>{pkg.location}</span>
                    <span className={styles.duration}>{pkg.duration}</span>
                  </div>
                </div>
                <div className={styles.description} dangerouslySetInnerHTML={{ __html: pkg.description }} />
              </div>
            )}
          </div>
        </div>
        {/* Enquiry Form */}
        <div className={styles.rightContent}>
          <div className={styles.enquiryFormWrapper}>
            <h2>Reach out to us</h2>
            <form className={styles.enquiryForm} onSubmit={handleSubmit}>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="*Name" 
                required 
              />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="*Email" 
                required 
              />
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="*Phone" 
                required 
              />
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required 
              />
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Message" 
                rows={3} 
              />
              <input 
                type="number" 
                name="persons"
                value={formData.persons}
                onChange={handleInputChange}
                min="1" 
                placeholder="Number of Persons" 
                className={styles.personInput} 
                required 
              />
              <select 
                name="packageType"
                value={formData.packageType}
                onChange={handleInputChange}
                className={styles.packageTypeSelect} 
                required
              >
                <option value="">Select Package Type</option>
                <option value="customized">Customized</option>
                <option value="pre-packaged">Pre-Packaged</option>
              </select>
              <div className={styles.queryActionsRow}>
                <a
                  href="https://wa.me/919990055699"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  WhatsApp
                </a>
                <a
                  href="tel:+919990055699"
                  className={styles.callBtn}
                  style={{marginLeft: '12px'}}>
                  Call Now
                </a>
              </div>
              <button 
                type="submit" 
                className={styles.enquiryBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Enquiry Now'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Hotel Details Modal */}
      {showHotelModal && selectedHotel && (
        <div className={styles.hotelModal}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeModalBtn}
              onClick={() => setShowHotelModal(false)}
            >
              ×
            </button>
            <div className={styles.hotelDetails}>
              <h2>{selectedHotel.name}</h2>
              {selectedHotel.stars && (
                <div className={styles.hotelStars}>
                  {'★'.repeat(selectedHotel.stars)}
                  {'☆'.repeat(5 - selectedHotel.stars)}
                </div>
              )}
              {selectedHotel.image && (
                <div className={styles.hotelImage}>
                  <img src={selectedHotel.image} alt={selectedHotel.name} />
                </div>
              )}
              <div className={styles.hotelInfo}>
                <p>{selectedHotel.fullText}</p>
                {selectedHotel.contact && (
                  <div className={styles.hotelContact}>
                    <h3>Contact Information</h3>
                    <p>{selectedHotel.contact}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetails; 