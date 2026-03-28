import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function GameMode() {
  // Game State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem('horseHighScore') || 0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Entity Positions
  const [horseX, setHorseX] = useState(50);
  const [carrot, setCarrot] = useState({ x: Math.random() * 90, y: -10 });
  
  const gameLoop = useRef();

  // 1. Movement Handler (Mouse/Touch)
  const handleMove = (e) => {
    if (!gameActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setHorseX(Math.max(10, Math.min(90, x)));
  };

  // 2. Start Game Logic
  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameActive(true);
    setCarrot({ x: Math.random() * 90, y: -10 });
  };

  // 3. Game Engine (Gravity & Collision)
  useEffect(() => {
    if (gameActive && !gameOver) {
      const frame = () => {
        setCarrot((prev) => {
          let nextY = prev.y + 1.8; // Gravity speed

          // Collision Detection (Did the Horse catch the Carrot?)
          const hit = nextY > 78 && nextY < 88 && Math.abs(prev.x - horseX) < 12;

          if (hit) {
            setScore(s => s + 1);
            return { x: Math.random() * 90, y: -10 };
          }

          // Game Over Logic (Carrot hit the ground)
          if (nextY > 105) {
            setGameOver(true);
            setGameActive(false);
            return prev;
          }

          return { ...prev, y: nextY };
        });
        gameLoop.current = requestAnimationFrame(frame);
      };
      gameLoop.current = requestAnimationFrame(frame);
    }

    return () => cancelAnimationFrame(gameLoop.current);
  }, [gameActive, gameOver, horseX]);

  // 4. Save High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('horseHighScore', score);
    }
  }, [score, highScore]);

  return (
    <div style={containerStyle}>
      {/* Header Bar */}
      <div style={headerStyle}>
        <Link to="/" style={exitButtonStyle}>🏠 EXIT</Link>
        <div style={statContainer}>
          <div style={scoreText}>🥕 {score}</div>
          <div style={highScoreText}>🏆 BEST: {highScore}</div>
        </div>
      </div>

      {/* Game Window */}
      <div 
        onMouseMove={handleMove} 
        style={canvasStyle}
      >
        {/* Start / Game Over Overlay */}
        {!gameActive && (
          <div style={overlayStyle}>
            {gameOver ? (
              <>
                <h1 style={{ color: '#d32f2f', fontSize: '48px' }}>OH NO!</h1>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>The carrot hit the grass!</p>
                <div style={{ fontSize: '60px', margin: '20px 0' }}>🐴💤</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '100px', marginBottom: '10px' }}>🐴</div>
                <h1 style={{ color: '#5D4037' }}>Carrot Catch!</h1>
                <p>Don't let the snacks hit the ground!</p>
              </>
            )}
            <button onClick={startGame} style={playButtonStyle}>
              {gameOver ? "TRY AGAIN" : "START GAME"}
            </button>
          </div>
        )}

        {/* Game Sprites */}
        {gameActive && (
          <>
            <div style={carrotSprite(carrot.x, carrot.y)}>🥕</div>
            <div style={horseSprite(horseX)}>🐴</div>
          </>
        )}
      </div>

      <div style={footerStyle}>
        <p><strong>HOW TO PLAY:</strong> Move your mouse to catch the carrots! 🥕</p>
      </div>
    </div>
  );
}

// --- STYLES (Kid Friendly & Sleek) ---

const containerStyle = {
  height: '100vh',
  backgroundColor: '#FFF9C4', // Soft Yellow
  display: 'flex',
  flexDirection: 'column',
  fontFamily: '"Comic Sans MS", cursive, sans-serif',
  overflow: 'hidden',
};

const headerStyle = {
  padding: '15px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'white',
  boxShadow: '0 5px 0px #FDD835',
  zIndex: 10
};

const exitButtonStyle = {
  backgroundColor: '#FF5252',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '15px',
  textDecoration: 'none',
  fontWeight: 'bold',
  boxShadow: '0 4px 0px #D32F2F'
};

const statContainer = { textAlign: 'right' };
const scoreText = { fontSize: '24px', fontWeight: '900', color: '#F57C00' };
const highScoreText = { fontSize: '12px', color: '#795548', fontWeight: 'bold' };

const canvasStyle = {
  flex: 1,
  position: 'relative',
  margin: '20px',
  backgroundColor: '#A5D6A7', // Green Grass
  borderRadius: '40px',
  border: '10px solid white',
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  cursor: 'none',
  overflow: 'hidden'
};

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(255,255,255,0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  textAlign: 'center'
};

const playButtonStyle = {
  padding: '20px 50px',
  fontSize: '24px',
  fontWeight: '900',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  boxShadow: '0 8px 0px #2E7D32',
  marginTop: '20px'
};

const carrotSprite = (x, y) => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  fontSize: '60px',
  transform: 'translateX(-50%)',
  zIndex: 5
});

const horseSprite = (x) => ({
  position: 'absolute',
  left: `${x}%`,
  bottom: '10%',
  fontSize: '90px',
  transform: 'translateX(-50%)',
  transition: 'left 0.1s ease-out',
  zIndex: 6
});

const footerStyle = {
  padding: '10px',
  textAlign: 'center',
  color: '#5D4037',
  fontSize: '14px'
};

export default GameMode;