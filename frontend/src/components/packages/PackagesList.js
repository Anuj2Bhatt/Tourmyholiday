import React from 'react';
import { Link } from 'react-router-dom';
import './PackagesList.css';

const Packages = [
  {
    id: 1,
    title: 'Char Dham Yatra',
    image: '/images/gallery/Chardham-Yatra-by-Helicopter-1.webp',
    description: 'Visit the four sacred shrines of Uttarakhand',
    price: '₹25,000',
    duration: '10 Days',
    route: '/packages/chardham',
    category: 'Pilgrimage',
    features: ['Accommodation', 'Meals', 'Transport', 'Guide']
  },
  {
    id: 2,
    title: 'Panch Badri Tour',
    image: '/images/gallery/what-is-panch-badri-yatra.jpg',
    description: 'Explore the five sacred Badri temples',
    price: '₹18,000',
    duration: '7 Days',
    route: '/packages/panchbadri',
    category: 'Pilgrimage',
    features: ['Accommodation', 'Meals', 'Transport', 'Guide']
  },
  {
    id: 3,
    title: 'Kedarnath Trek',
    image: '/images/gallery/Kedarnath-Temple-min.jpg',
    description: 'Trek to the sacred Kedarnath temple',
    price: '₹15,000',
    duration: '5 Days',
    route: '/packages/kedarnath',
    category: 'Trek',
    features: ['Accommodation', 'Meals', 'Transport', 'Guide']
  },
  {
    id: 4,
    title: 'Valley of Flowers',
    image: '/images/gallery/xccxcxc.webp',
    description: 'Trek through the beautiful Valley of Flowers',
    price: '₹20,000',
    duration: '6 Days',
    route: '/packages/valley',
    category: 'Trek',
    features: ['Accommodation', 'Meals', 'Transport', 'Guide']
  },
  {
    id: 5,
    title: 'Rafting Adventure',
    image: '/images/gallery/rafting-in-uttarakhand-1.jpg',
    description: 'White water rafting in Rishikesh',
    price: '₹12,000',
    duration: '3 Days',
    route: '/packages/rafting',
    category: 'Adventure',
    features: ['Accommodation', 'Meals', 'Transport', 'Guide']
  },
  {
    id: 6,
    title: 'Snow Trekking',
    image: '/images/snow.jpg',
    description: 'Experience snow trekking in the Himalayas',
    price: '₹22,000',
    duration: '4 Days',
    route: '/packages/snow',
    category: 'Snow Trekking',
    features: ['Accommodation', 'Meals', 'Transport', 'Guide']
  }
];

const PackagesList = ({ stateName }) => {
  return (
    <section className="packages-section">
      <h2>Popular Tour Packages in {stateName}</h2>
      <div className="packages-grid">
        {Packages.map(pkg => (
          <div key={pkg.id} className="package-card">
            <div className="package-image">
              <img src={pkg.image} alt={pkg.title} />
              <div className="package-price-tag">
                <span>Starting from</span>
                <h4>{pkg.price}</h4>
              </div>
            </div>
            <div className="package-content">
              <h3>{pkg.title}</h3>
              <div className="package-meta">
                <span className="package-duration">
                  <i className="fas fa-clock"></i> {pkg.duration}
                </span>
                <span className="package-category">
                  <i className="fas fa-tag"></i> {pkg.category}
                </span>
              </div>
              <p className="package-description">{pkg.description}</p>
              <div className="package-features">
                {pkg.features.map((feature, index) => (
                  <span key={index}><i className="fas fa-check"></i> {feature}</span>
                ))}
              </div>
              <Link to={pkg.route} className="view-package-btn">
                View Package Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PackagesList; 