import React from 'react';
import './Home.css';
import ServicesSection from './ServicesSection';
import UnionTeritory from './UnionTeritory';
import TeamCarousel from './OurTeam';

const Home = () => {
  return (
    <div className="home-container">
      <UnionTeritory />
      <ServicesSection />
      <TeamCarousel />
    </div>
  );
};

export default Home; 