import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./FishShootingGameStyles.module.css";

// Dynamic game size constants
const getInitialGameSize = () => {
  // Default sizes for desktop
  let width = 1200;
  let height = 500;
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // For mobile/smaller screens
    if (window.innerWidth < 768) {
      width = window.innerWidth - 20; // Account for padding
      height = 350;
    } 
    // For tablets/medium screens
    else if (window.innerWidth < 1200) {
      width = window.innerWidth - 20;
      height = 400;
    }
  }
  
  return { width, height };
};

const PROJECTILE_RADIUS = 20;
const TARGET_RADIUS = 18;
const MAX_LEVEL = 3;

// Define targets for different levels with relative positioning
const generateLevelTargets = (gameWidth: any, gameHeight: any) => {
  // Helper function to scale positions based on game dimensions
  const scalePosition = (baseX: any, baseY: any) => {
    const xScale = gameWidth / 1200; // Original width
    const yScale = gameHeight / 500; // Original height
    return { x: baseX * xScale, y: baseY * yScale };
  };

  return {
    1: [
      { id: 1, ...scalePosition(100, 80), hit: false, emoji: "🐠", points: 10 },
      { id: 2, ...scalePosition(150, 130), hit: false, emoji: "🐡", points: 10 },
      { id: 3, ...scalePosition(300, 170), hit: false, emoji: "🐙", points: 10 },
      { id: 4, ...scalePosition(200, 120), hit: false, emoji: "🐟", points: 10 },
      { id: 5, ...scalePosition(250, 200), hit: false, emoji: "🦐", points: 10 },
      { id: 6, ...scalePosition(180, 200), hit: false, emoji: "🦞", points: 10 },
      { id: 7, ...scalePosition(370, 80), hit: false, emoji: "🦀", points: 10 },
      { id: 8, ...scalePosition(280, 80), hit: false, emoji: "🐳", points: 10 },
      { id: 9, ...scalePosition(950, 110), hit: false, emoji: "🐬", points: 10 },
      { id: 10, ...scalePosition(850, 160), hit: false, emoji: "🦈", points: 10 },
    ],
    2: [
      { id: 1, ...scalePosition(120, 90), hit: false, emoji: "🐠", points: 15 },
      { id: 2, ...scalePosition(220, 150), hit: false, emoji: "🐡", points: 15 },
      { id: 3, ...scalePosition(320, 80), hit: false, emoji: "🐙", points: 15 },
      { id: 4, ...scalePosition(420, 120), hit: false, emoji: "🐟", points: 15 },
      { id: 5, ...scalePosition(520, 180), hit: false, emoji: "🦐", points: 15 },
      { id: 6, ...scalePosition(620, 100), hit: false, emoji: "🦞", points: 15 },
      { id: 7, ...scalePosition(720, 160), hit: false, emoji: "🦀", points: 15 },
      { id: 8, ...scalePosition(820, 90), hit: false, emoji: "🐳", points: 15 },
      { id: 9, ...scalePosition(920, 130), hit: false, emoji: "🐬", points: 15 },
      { id: 10, ...scalePosition(1020, 170), hit: false, emoji: "🦈", points: 15 },
      { id: 11, ...scalePosition(400, 50), hit: false, emoji: "🐊", points: 25, speed: 1.5 },
      { id: 12, ...scalePosition(700, 50), hit: false, emoji: "🦑", points: 25, speed: 1.5 },
    ],
    3: [
      { id: 1, ...scalePosition(100, 70), hit: false, emoji: "🐠", points: 20, speed: 1.2 },
      { id: 2, ...scalePosition(200, 140), hit: false, emoji: "🐡", points: 20, speed: 1.2 },
      { id: 3, ...scalePosition(300, 80), hit: false, emoji: "🐙", points: 20, speed: 1.3 },
      { id: 4, ...scalePosition(400, 150), hit: false, emoji: "🐟", points: 20, speed: 1.4 },
      { id: 5, ...scalePosition(500, 90), hit: false, emoji: "🦐", points: 20, speed: 1.2 },
      { id: 6, ...scalePosition(600, 160), hit: false, emoji: "🦞", points: 20, speed: 1.5 },
      { id: 7, ...scalePosition(700, 100), hit: false, emoji: "🦀", points: 20, speed: 1.3 },
      { id: 8, ...scalePosition(800, 170), hit: false, emoji: "🐳", points: 20, speed: 1.4 },
      { id: 9, ...scalePosition(900, 110), hit: false, emoji: "🐬", points: 20, speed: 1.2 },
      { id: 10, ...scalePosition(1000, 180), hit: false, emoji: "🦈", points: 20, speed: 1.5 },
      { id: 11, ...scalePosition(250, 50), hit: false, emoji: "🐊", points: 30, speed: 2 },
      { id: 12, ...scalePosition(450, 50), hit: false, emoji: "🦑", points: 30, speed: 2 },
      { id: 13, ...scalePosition(650, 50), hit: false, emoji: "🐋", points: 30, speed: 1.8 },
      { id: 14, ...scalePosition(850, 50), hit: false, emoji: "🦭", points: 30, speed: 1.9 },
      { id: 15, ...scalePosition(550, 200), hit: false, emoji: "🦕", points: 50, speed: 1.5 },
    ],
  };
};

