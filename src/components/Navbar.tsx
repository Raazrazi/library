import { useState, useEffect } from 'react';
import { Search, User, BookOpen } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-content">
        <div className="logo-container">
          <img src="/assets/logo_libon_m.png" alt="LibOn-M Logo" className="logo-img" />
          <span className="logo-text text-gradient">LibOn-M</span>
        </div>
        
        <div className="nav-links">
          <a href="#discover" className="active">Discover</a>
          <a href="#genres">Genres</a>
          <a href="#authors">Authors</a>
        </div>

        <div className="nav-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search books..." />
          </div>
          <button className="icon-btn">
            <BookOpen size={20} />
          </button>
          <button className="icon-btn">
            <User size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
