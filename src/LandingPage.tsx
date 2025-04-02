import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPageStyles.module.css';

const LandingPage = () => {
  const navigate = useNavigate();
  
  const startGame = () => {
    navigate('/game');
  };
  
  return (
    <div className={styles['landing-page']}>
      {/* Animated underwater elements */}
      <div className={`${styles.seaweed} ${styles['seaweed-left']}`}></div>
      <div className={`${styles.seaweed} ${styles['seaweed-right']}`}></div>
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>Fish Shooter</div>
        <nav>
          <ul className={styles['nav-links']}>
            <li>Home</li>
            <li>About</li>
            <li>Leaderboard</li>
          </ul>
        </nav>
      </header>
      
      {/* Hero Section */}
      <main className={styles.hero}>
        <div className={styles['hero-content']}>
          <h1>Dive Into The <span className={styles.highlight}>Underwater</span> Action!</h1>
          <p className={styles['hero-description']}>
            Test your aim in this exciting underwater adventure. Launch your fish 
            projectile to hit sea creatures and rack up your score in this challenging aquatic game!
          </p>
          <button 
            onClick={startGame}
            className={styles['play-button']}
          >
            Play Now! 🎮
          </button>
        </div>
        
        <div className={styles['hero-image']}>
          <div className={styles['game-preview']}>
            <div className={styles['preview-content']}>
              <div className={styles.emojis}>
                <span style={{"--i": 0} as React.CSSProperties}>🐠</span>
                <span style={{"--i": 1} as React.CSSProperties}>🐡</span>
                <span style={{"--i": 2} as React.CSSProperties}>🐙</span>
                <span style={{"--i": 3} as React.CSSProperties}>🦐</span>
              </div>
              <div className={styles.target}>🎯</div>
              
              {/* Animated bubbles */}
              {[...Array(15)].map((_, i) => (
                <div 
                  key={i}
                  className={styles.bubble}
                  style={{
                    width: `${Math.random() * 20 + 10}px`,
                    height: `${Math.random() * 20 + 10}px`,
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 5 + 3}s`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Features section */}
      <section className={styles.features}>
        <h2>Game Features</h2>
        
        <div className={styles['feature-cards']}>
          <div className={styles['feature-card']}>
            <div className={styles['feature-icon']}>🎯</div>
            <h3>Test Your Aim</h3>
            <p>Launch your fish projectile with precision to hit underwater targets and become the master of the deep sea.</p>
          </div>
          
          <div className={styles['feature-card']}>
            <div className={styles['feature-icon']}>🏆</div>
            <h3>Earn High Scores</h3>
            <p>Rack up points, complete challenging levels, and compete for the top spot on the leaderboard.</p>
          </div>
          
          <div className={styles['feature-card']}>
            <div className={styles['feature-icon']}>🌊</div>
            <h3>Underwater Adventure</h3>
            <p>Immerse yourself in a colorful aquatic world filled with sea creatures and exciting power-ups.</p>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className={styles.cta}>
        <h2>Ready to Dive In?</h2>
        <p>Challenge yourself to hit all targets and become the master of the sea! Each level brings new challenges with moving targets and special sea creatures.</p>
        <button onClick={startGame} className={styles['play-button']}>
          Start Playing Now!
        </button>
      </section>
      
      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2025 Fish Shooter Game. All rights reserved.</p>
        <div className={styles['footer-tagline']}>Created with ♥ for underwater gaming fun</div>
      </footer>
    </div>
  );
};

export default LandingPage;