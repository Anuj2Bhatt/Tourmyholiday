import React, { useEffect, useState, useRef, useCallback } from 'react';
import TeamCard from '../components/TeamCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import "./OurTeam.css";

const OurTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/team')
      .then(res => res.json())
      .then(data => setTeamMembers(data))
      .catch(() => setTeamMembers([]));
  }, []);

  const cardsPerView = 4;
  const cardWidth = 280; // Width of each card
  const cardGap = 24; // Gap between cards
  const totalCards = teamMembers.length;

  const scrollToIndex = useCallback((index) => {
    if (sliderRef.current) {
      const offset = index * (cardWidth + cardGap);
      sliderRef.current.style.transform = `translateX(-${offset}px)`;
      setCurrentIndex(index);
    }
  }, [cardWidth, cardGap]);

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }

    autoScrollRef.current = setInterval(() => {
      if (!isHovered) {
        const nextIndex = (currentIndex + 1) % (totalCards - cardsPerView + 1);
        scrollToIndex(nextIndex);
      }
    }, 5000);
  }, [currentIndex, isHovered, totalCards, cardsPerView, scrollToIndex]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [startAutoScroll]);

  const handlePrev = useCallback(() => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  }, [currentIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    const newIndex = Math.min(totalCards - cardsPerView, currentIndex + 1);
    scrollToIndex(newIndex);
  }, [currentIndex, totalCards, cardsPerView, scrollToIndex]);

  return (
    <div className="our-team-section">
      <h2>Meet Our Team</h2>
      <div className="our-team-container">
        <div 
          className="team-cards-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="team-cards-row"
            ref={sliderRef}
            style={{ width: `${totalCards * (cardWidth + cardGap)}px` }}
          >
            {teamMembers.map(member => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
          <div className="slider-controls">
            <button 
              className="slider-arrow prev"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <FaChevronLeft />
            </button>
            <button 
              className="slider-arrow next"
              onClick={handleNext}
              disabled={currentIndex >= totalCards - cardsPerView}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurTeam;