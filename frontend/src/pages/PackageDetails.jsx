import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [packageHotels, setPackageHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState(null);
  const [currentBlogPage, setCurrentBlogPage] = useState(0);
  // Add state for seasons and active season
  const seasons = ['Summer', 'Monsoon', 'Autumn', 'Winter', 'Spring']; // Using hardcoded seasons for now
  const [activeSeason, setActiveSeason] = useState(seasons[0]);
  // Add state for season images (placeholder structure)
  const [seasonImages, setSeasonImages] = useState({
    Summer: [], // Initialize as empty arrays, data will be fetched
    Monsoon: [],
    Autumn: [],
    Winter: [],
    Spring: [],
  });
  const [seasonImagesLoading, setSeasonImagesLoading] = useState(false);
  const [seasonImagesError, setSeasonImagesError] = useState(null);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/packages/packages/${slug}`);
        if (!response.ok) {
          throw new Error('Package not found');
        }
        const data = await response.json();
        
        // Fetch itinerary data from the new endpoint
        const itineraryResponse = await fetch(`http://localhost:5000/api/package-itinerary/${data.id}`);
        if (itineraryResponse.ok) {
          const itineraryDays = await itineraryResponse.json();
          // Transform the data to match the expected format
          data.itinerary = itineraryDays.map(day => ({
            dayNumber: day.day_number,
            title: day.title,
            description: day.description
          }));
        } else {
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

  // Add this useEffect to fetch hotels when the package loads
  useEffect(() => {
    const fetchPackageHotels = async () => {
      if (!pkg?.hotels) {
        return;
      }
      
      try {
        setHotelsLoading(true);
        setHotelsError(null);
        
        // Parse hotel IDs from the package's hotels field
        
        let hotelIds;
        try {
          // First parse the hotels data if it's a string
          const parsedHotels = typeof pkg.hotels === 'string' 
            ? JSON.parse(pkg.hotels) 
            : Array.isArray(pkg.hotels) 
              ? pkg.hotels 
              : [];
          
          // Extract just the IDs from the hotel objects
          hotelIds = parsedHotels.map(hotel => {
            if (typeof hotel === 'object' && hotel !== null) {
              return hotel.id;
            }
            return hotel; // If it's already an ID, return as is
          }).filter(id => id !== undefined && id !== null);
          
        } catch (parseError) {
          hotelIds = [];
        }
            
        if (!hotelIds.length) {
          setPackageHotels([]);
          return;
        }

        // Fetch hotel details for each ID
        const hotelPromises = hotelIds.map(id => {
          return axios.get(`http://localhost:5000/api/hotels/${id}`)
            .then(response => {
              return response.data;
            })
            .catch(error => {
              return null;
            });
        });

        const hotels = await Promise.all(hotelPromises);
        setPackageHotels(hotels.filter(hotel => hotel !== null));
      } catch (error) {
        setHotelsError('Failed to fetch hotel details');
      } finally {
        setHotelsLoading(false);
      }
    };

    fetchPackageHotels();
  }, [pkg]);

  // Add useEffect for fetching blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      if (!pkg?.id) return;
      
      try {
        setBlogsLoading(true);
        setBlogsError(null);
        const response = await fetch('http://localhost:5000/api/articles');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        // Filter blogs for this package
        const packageBlogs = data.filter(blog => blog.packages_id === pkg.id);
        setBlogs(packageBlogs);
      } catch (err) {
        setBlogsError(err.message);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, [pkg?.id]);

  // Add useEffect for fetching season images
  useEffect(() => {
    const fetchSeasonImages = async () => {
      if (!pkg?.id) return;
      
      try {
        setSeasonImagesLoading(true);
        setSeasonImagesError(null);
        // Fetch season images for the current package
        const response = await fetch(`http://localhost:5000/api/package-seasons/${pkg.id}/images`);
        if (!response.ok) throw new Error('Failed to fetch season images');
        const data = await response.json();

        // Group images by season
        const groupedImages = {};
        seasons.forEach(season => groupedImages[season] = []);
        
        if (Array.isArray(data)) {
          data.forEach(image => {
            if (groupedImages[image.season]) {
              groupedImages[image.season].push(image);
            }
          });
        }
        
        setSeasonImages(groupedImages);
      } catch (err) {
        setSeasonImagesError(err.message);
      } finally {
        setSeasonImagesLoading(false);
      }
    };

    fetchSeasonImages();
  }, [pkg?.id]); // Fetch season images when the package data is loaded

  // Handle image load success
  const handleImageLoad = (index) => {
    setLoadedImages(prev => [...prev, index]);
  };

  // Handle image load error
  const handleImageError = (index, img) => {  
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
      const response = await axios.post('http://localhost:5000/api/enquiry', {
        ...formData,
        packageName: pkg?.package_name || 'Tour Package'
      });

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

  // Replace the renderHotels function with this new version
  const renderHotels = () => {
    if (hotelsLoading) {
      return <div className={styles.loading}>Loading hotels...</div>;
    }

    if (hotelsError) {
      return <div className={styles.error}>{hotelsError}</div>;
    }

    if (!packageHotels.length) {
      return <p>Hotel details will be provided upon booking.</p>;
    }

    return (
      <div className={styles.hotelList}>
        {packageHotels.map((hotel) => {
          // Parse amenities if they're stored as a string
          const amenities = typeof hotel.amenities === 'string' 
            ? JSON.parse(hotel.amenities) 
            : Array.isArray(hotel.amenities) 
              ? hotel.amenities 
              : [];

          return (
            <Link 
              to={`/hotels/${hotel.slug}`} 
              key={hotel.id} 
              className={styles.hotelItem}
            >
              <div className={styles.hotelImage}>
                <img 
                  src={hotel.featured_image || '/images/hotel-placeholder.jpg'} 
                  alt={hotel.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/hotel-placeholder.jpg';
                  }}
                />
              </div>
              <div className={styles.hotelInfo}>
                {hotel.star_rating && (
                  <div className={styles.hotelStars}>
                    {'★'.repeat(Math.floor(hotel.star_rating))}
                    {'☆'.repeat(5 - Math.floor(hotel.star_rating))}
                  </div>
                )}
                {amenities.length > 0 && (
                  <div className={styles.hotelAmenities}>
                    {amenities.slice(0, 2).map((amenity, index) => (
                      <span key={index} className={styles.amenityTag}>
                        {amenity}
                      </span>
                    ))}
                    {amenities.length > 2 && (
                      <span className={styles.amenityTag}>
                        +{amenities.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  // Update the downloadItinerary function to directly download the PDF
  const downloadItinerary = () => {
    if (pkg?.itinerary_pdf) {
      // Create a temporary link element
      const link = document.createElement('a');
      // Ensure the URL is properly formatted with the base URL
      const pdfUrl = pkg.itinerary_pdf.startsWith('http')
        ? pkg.itinerary_pdf
        : `http://localhost:5000/uploads/${pkg.itinerary_pdf}`;
      link.href = pdfUrl;
      // Extract filename from URL or use package name
      const filename = pkg.itinerary_pdf.split('/').pop() || `${pkg.package_name}-itinerary.pdf`;
      link.download = filename;
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (pkg?.itinerary) {
      // If no PDF but itinerary data exists, create text file
      const itineraryText = pkg.itinerary.map(day => 
        `Day ${day.dayNumber}: ${day.title}\n${day.description}\n\n`
      ).join('');

      const blob = new Blob([itineraryText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pkg.package_name} - Itinerary.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      toast.error('No itinerary available to download');
    }
  };

  // Add blog navigation functions
  const nextBlogPage = () => {
    if ((currentBlogPage + 1) * 3 < blogs.length) {
      setCurrentBlogPage(prev => prev + 1);
    }
  };

  const prevBlogPage = () => {
    if (currentBlogPage > 0) {
      setCurrentBlogPage(prev => prev - 1);
    }
  };

  // Add getImageUrl function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-blog.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    try {
      const cleanPath = imagePath.replace(/\\/g, '/').trim();
      return cleanPath.startsWith('uploads/') 
        ? `http://localhost:5000/${cleanPath}`
        : `http://localhost:5000/uploads/${cleanPath}`;
    } catch (error) {
      return '/placeholder-blog.jpg';
    }
  };

  // Update the blog card image rendering in renderBlogs function
  const renderBlogs = () => {
    if (blogsLoading) return <div className={styles.loading}>Loading blogs...</div>;
    if (blogsError) return <div className={styles.error}>{blogsError}</div>;
    if (!blogs.length) return null;

    const startIdx = currentBlogPage * 3;
    const visibleBlogs = blogs.slice(startIdx, startIdx + 3);

    return (
      <div className={styles.blogsSection}>
        <h2 className={styles.blogsTitle}>Related Articles</h2>
        <div className={styles.blogsContainer}>
          {currentBlogPage > 0 && (
            <button 
              className={`${styles.blogNavBtn} ${styles.prevBtn}`}
              onClick={prevBlogPage}
              aria-label="Previous blogs"
            >
              ←
            </button>
          )}
          <div className={styles.blogsGrid}>
            {visibleBlogs.map(blog => (
              <div key={blog.id} className={styles.blogCard}>
                <div className={styles.blogImage}>
                  <img 
                    src={getImageUrl(blog.featured_image)} 
                    alt={blog.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-blog.jpg';
                    }}
                  />
                </div>
                <div className={styles.blogContent}>
                  <h3>{blog.title}</h3>
                  <p>{blog.description}</p>
                  <Link to={`/articles/${blog.slug}`} className={styles.readMoreBtn}>
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {(currentBlogPage + 1) * 3 < blogs.length && (
            <button 
              className={`${styles.blogNavBtn} ${styles.nextBtn}`}
              onClick={nextBlogPage}
              aria-label="Next blogs"
            >
              →
            </button>
          )}
        </div>
      </div>
    );
  };

  // Update renderSeasonPackages function to show fetched images
  const renderSeasonPackages = () => {
    if (seasonImagesLoading) return <div className={styles.loading}>Loading season images...</div>;
    if (seasonImagesError) return <div className={styles.error}>{seasonImagesError}</div>;

    const imagesForSeason = seasonImages[activeSeason] || [];

    if (!imagesForSeason.length) {
      return <p>No images available for {activeSeason} season yet.</p>;
    }

    return (
      <div className={styles.seasonImagesGrid}> {/* Use the existing style */}
        {imagesForSeason.map(image => (
          <div key={image.id} className={styles.seasonImageCard}> {/* Use the existing style */}
            <img
              // Use the getImageUrl function to handle both relative and absolute paths
              src={getImageUrl(image.image_path || '/placeholder-image.jpg')} 
              alt={image.alt_text || `${activeSeason} Season Image`}
              className={styles.seasonGridImage} // Use the existing style
              onError={(e) => { 
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg'; // Fallback placeholder
              }}
            />
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
        { /* Itinerary tab Section Below This there is Price Table */}
        <div className={styles.itinerarytab}>
        {/* Itinerary */}
          <div className={styles.itneraryTabsSection}>
        <div className={styles.itineraryBlock}>
          <h2 className={styles.itineraryTitle}>Tour Itinerary</h2>
          <div className={styles.itineraryContent}>
            {Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 ? (
              <>
                <div className="itinerary-section">
                  <div className="itinerary-content">
                    <div className="itinerary-days">
                      {pkg.itinerary.map((day, index) => (
                        <div key={index} className="itinerary-day">
                          <div 
                            className="itinerary-day-header"
                            onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', padding: '.7vw' }}
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
                                  lineHeight: '1.6',
                                  backgroundColor: 'rgb(219, 228, 238)'
                            }}
                          >
                            {day.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  className={styles.itineraryActionBtn}
                  onClick={downloadItinerary}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 0',
                    width: '100%',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="fas fa-download"></i>
                  {pkg.itinerary_pdf ? 'Download PDF Itinerary' : 'Download Itinerary'}
                </button>
              </>
            ) : (
              <p className="no-itinerary">No itinerary available for this package.</p>
            )}
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
                  <div style={{ textAlign: 'left' }}>{renderList(pkg.inclusion)}</div>
            )}
            {activeTab === 'Exclusion' && (
                  <div style={{ textAlign: 'left' }}>{renderList(pkg.exclusion)}</div>
            )}
            {activeTab === 'Hotels' && (
                  <div style={{ textAlign: 'left' }}>
                <h3>Accommodation Details</h3>
                {renderHotels()}
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
                  <div style={{ textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: (pkg.faq || '').replace(/\n/g, '<br />') }} />
            )}
            {activeTab === 'Note' && (
                  <div style={{ textAlign: 'left' }}>
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
          </div>
          {/* Costing Section */}
          <div className={styles.costingSection}>
            <h2 className={styles.costingTitle}>Costing</h2>
            <table className={styles.costingTable}>
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {pkg.quad_price > 0 && (
                  <tr>
                    <td>Quad Sharing</td>
                    <td>₹{pkg.quad_price}</td>
                  </tr>
                )}
                {pkg.triple_price > 0 && (
                  <tr>
                    <td>Triple Sharing</td>
                    <td>₹{pkg.triple_price}</td>
                  </tr>
                )}
                {pkg.double_price > 0 && (
                  <tr>
                    <td>Double Sharing</td>
                    <td>₹{pkg.double_price}</td>
                  </tr>
                )}
              </tbody>
            </table>
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
                  style={{ marginLeft: '12px' }}>
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

      {/* Add blogs section after costing section */}
      {renderBlogs()}

      {/* Add Seasons Section */}
      <section className={styles.seasonsSection}> {/* Define this style in CSS */}
        <h2 className={styles.seasonsTitle}>Season of {pkg.package_name}</h2> {/* Define this style in CSS */}
        <div className={styles.seasonTabs}> {/* Define this style in CSS */}
          {seasons.map(season => (
            <button
              key={season}
              className={activeSeason === season ? styles.activeSeasonTab : styles.seasonTabButton} // Define these styles in CSS
              onClick={() => setActiveSeason(season)}
            >
              {season}
            </button>
          ))}
        </div>
        <div className={styles.seasonContent}> {/* Define this style in CSS */}
          {renderSeasonPackages()}
        </div>
      </section>

      {/* Hotel Details Modal */}
      {
        showHotelModal && selectedHotel && (
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
        )
      }
    </div >
  );
};

export default PackageDetails; 