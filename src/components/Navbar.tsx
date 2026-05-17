import { useState, useEffect } from 'react';
import { BookOpen, Clock, Menu, X } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  activeView: 'catalog' | 'history';
  onViewChange: (view: 'catalog' | 'history') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, onViewChange }) => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide navbar unless menu is open
          setVisible(false);
        } else {
          // Scrolling up - show navbar
          setVisible(true);
        }
      } else {
        // Near top - always show
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (view: 'catalog' | 'history') => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled glass' : ''} ${!visible && !isMenuOpen ? 'hidden' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="container nav-content">
        <div className="logo-container" onClick={() => handleNavClick('catalog')}>
          <img src="/assets/logo_libon_m.png" alt="LibOn-M Logo" className="logo-img" />
          <span className="logo-text text-gradient">LibOn-M</span>
        </div>
        
        {/* Hamburger Menu Toggle Button */}
        <button 
          type="button" 
          className="hamburger-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <button 
            type="button"
            onClick={() => handleNavClick('catalog')} 
            className={`nav-link-btn ${activeView === 'catalog' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            <span>Catalog Hub</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleNavClick('history')} 
            className={`nav-link-btn ${activeView === 'history' ? 'active' : ''}`}
          >
            <Clock size={16} />
            <span>Borrowing History</span>
          </button>
        </div>

        <div className="nav-actions">
          <span className="badge-school">School Library Mode</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
