import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleArticlesClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      navigate('/articles');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="https://www.tourmyholiday.com/application/views/front/pdf/1729753122tourmyholiday-logo.png" alt="Tour My Holiday Logo" />
        </Link>
        
        {/* Hamburger Menu Button - Only visible on mobile */}
        <button 
          className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>

        {/* Navigation Menu */}
        <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li><Link to="/articles" onClick={() => { handleArticlesClick(); closeMenu(); }}>Articles</Link></li>
            <li><Link to="/packages" onClick={closeMenu}>Packages</Link></li>
            <li><Link to="/wildlife" onClick={closeMenu}>Wildlife</Link></li>
            <li><Link to="/tourism" onClick={closeMenu}>Tourism</Link></li>
            <li><Link to="/webstories" onClick={closeMenu}>Web Stories</Link></li>
            <li><Link to="/india-culture" onClick={closeMenu}>Culture</Link></li>
            <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;