const getDistance = (a: any, b: any) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const FishShootingGame = () => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameSize, setGameSize] = useState(getInitialGameSize());
  const [launcherPos, setLauncherPos] = useState({ 
    x: gameSize.width / 2, 
    y: gameSize.height - 120
  });

  // Game state
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [projectile, setProjectile] = useState({
    x: launcherPos.x,
    y: launcherPos.y,
    vx: 0,
    vy: 0,
    active: false,
    rotation: 0,
  });
  const [targets, setTargets] = useState(generateLevelTargets(gameSize.width, gameSize.height)[1]);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStartPos, setAimStartPos] = useState<{ x: number; y: number } | null>(null);
  const [aimEndPos, setAimEndPos] = useState<{ x: number; y: number } | null>(null);
  const [shotsRemaining, setShotsRemaining] = useState(10);
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "level_complete", "game_over", "game_won"
  const [targetMovementEnabled, setTargetMovementEnabled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [powerUp, setPowerUp] = useState<{
    x: number;
    y: number;
    type: "extraShot" | "doubleDamage";
    collected: boolean;
  } | null>(null);

  const animationFrameId = useRef<number | null>(null);
  const targetAnimationFrameId = useRef<number | null>(null);
  const isDragging = useRef(false);
  const GRAVITY = 0.35;
  const LAUNCH_POWER_MULTIPLIER = 0.25;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newSize = getInitialGameSize();
      setGameSize(newSize);
      
      // Update launcher position when game size changes
      setLauncherPos({ 
        x: newSize.width / 2, 
        y: newSize.height - 80 
      });
      
      // Reset projectile position
      if (!projectile.active) {
        setProjectile(prev => ({
          ...prev,
          x: newSize.width / 2,
          y: newSize.height - 80
        }));
      }
      
      // Update target positions
      if (level >= 1 && level <= MAX_LEVEL) {
        const scaledTargets = generateLevelTargets(newSize.width, newSize.height)[level as 1 | 2 | 3];
        setTargets(prev => {
          return prev.map((target, index) => {
            if (index < scaledTargets.length) {
              return {
                ...target,
                x: scaledTargets[index].x,
                y: scaledTargets[index].y,
              };
            }
            return target;
          });
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameSize.width, gameSize.height, level, projectile.active]);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("fishShootingHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Update high score if current score is higher
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("fishShootingHighScore", score.toString());
    }
  }, [score, highScore]);

  // Reset game for new level
  const startLevel = (levelNum: 1 | 2 | 3) => {
    setLevel(levelNum);
    const levelTargets = generateLevelTargets(gameSize.width, gameSize.height)[levelNum];
    setTargets(levelTargets.map(t => ({ ...t, hit: false, speed: 'speed' in t ? t.speed : 1 })));
    setShotsRemaining(10 + (levelNum - 1) * 2); // More shots for higher levels
    setGameStatus("playing");
    
    // Set target movement speed based on level
    setTargetMovementEnabled(levelNum > 1);
  };

  // Load level when level changes
  useEffect(() => {
    startLevel(level as 1 | 2 | 3);
  }, [level, gameSize.width, gameSize.height]);

  // Check game status after each target is hit or shot is taken
  useEffect(() => {
    // Only check when game is in playing state
    if (gameStatus !== "playing" || projectile.active) return;
    
    const allTargetsHit = targets.every(t => t.hit);
    
    // If all targets are hit, advance to next level or win the game
    if (allTargetsHit) {
      if (level < MAX_LEVEL) {
        setGameStatus("level_complete");
      } else {
        setGameStatus("game_won");
      }
      return;
    }
    
    // If out of shots and not all targets hit, game over
    if (shotsRemaining <= 0 && !allTargetsHit) {
      setGameStatus("game_over");
    }
  }, [targets, shotsRemaining, level, gameStatus, projectile.active]);

  // Handle target movement
  useEffect(() => {
    if (!targetMovementEnabled) return;

    const moveTargets = () => {
      setTargets(prevTargets => {
        return prevTargets.map(target => {
          if (target.hit) return target;

          // Default movement pattern - scale with game width
          let newX = target.x + (Math.sin(Date.now() / 1000 * ('speed' in target ? (target as { speed: number }).speed : 1)) * 1.5 * (gameSize.width / 1200));
          
          // Make sure targets stay in bounds (with margin for visibility)
          const marginX = TARGET_RADIUS * 2;
          if (newX < marginX) newX = marginX;
          if (newX > gameSize.width - marginX) newX = gameSize.width - marginX;

          return {
            ...target,
            x: newX
          };
        });
      });

      targetAnimationFrameId.current = requestAnimationFrame(moveTargets);
    };

    targetAnimationFrameId.current = requestAnimationFrame(moveTargets);

    return () => {
      if (targetAnimationFrameId.current) {
        cancelAnimationFrame(targetAnimationFrameId.current);
      }
    };
  }, [targetMovementEnabled, gameSize.width]);

  // Randomly spawn power-ups
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const spawnPowerUp = () => {
      // 5% chance to spawn a power-up if none exists
      if (!powerUp && Math.random() < 0.05) {
        setPowerUp({
          x: 100 + Math.random() * (gameSize.width - 200),
          y: 50 + Math.random() * 150,
          type: Math.random() < 0.5 ? "extraShot" : "doubleDamage",
          collected: false
        });
      }
      
      setTimeout(spawnPowerUp, 5000); // Check every 5 seconds
    };

    const powerUpTimer = setTimeout(spawnPowerUp, 5000);
    
    return () => clearTimeout(powerUpTimer);
  }, [gameStatus, powerUp, gameSize.width]);

  const gameLoop = useCallback(() => {
    setProjectile((prev) => {
      if (!prev.active) return prev;

      const newVy = prev.vy + GRAVITY;
      const newX = prev.x + prev.vx;
      const newY = prev.y + newVy;
      const angle = Math.atan2(newVy, prev.vx) * (180 / Math.PI);

      if (
        newY > gameSize.height - PROJECTILE_RADIUS ||
        newX < 0 ||
        newX > gameSize.width
      ) {
        // Projectile is out of bounds, reset it
        return {
          ...prev,
          active: false,
          vx: 0,
          vy: 0,
          x: launcherPos.x,
          y: launcherPos.y,
          rotation: 0,
        };
      }

      return {
        ...prev,
        x: newX,
        y: newY,
        vy: newVy,
        active: true,
        rotation: angle,
      };
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameSize.height, gameSize.width, launcherPos.x, launcherPos.y]);

  useEffect(() => {
    if (!projectile.active) return;
    const projPos = { x: projectile.x, y: projectile.y };

    // Check collision with targets
    targets.forEach((target) => {
      if (
        !target.hit &&
        getDistance(projPos, target) < PROJECTILE_RADIUS + TARGET_RADIUS
      ) {
        setScore((s) => s + (target.points || 10));
        setTargets((prev) =>
          prev.map((t) => (t.id === target.id ? { ...t, hit: true } : t))
        );

        // Sound effect could be added here
      }
    });

    // Check collision with power-up
    if (powerUp && !powerUp.collected && getDistance(projPos, powerUp) < PROJECTILE_RADIUS + 20) {
      setPowerUp(prev => prev ? { ...prev, collected: true } : prev);

      // Apply power-up effect
      if (powerUp.type === "extraShot") {
        setShotsRemaining(prev => prev + 3);
      } else if (powerUp.type === "doubleDamage") {
        // Could implement a temporary damage boost
        setScore(prev => prev + 30); // Simple bonus points
      }

      // Remove power-up after collection
      setTimeout(() => setPowerUp(null), 100);
    }
  }, [projectile.x, projectile.y, projectile.active, targets, powerUp]);

  useEffect(() => {
    if (projectile.active) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    }
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [projectile.active, gameLoop]);

  const getCoords = (e: any) => {
    if (!gameAreaRef.current) return { x: 0, y: 0 }; // Default fallback
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: x - rect.left, y: y - rect.top };
  };

  const handleMouseDown = (e: any) => {
    if (gameStatus !== "playing" || projectile.active || showTutorial) return;
    const coords = getCoords(e);
    if (getDistance(coords, launcherPos) < 50) {
      isDragging.current = true;
      setIsAiming(true);
      setAimStartPos(coords);
      setAimEndPos(coords);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging.current || !isAiming) return;
    const coords = getCoords(e);
    setAimEndPos(coords);
  };

  const handleMouseUp = () => {
    if (!isDragging.current || !isAiming || !aimStartPos || !aimEndPos) return;
    isDragging.current = false;
    setIsAiming(false);

    // Launching the projectile
    const dx = aimStartPos.x - aimEndPos.x;
    const dy = aimStartPos.y - aimEndPos.y;

    setProjectile({
      x: launcherPos.x,
      y: launcherPos.y,
      vx: dx * LAUNCH_POWER_MULTIPLIER,
      vy: dy * LAUNCH_POWER_MULTIPLIER,
      active: true,
      rotation: 0,
    });

    // Decrement shots
    setShotsRemaining(prev => prev - 1);
  };

  const nextLevel = () => {
    if (level < MAX_LEVEL) {
      startLevel((level + 1) as 1 | 2 | 3);
    }
  };

  const restartGame = () => {
    setScore(0);
    startLevel(1);
    setShowTutorial(false);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  let aimLine = null;
  if (isAiming && aimStartPos && aimEndPos) {
    const dx = aimEndPos.x - aimStartPos.x;
    const dy = aimEndPos.y - aimStartPos.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    aimLine = {
      length,
      angle: angle + 180,
      x: launcherPos.x,
      y: launcherPos.y,
    };
  }
  
  // Calculate power level for UI display
  let powerLevel = 0;
  if (isAiming && aimStartPos && aimEndPos) {
    const dx = aimStartPos.x - aimEndPos.x;
    const dy = aimStartPos.y - aimEndPos.y;
    powerLevel = Math.min(100, Math.sqrt(dx * dx + dy * dy) / 3);
  }

  // Apply responsive styles to game area
  const gameAreaStyle = {
    width: '100%',
    maxWidth: `${gameSize.width}px`,
    height: `${gameSize.height}px`,
  };

  return (
    <div className={styles.App}>
      <div className={styles.Header}>
        <h1>Fish Shooting Game 🐟</h1>
        <div className={styles.GameInfo}>
          <div className={styles.ScoreDisplay}>Score: {score}</div>
          <div className={styles.LevelDisplay}>Level: {level}/{MAX_LEVEL}</div>
          <div className={styles.ShotsDisplay}>Shots: {shotsRemaining}</div>
          <div className={styles.HighScoreDisplay}>High Score: {highScore}</div>
        </div>
      </div>
      
      <div
        ref={gameAreaRef}
        className={styles.GameArea}
        style={gameAreaStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <div 
          className={styles.Launcher}
          style={{ 
            position: 'absolute',
            left: `${launcherPos.x - 25}px`, 
            top: `${launcherPos.y - 25}px` 
          }}
        >
          {!projectile.active && <span className={styles.Launcher_Indicator}>🐟</span>}
        </div>
        
        {/* Power meter when aiming */}
        {isAiming && (
          <div className={styles.PowerMeter}>
            <div 
              className={styles.PowerIndicator} 
              style={{ width: `${powerLevel}%`, 
              backgroundColor: powerLevel < 30 ? '#3dd13d' : 
                              powerLevel < 70 ? '#f1c232' : 
                              '#cc0000' 
            }} 
            />
          </div>
        )}
        
        {aimLine && (
          <div
            className={styles.AimingLine}
            style={{
              width: `${aimLine.length}px`,
              transform: `translate(${aimLine.x}px, ${aimLine.y}px) rotate(${aimLine.angle}deg)`,
            }}
          />
        )}
        
        {projectile.active && (
          <div
            className={styles.Projectile}
            style={{
              left: `${projectile.x - PROJECTILE_RADIUS}px`,
              top: `${projectile.y - PROJECTILE_RADIUS}px`,
              transform: `rotate(${projectile.rotation}deg)`,
            }}
          >
            🐟
          </div>
        )}
        
        {targets.map((target) => (
          <div
            key={target.id}
            className={`${styles.Target} ${target.hit ? styles.hit : ""} ${target.points >= 30 ? styles.bonusTarget : ""}`}
            style={{
              left: `${target.x - TARGET_RADIUS}px`,
              top: `${target.y - TARGET_RADIUS}px`,
              width: `${TARGET_RADIUS * 2}px`,
              height: `${TARGET_RADIUS * 2}px`,
              animationDuration: 'speed' in target && typeof target.speed === 'number' ? `${3 / target.speed}s` : "3s"
            }}
          >
            {!target.hit && target.emoji}
          </div>
        ))}
        
        {/* Power-up display */}
        {powerUp && !powerUp.collected && (
          <div
            className={styles.PowerUp}
            style={{
              left: `${powerUp.x - 20}px`,
              top: `${powerUp.y - 20}px`,
            }}
          >
            {powerUp.type === "extraShot" ? "🎯" : "⚡"}
          </div>
        )}
        
        <div className={styles.Bubbles}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={styles.bubble}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
      
      {/* Game status panels */}
      {gameStatus === "game_over" && (
        <div className={styles.GameOverPanel}>
          <h2>Game Over!</h2>
          <p>Your final score: {score}</p>
          <p>High score: {highScore}</p>
          <button className={styles.ActionButton} onClick={restartGame}>
            Play Again
          </button>
        </div>
      )}
      
      {gameStatus === "level_complete" && (
        <div className={styles.LevelCompletePanel}>
          <h2>Level {level} Complete!</h2>
          <p>Current score: {score}</p>
          <button className={styles.ActionButton} onClick={nextLevel}>
            Next Level
          </button>
        </div>
      )}
      
      {gameStatus === "game_won" && (
        <div className={styles.GameWonPanel}>
          <h2>Congratulations!</h2>
          <p>You completed all levels with a score of {score}!</p>
          <p>High score: {highScore}</p>
          <button className={styles.ActionButton} onClick={restartGame}>
            Play Again
          </button>
        </div>
      )}
      
      {/* Tutorial overlay */}
      {showTutorial && (
        <div className={styles.TutorialOverlay}>
          <div className={styles.TutorialContent}>
            <h2>How to Play</h2>
            <ul>
              <li>Click and drag from the fish launcher to aim</li>
              <li>Release to launch your fish</li>
              <li>Hit all the sea creatures to complete the level</li>
              <li>Watch out for moving targets in higher levels!</li>
              <li>Collect power-ups for bonuses</li>
            </ul>
            <button className={styles.ActionButton} onClick={closeTutorial}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishShootingGame;