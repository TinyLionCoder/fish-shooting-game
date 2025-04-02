//@ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./FishShootingGameStyles.module.css";

const GAME_WIDTH = 1200; // Wider game area
const GAME_HEIGHT = 500;
const LAUNCHER_POS = { x: 600, y: GAME_HEIGHT - 120 }; // Centered launcher
const GRAVITY = 0.35;
const LAUNCH_POWER_MULTIPLIER = 0.25;
const PROJECTILE_RADIUS = 20;
const TARGET_RADIUS = 18;
const MAX_LEVEL = 3;

// Define targets for different levels
const levelTargets = {
  1: [
    { id: 1, x: 100, y: 80, hit: false, emoji: "🐠", points: 10 },
    { id: 2, x: 150, y: 130, hit: false, emoji: "🐡", points: 10 },
    { id: 3, x: 300, y: 170, hit: false, emoji: "🐙", points: 10 },
    { id: 4, x: 200, y: 120, hit: false, emoji: "🐟", points: 10 },
    { id: 5, x: 250, y: 200, hit: false, emoji: "🦐", points: 10 },
    { id: 6, x: 180, y: 200, hit: false, emoji: "🦞", points: 10 },
    { id: 7, x: 370, y: 80, hit: false, emoji: "🦀", points: 10 },
    { id: 8, x: 280, y: 80, hit: false, emoji: "🐳", points: 10 },
    { id: 9, x: 950, y: 110, hit: false, emoji: "🐬", points: 10 },
    { id: 10, x: 850, y: 160, hit: false, emoji: "🦈", points: 10 },
  ],
  2: [
    { id: 1, x: 120, y: 90, hit: false, emoji: "🐠", points: 15 },
    { id: 2, x: 220, y: 150, hit: false, emoji: "🐡", points: 15 },
    { id: 3, x: 320, y: 80, hit: false, emoji: "🐙", points: 15 },
    { id: 4, x: 420, y: 120, hit: false, emoji: "🐟", points: 15 },
    { id: 5, x: 520, y: 180, hit: false, emoji: "🦐", points: 15 },
    { id: 6, x: 620, y: 100, hit: false, emoji: "🦞", points: 15 },
    { id: 7, x: 720, y: 160, hit: false, emoji: "🦀", points: 15 },
    { id: 8, x: 820, y: 90, hit: false, emoji: "🐳", points: 15 },
    { id: 9, x: 920, y: 130, hit: false, emoji: "🐬", points: 15 },
    { id: 10, x: 1020, y: 170, hit: false, emoji: "🦈", points: 15 },
    { id: 11, x: 400, y: 50, hit: false, emoji: "🐊", points: 25, speed: 1.5 },
    { id: 12, x: 700, y: 50, hit: false, emoji: "🦑", points: 25, speed: 1.5 },
  ],
  3: [
    { id: 1, x: 100, y: 70, hit: false, emoji: "🐠", points: 20, speed: 1.2 },
    { id: 2, x: 200, y: 140, hit: false, emoji: "🐡", points: 20, speed: 1.2 },
    { id: 3, x: 300, y: 80, hit: false, emoji: "🐙", points: 20, speed: 1.3 },
    { id: 4, x: 400, y: 150, hit: false, emoji: "🐟", points: 20, speed: 1.4 },
    { id: 5, x: 500, y: 90, hit: false, emoji: "🦐", points: 20, speed: 1.2 },
    { id: 6, x: 600, y: 160, hit: false, emoji: "🦞", points: 20, speed: 1.5 },
    { id: 7, x: 700, y: 100, hit: false, emoji: "🦀", points: 20, speed: 1.3 },
    { id: 8, x: 800, y: 170, hit: false, emoji: "🐳", points: 20, speed: 1.4 },
    { id: 9, x: 900, y: 110, hit: false, emoji: "🐬", points: 20, speed: 1.2 },
    { id: 10, x: 1000, y: 180, hit: false, emoji: "🦈", points: 20, speed: 1.5 },
    { id: 11, x: 250, y: 50, hit: false, emoji: "🐊", points: 30, speed: 2 },
    { id: 12, x: 450, y: 50, hit: false, emoji: "🦑", points: 30, speed: 2 },
    { id: 13, x: 650, y: 50, hit: false, emoji: "🐋", points: 30, speed: 1.8 },
    { id: 14, x: 850, y: 50, hit: false, emoji: "🦭", points: 30, speed: 1.9 },
    { id: 15, x: 550, y: 200, hit: false, emoji: "🦕", points: 50, speed: 1.5 },
  ],
};

