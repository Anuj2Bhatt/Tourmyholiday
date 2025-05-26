import React, { useRef } from 'react';
import './ServicesSection.css';

const ServicesSection = () => {
  const scrollContainerRef = useRef(null);

  const services = [
    {
      id: 1,
      title: 'Train Tickets',
      icon: '🚂',
      description: 'Book train tickets for your journey across India'
    },
    {
      id: 2,
      title: 'Flight Tickets',
      icon: '✈️',
      description: 'Find and book the best flight deals'
    },
    {
      id: 3,
      title: 'Customized Itineraries',
      icon: '📝',
      description: 'Get personalized travel plans'
    },
    {
      id: 4,
      title: 'Hotel Bookings',
      icon: '🏨',
      description: 'Book hotels at best prices'
    },
    {
      id: 5,
      title: 'Car Rentals',
      icon: '🚗',
      description: 'Rent cars for your travel needs'
    },
    {
      id: 6,
      title: 'Tour Guides',
      icon: '👨‍🏫',
      description: 'Find experienced local guides'
    },
    {
      id: 7,
      title: 'Travel Insurance',
      icon: '🛡️',
      description: 'Get travel insurance coverage'
    },
    {
      id: 8,
      title: 'Visa Assistance',
      icon: '📋',
      description: 'Get help with visa applications'
    },
    {
      id: 9,
      title: 'Bus Services',
      icon: '🚍',
      description: 'Get help with Bus Services'
    }
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="services-section">
      <h2>Travel Services</h2>
      <div className="services-container">
        <button className="scroll-button left" onClick={scrollLeft}>
          <span className="arrow">←</span>
        </button>
        <div className="services-scroll" ref={scrollContainerRef}>
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
        <button className="scroll-button right" onClick={scrollRight}>
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default ServicesSection; 