import { ArrowRight, Sparkles } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <div className="badge glass">
            <Sparkles size={16} className="badge-icon" />
            <span>Library Inventory Manager</span>
          </div>
          <h1 className="hero-title">
            Manage Your <br/> <span className="text-gradient">Library Inventory</span>
          </h1>
          <p className="hero-subtitle">
            Keep track of physical books, register new arrivals, and manage student borrowing seamlessly with our stunning visual system.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>
              Manage Books <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary glass">
              View Reports
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-circle circle-1"></div>
          <div className="visual-circle circle-2"></div>
          <div className="glass hero-card">
             <img src="/assets/book_cover_scifi.png" alt="Featured Book" className="hero-featured-book" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
