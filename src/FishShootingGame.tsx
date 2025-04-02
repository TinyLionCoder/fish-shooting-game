import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./FishShootingGameStyles.module.css";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const LAUNCHER_POS = { x: 185, y: GAME_HEIGHT - 120 };
const GRAVITY = 0.35;
const LAUNCH_POWER_MULTIPLIER = 0.25;
const PROJECTILE_RADIUS = 20;
const TARGET_RADIUS = 18;

const initialTargets = [
  { id: 1, x: 100, y: 80, hit: false, emoji: "🐠" },
  { id: 2, x: 150, y: 130, hit: false, emoji: "🐡" },
  { id: 3, x: 300, y: 170, hit: false, emoji: "🐙" },
  { id: 4, x: 200, y: 120, hit: false, emoji: "🐟" },
  { id: 5, x: 250, y: 200, hit: false, emoji: "🦐" },
  { id: 6, x: 180, y: 200, hit: false, emoji: "🦞" },
  { id: 7, x: 370, y: 80, hit: false, emoji: "🦀" },
  { id: 8, x: 280, y: 80, hit: false, emoji: "🐳" },
  { id: 9, x: 50, y: 110, hit: false, emoji: "🐬" },
  { id: 10, x: 50, y: 160, hit: false, emoji: "🦈" },
];

const getDistance = (a: any, b: any) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const FishShootingGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [projectile, setProjectile] = useState({
    x: LAUNCHER_POS.x,
    y: LAUNCHER_POS.y,
    vx: 0,
    vy: 0,
    active: false,
    rotation: 0,
  });
  const [targets, setTargets] = useState(initialTargets);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStartPos, setAimStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [aimEndPos, setAimEndPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const gameAreaRef = useRef(null);
  const animationFrameId = useRef<number | null>(null);
  const isDragging = useRef(false);

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
  }, []);

  useEffect(() => {
    if (!projectile.active) return;
    const projPos = { x: projectile.x, y: projectile.y };

    targets.forEach((target) => {
      if (
        !target.hit &&
        getDistance(projPos, target) < PROJECTILE_RADIUS + TARGET_RADIUS
      ) {
        setScore((s) => s + 10);
        setTargets((prev) =>
          prev.map((t) => (t.id === target.id ? { ...t, hit: true } : t))
        );
      }
    });
  }, [projectile.x, projectile.y, projectile.active, targets]);

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
    //@ts-ignore
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: x - rect.left, y: y - rect.top };
  };

  const handleMouseDown = (e: any) => {
    if (projectile.active) return;
    const coords = getCoords(e);
    if (getDistance(coords, LAUNCHER_POS) < 50) {
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
  };

  const handleReset = () => {
    setScore(0);
    setTargets(initialTargets.map((t) => ({ ...t, hit: false })));
    setProjectile({
      x: LAUNCHER_POS.x,
      y: LAUNCHER_POS.y,
      vx: 0,
      vy: 0,
      active: false,
      rotation: 0,
    });
    setIsAiming(false);
    setAimStartPos(null);
    setAimEndPos(null);
    isDragging.current = false;
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

  return (
    <div className={styles.App}>
      <h1>Fish Shooting Game 🐟</h1>
      <div className={styles.ScoreDisplay}>Score: {score}</div>
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
            className={`${styles.Target} ${target.hit ? styles.hit : ""}`}
            style={{
              left: `${target.x - TARGET_RADIUS}px`,
              top: `${target.y - TARGET_RADIUS}px`,
              width: `${TARGET_RADIUS * 2}px`,
              height: `${TARGET_RADIUS * 2}px`,
            }}
          >
            {!target.hit && target.emoji}
          </div>
        ))}
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
      <button
        className={styles.ResetButton}
        onClick={handleReset}
        disabled={projectile.active && !allTargetsHit}
      >
        {allTargetsHit ? "Play Again?" : "Reset Targets"}
      </button>
      {allTargetsHit && (
        <div style={{ marginTop: "10px", color: "#61dafb" }}>
          You hit all targets!
        </div>
      )}
    </div>
  );
};

export default FishShootingGame;