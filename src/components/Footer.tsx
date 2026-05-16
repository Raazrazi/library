import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer glass">
      <div className="container footer-content">
        <div className="footer-brand">
          <img src="/assets/logo_libon_m.png" alt="LibOn-M Logo" className="footer-logo" />
          <p>Your gateway to endless worlds and unforgettable stories.</p>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h4>Explore</h4>
            <a href="#">Top Books</a>
            <a href="#">New Releases</a>
            <a href="#">Genres</a>
          </div>
          <div className="link-group">
            <h4>About</h4>
            <a href="#">Our Story</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 LibOn-M. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