const getDistance = (a, b) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const FishShootingGame = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [projectile, setProjectile] = useState({
    x: LAUNCHER_POS.x,
    y: LAUNCHER_POS.y,
    vx: 0,
    vy: 0,
    active: false,
    rotation: 0,
  });
  const [targets, setTargets] = useState(levelTargets[1]);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStartPos, setAimStartPos] = useState(null);
  const [aimEndPos, setAimEndPos] = useState(null);
  const [shotsRemaining, setShotsRemaining] = useState(10);
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "level_complete", "game_over"
  const [targetMovementEnabled, setTargetMovementEnabled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [powerUp, setPowerUp] = useState(null);

  const gameAreaRef = useRef(null);
  const animationFrameId = useRef(null);
  const targetAnimationFrameId = useRef(null);
  const isDragging = useRef(false);

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
  const startLevel = (levelNum) => {
    setLevel(levelNum);
    setTargets(levelTargets[levelNum].map(t => ({ ...t, hit: false })));
    setShotsRemaining(10 + (levelNum - 1) * 2); // More shots for higher levels
    setGameStatus("playing");
    
    // Set target movement speed based on level
    setTargetMovementEnabled(levelNum > 1);
  };

  // Load level when level changes
  useEffect(() => {
    startLevel(level);
  }, [level]);

  // Handle target movement
  useEffect(() => {
    if (!targetMovementEnabled) return;

    const moveTargets = () => {
      setTargets(prevTargets => {
        return prevTargets.map(target => {
          if (target.hit) return target;

          // Default movement pattern
          let newX = target.x + (Math.sin(Date.now() / 1000 * (target.speed || 1)) * 1.5);
          
          // Make sure targets stay in bounds
          if (newX < 0) newX = 0;
          if (newX > GAME_WIDTH) newX = GAME_WIDTH;

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
  }, [targetMovementEnabled]);

  // Randomly spawn power-ups
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const spawnPowerUp = () => {
      // 5% chance to spawn a power-up if none exists
      if (!powerUp && Math.random() < 0.05) {
        setPowerUp({
          x: 100 + Math.random() * (GAME_WIDTH - 200),
          y: 50 + Math.random() * 150,
          type: Math.random() < 0.5 ? "extraShot" : "doubleDamage",
          collected: false
        });
      }
      
      setTimeout(spawnPowerUp, 5000); // Check every 5 seconds
    };

    const powerUpTimer = setTimeout(spawnPowerUp, 5000);
    
    return () => clearTimeout(powerUpTimer);
  }, [gameStatus, powerUp]);

  const gameLoop = useCallback(() => {
    setProjectile((prev) => {
      if (!prev.active) return prev;

      const newVy = prev.vy + GRAVITY;
      const newX = prev.x + prev.vx;
      const newY = prev.y + newVy;
      const angle = Math.atan2(newVy, prev.vx) * (180 / Math.PI);

      if (
        newY > GAME_HEIGHT - PROJECTILE_RADIUS ||
        newX < 0 ||
        newX > GAME_WIDTH
      ) {
        // Check if out of shots
        if (shotsRemaining <= 1) {
          const allHit = targets.every(t => t.hit);
          if (allHit) {
            if (level < MAX_LEVEL) {
              setGameStatus("level_complete");
            } else {
              setGameStatus("game_won");
            }
          } else {
            setGameStatus("game_over");
          }
        }

        return {
          ...prev,
          active: false,
          vx: 0,
          vy: 0,
          x: LAUNCHER_POS.x,
          y: LAUNCHER_POS.y,
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
  }, [shotsRemaining, targets, level]);

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
      setPowerUp(prev => ({ ...prev, collected: true }));

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

  const getCoords = (e) => {
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: x - rect.left, y: y - rect.top };
  };

  const handleMouseDown = (e) => {
    if (gameStatus !== "playing" || projectile.active || showTutorial) return;
    const coords = getCoords(e);
    if (getDistance(coords, LAUNCHER_POS) < 50) {
      isDragging.current = true;
      setIsAiming(true);
      setAimStartPos(coords);
      setAimEndPos(coords);
    }
  };

  const handleMouseMove = (e) => {
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
      x: LAUNCHER_POS.x,
      y: LAUNCHER_POS.y,
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
      startLevel(level + 1);
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
      x: LAUNCHER_POS.x,
      y: LAUNCHER_POS.y,
    };
  }

  const allTargetsHit = targets.every((t) => t.hit);
  
  // Calculate power level for UI display
  let powerLevel = 0;
  if (isAiming && aimStartPos && aimEndPos) {
    const dx = aimStartPos.x - aimEndPos.x;
    const dy = aimStartPos.y - aimEndPos.y;
    powerLevel = Math.min(100, Math.sqrt(dx * dx + dy * dy) / 3);
  }

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <div className={styles.Launcher}>
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
              animationDuration: target.speed ? `${3 / target.speed}s` : "3s"
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