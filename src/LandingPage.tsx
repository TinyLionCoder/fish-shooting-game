import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPageStyles.module.css'; // We'll create this CSS file next

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const startGame = () => {
    navigate('/game');
  };
  
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="header">
        <div className="logo">🐟 Fish Shooter</div>
        <nav>
          <ul className="nav-links">
            <li>Home</li>
            <li>About</li>
            <li>Leaderboard</li>
          </ul>
        </nav>
      </header>
      
      <main className="hero">
        <div className="hero-content">
          <h1>Dive Into The <span className="highlight">Underwater</span> Action!</h1>
          <p className="hero-description">
            Test your aim in this exciting underwater adventure. Launch your fish 
            projectile to hit sea creatures and rack up your score!
          </p>
          <button 
            onClick={startGame}
            className="play-button"
          >
            Play Now! 🎮
          </button>
        </div>
      </main>
      
      {/* Features section */}
      <section className="features">
        <h2>Game Features</h2>
        
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Test Your Aim</h3>
            <p>Launch your fish projectile with precision to hit underwater targets.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Rack Up Points</h3>
            <p>Hit all targets to complete the level and earn a high score.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌊</div>
            <h3>Underwater Adventure</h3>
            <p>Immerse yourself in a colorful aquatic world filled with sea creatures.</p>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="cta">
        <h2>Ready to Dive In?</h2>
        <p>Challenge yourself to hit all targets and become the master of the sea!</p>
        <button onClick={startGame} className="play-button">
          Start Playing Now!
        </button>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Fish Shooter Game. All rights reserved.</p>
        <div className="footer-tagline">Created with ♥ for underwater gaming fun</div>
      </footer>
    </div>
  );
};

export default LandingPage;