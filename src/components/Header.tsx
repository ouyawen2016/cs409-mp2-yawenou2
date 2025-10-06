import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <h1>Movie Explorer</h1>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">
            ListView
          </Link>
          <Link to="/gallery" className="nav-link">
            GalleryView
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
