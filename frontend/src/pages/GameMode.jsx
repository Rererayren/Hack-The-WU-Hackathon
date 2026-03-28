import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function GameMode() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    localStorage.getItem('horseHighScore') || 0
  );
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Horse (SMOOTH CONTROL)
  const horseX = useRef(50);
  const horseTargetX = useRef(50);

  // Force re-render for animation
  const [, setRender] = useState(0);

  // Carrot
  const [carrot, setCarrot] = useState({
    x: Math.random() * 90,
    y: -10
  });

  const gameLoop = useRef();

  // 🎮 Smooth Mouse Movement
  const handleMove = (e) => {
    if (!gameActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;

    horseTargetX.current = Math.max(10, Math.min(90, x));
  };

  // ▶️ Start Game
  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameActive(true);
    setCarrot({ x: Math.random() * 90, y: -10 });
  };

  // 🎯 Game Loop
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const frame = () => {
      // 🐎 Smooth horse movement (LERP)
      horseX.current += (horseTargetX.current - horseX.current) * 0.15;

      setCarrot((prev) => {
        let nextY = prev.y + 1.8;

        // 🎯 Collision detection
        const hit =
          nextY > 78 &&
          nextY < 88 &&
          Math.abs(prev.x - horseX.current) < 12;

        if (hit) {
          setScore((s) => s + 1);
          return { x: Math.random() * 90, y: -10 };
        }

        // 💀 Game Over
        if (nextY > 105) {
          setGameOver(true);
          setGameActive(false);
          return prev;
        }

        return { ...prev, y: nextY };
      });

      setRender((r) => r + 1); // force redraw
      gameLoop.current = requestAnimationFrame(frame);
    };

    gameLoop.current = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(gameLoop.current);
  }, [gameActive, gameOver]);

  // 🏆 High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('horseHighScore', score);
    }
  }, [score, highScore]);

  return (
    <div style={containerStyle}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <Link to="/" style={exitButtonStyle}>🏠 EXIT</Link>
        <div style={statContainer}>
          <div style={scoreText}>🥕 {score}</div>
          <div style={highScoreText}>🏆 BEST: {highScore}</div>
        </div>
      </div>

      {/* GAME AREA */}
      <div onMouseMove={handleMove} style={canvasStyle}>
        
        {/* OVERLAY */}
        {!gameActive && (
          <div style={overlayStyle}>
            {gameOver ? (
              <>
                <h1>💀 Game Over</h1>
                <p>Try again!</p>
              </>
            ) : (
              <>
                <h1>🐴 Carrot Catch</h1>
                <p>Move your mouse to catch carrots!</p>
              </>
            )}

            <button onClick={startGame} style={playButtonStyle}>
              {gameOver ? "TRY AGAIN" : "START"}
            </button>
          </div>
        )}

        {/* SPRITES */}
        {gameActive && (
          <>
            <div style={carrotStyle(carrot.x, carrot.y)}>🥕</div>
            <div style={horseStyle(horseX.current)}>🐴</div>
          </>
        )}

      </div>

      {/* FOOTER */}
      <div style={footerStyle}>
        Move your mouse to control the horse 🐎
      </div>

    </div>
  );
}

/* 🎨 STYLES */

const containerStyle = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: '#FFF9C4'
};

const headerStyle = {
  padding: '15px',
  display: 'flex',
  justifyContent: 'space-between',
  background: 'white'
};

const exitButtonStyle = {
  background: 'red',
  color: 'white',
  padding: '8px 15px',
  borderRadius: '10px',
  textDecoration: 'none'
};

const statContainer = { textAlign: 'right' };
const scoreText = { fontSize: '20px', color: 'orange' };
const highScoreText = { fontSize: '12px' };

const canvasStyle = {
  flex: 1,
  margin: '20px',
  background: '#A5D6A7',
  borderRadius: '30px',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'none'
};

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(255,255,255,0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const playButtonStyle = {
  padding: '15px 40px',
  fontSize: '20px',
  borderRadius: '20px',
  border: 'none',
  background: 'green',
  color: 'white',
  cursor: 'pointer'
};

const carrotStyle = (x, y) => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  fontSize: '50px',
  transform: 'translateX(-50%)'
});

const horseStyle = (x) => ({
  position: 'absolute',
  left: `${x}%`,
  bottom: '10%',
  fontSize: '80px',
  transform: 'translateX(-50%)'
});

const footerStyle = {
  textAlign: 'center',
  padding: '10px'
};

export default GameMode;