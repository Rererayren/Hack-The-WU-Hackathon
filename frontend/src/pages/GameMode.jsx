import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function GameMode() {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [horsePos, setHorsePos] = useState(50); // Percentage from left
  const [carrotPos, setCarrotPos] = useState({ x: Math.random() * 90, y: -10 });
  
  const gameLoop = useRef();

  // Handle Mouse/Touch Movement
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setHorsePos(Math.max(5, Math.min(95, x)));
  };

  useEffect(() => {
    if (gameActive) {
      const update = () => {
        setCarrotPos((prev) => {
          let newY = prev.y + 1.5; // Speed of falling
          
          // Collision Detection (If carrot hits horse)
          if (newY > 80 && newY < 90 && Math.abs(prev.x - horsePos) < 10) {
            setScore(s => s + 1);
            return { x: Math.random() * 90, y: -10 };
          }

          // Reset if carrot falls off screen
          if (newY > 100) return { x: Math.random() * 90, y: -10 };
          
          return { ...prev, y: newY };
        });
        gameLoop.current = requestAnimationFrame(update);
      };
      gameLoop.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(gameLoop.current);
  }, [gameActive, horsePos]);

  return (
    <div style={gameContainer}>
      <div style={gameHeader}>
        <Link to="/" style={backBtn}>🏠 EXIT</Link>
        <div style={scoreBoard}>🥕 Score: {score}</div>
      </div>

      <div style={gameCanvas} onMouseMove={handleMouseMove}>
        {!gameActive ? (
          <div style={startOverlay}>
            <div style={{ fontSize: '80px' }}>🐴</div>
            <h1 style={{ color: '#5D4037' }}>Carrot Catch!</h1>
            <button onClick={() => setGameActive(true)} style={playBtn}>PLAY GAME</button>
          </div>
        ) : (
          <>
            {/* The Falling Carrot */}
            <div style={carrotStyle(carrotPos.x, carrotPos.y)}>🥕</div>
            
            {/* The Player Horse */}
            <div style={horseStyle(horsePos)}>🐴</div>
          </>
        )}
      </div>
      
      <div style={footerText}>Move your mouse to catch the carrots!</div>
    </div>
  );
}

// --- STYLES ---
const gameContainer = { backgroundColor: '#E3F2FD', height: '100vh', display: 'flex', flexDirection: 'column' };
const gameHeader = { padding: '20px', display: 'flex', justifyContent: 'space-between', background: 'white' };
const backBtn = { textDecoration: 'none', background: '#f44336', color: 'white', padding: '10px 20px', borderRadius: '10px' };
const scoreBoard = { fontSize: '24px', fontWeight: 'bold', color: '#FF9800' };
const gameCanvas = { flex: 1, position: 'relative', margin: '20px', backgroundColor: '#C8E6C9', borderRadius: '30px', overflow: 'hidden', cursor: 'none', border: '8px solid white' };
const footerText = { textAlign: 'center', padding: '20px', color: '#2E7D32', fontWeight: 'bold' };

const startOverlay = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' };
const playBtn = { padding: '15px 40px', fontSize: '20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' };

const carrotStyle = (x, y) => ({
  position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: '40px', transition: 'top 0.05s linear'
});

const horseStyle = (x) => ({
  position: 'absolute', left: `${x}%`, bottom: '10%', fontSize: '60px', transform: 'translateX(-50%)'
});

export default GameMode;