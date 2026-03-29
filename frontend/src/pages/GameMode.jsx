import React, { useState, useEffect, useRef } from 'react';

// ── GAME 1: Carrot Catch ─────────────────────────────────────────────────────
function CarrotCatch() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem('horseHighScore') || 0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState(false);
  
  const horseX = useRef(50);
  const horseTargetX = useRef(50);
  const [, setRender] = useState(0);
  const [carrot, setCarrot] = useState({ x: Math.random() * 80 + 10, y: -10, rotation: 0 });
  const gameLoop = useRef();

  const getSkyColor = () => {
    if (score < 10) return 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)';
    if (score < 20) return 'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)';
    return 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
  };

  const handleMove = (e) => {
    if (!gameActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    horseTargetX.current = Math.max(5, Math.min(95, x)); // Wider movement range
  };

  const startGame = () => {
    setScore(0); 
    setGameOver(false); 
    setGameActive(true);
    setCarrot({ x: Math.random() * 80 + 10, y: -10, rotation: 0 });
  };

  useEffect(() => {
    if (!gameActive || gameOver) return;
    
    const frame = () => {
      // Smooth movement tracking
      horseX.current += (horseTargetX.current - horseX.current) * 0.25;

      setCarrot((prev) => {
        const speed = 1.8 + (score * 0.08);
        let nextY = prev.y + speed;
        let nextRotation = prev.rotation + 2;

        // Hit detection tuned for wider screen
        const hit = nextY > 75 && nextY < 88 && Math.abs(prev.x - horseX.current) < 8;

        if (hit) { 
          setScore((s) => s + 1);
          setFlash(true);
          setTimeout(() => setFlash(false), 100);
          return { x: Math.random() * 80 + 10, y: -10, rotation: 0 }; 
        }

        if (nextY > 105) { 
          setGameOver(true); 
          setGameActive(false); 
          return prev; 
        }
        return { ...prev, y: nextY, rotation: nextRotation };
      });

      setRender((r) => r + 1);
      gameLoop.current = requestAnimationFrame(frame);
    };

    gameLoop.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(gameLoop.current);
  }, [gameActive, gameOver, score]);

  useEffect(() => {
    if (score > highScore) { 
      setHighScore(score); 
      localStorage.setItem('horseHighScore', score); 
    }
  }, [score, highScore]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      paddingTop: '100px', 
      minHeight: '100vh',
      background: '#1a1a2e',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      
      {/* WIDER Game Window */}
      <div className="gm-window" style={{
        width: '100%',
        maxWidth: '800px', // Increased from 500px to 800px
        background: '#222',
        borderRadius: '30px',
        padding: '20px',
        border: '6px solid #333',
        boxShadow: '0 25px 70px rgba(0,0,0,0.9)',
        position: 'relative'
      }}>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '20px',
          padding: '0 15px'
        }}>
          <div style={{ 
            background: '#ff6b00', 
            color: '#fff', 
            padding: '8px 25px', 
            borderRadius: '16px',
            fontSize: '1.4rem',
            fontWeight: 'bold',
            boxShadow: '0 5px 0 #b34b00'
          }}>
            🥕 {score}
          </div>
          <div style={{ 
            color: '#fff', 
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 15px',
            borderRadius: '12px',
            fontSize: '1rem', 
            alignSelf: 'center' 
          }}>
            🏆 BEST: {highScore}
          </div>
        </div>

        <div 
          className="gm-canvas" 
          onMouseMove={handleMove}
          style={{ 
            background: getSkyColor(),
            height: '450px', // Taller canvas for the wider look
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'none',
            border: '4px solid #111',
            transition: 'background 0.5s ease'
          }}
        >
          {flash && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', zIndex: 20 }} />}

          {/* Grass Floor */}
          <div style={{
            position: 'absolute',
            bottom: 0, width: '100%', height: '12%',
            background: 'linear-gradient(to top, #2d5a27, #5bab4e)',
            zIndex: 2
          }} />

          {!gameActive && (
            <div className="gm-overlay" style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', textAlign: 'center'
            }}>
              <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', color: '#ff6b00', textShadow: '0 0 20px rgba(255,107,0,0.4)' }}>
                {gameOver ? "GAME OVER" : "CARROT CATCH"}
              </h1>
              {gameOver && <p style={{ fontSize: '1.5rem', marginBottom: '30px', opacity: 0.9 }}>Final Score: {score}</p>}
              <button onClick={startGame} style={{
                padding: '18px 50px', fontSize: '1.4rem', borderRadius: '60px',
                border: 'none', background: '#ff6b00', color: '#fff', cursor: 'pointer',
                boxShadow: '0 6px 0 #b34b00', fontWeight: '900', letterSpacing: '1px',
                transition: 'transform 0.1s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {gameOver ? "RETRY 🔄" : "PLAY NOW 🐎"}
              </button>
            </div>
          )}
          
          {gameActive && (
            <>
              <div style={{ 
                position:'absolute', left:`${carrot.x}%`, top:`${carrot.y}%`, 
                fontSize:'55px', transform:`translateX(-50%) rotate(${carrot.rotation}deg)`, 
                zIndex:5, filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.4))'
              }}>🥕</div>

              <div style={{ 
                position:'absolute', left:`${horseX.current}%`, bottom:'7%', 
                fontSize:'90px', transform:'translateX(-50%)', 
                zIndex:6, filter: 'drop-shadow(0 12px 15px rgba(0,0,0,0.5))'
              }}>🐴</div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0 5px', color: '#888', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
          GALLOP LEFT & RIGHT TO CATCH THE CARROTS!
        </div>
      </div>
    </div>
  );
}

// ── GAME 2: Horsey Hop ────────────────────────────────────────────────────────
function HorseyHop() {
  const [horseY, setHorseY] = useState(0);
  const [fenceX, setFenceX] = useState(100); // Changed to % for the wider window
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem('horseyHopBest') || 0);
  
  const horseYRef = useRef(0);
  const isJumpingRef = useRef(false);
  const gameOverRef = useRef(false);
  const gameLoop = useRef();

  const jump = () => {
    if (!isJumpingRef.current && !gameOverRef.current) {
      isJumpingRef.current = true;
      horseYRef.current = 150; // Jump height in pixels
      setHorseY(150);
      
      // Gravity / Fall down
      setTimeout(() => { 
        horseYRef.current = 0; 
        setHorseY(0); 
        isJumpingRef.current = false; 
      }, 600);
    }
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.code === 'Space') jump(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const frame = () => {
      if (gameOverRef.current) return;

      setFenceX((prev) => {
        const speed = 1.2 + (score * 0.005); // Slowly speeds up
        let nextX = prev - speed;

        if (nextX < -10) {
          setScore((s) => s + 1);
          return 110; // Reset to right side
        }

        // Collision Logic: If fence is at horse's X (approx 15-25%) and horse is low
        if (nextX > 15 && nextX < 25 && horseYRef.current < 60) {
          gameOverRef.current = true;
          setGameOver(true);
        }
        return nextX;
      });

      gameLoop.current = requestAnimationFrame(frame);
    };

    gameLoop.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(gameLoop.current);
  }, [gameOver, score]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('horseyHopBest', score);
    }
  }, [score, highScore]);

  const restartGame = () => {
    horseYRef.current = 0;
    isJumpingRef.current = false;
    gameOverRef.current = false;
    setHorseY(0);
    setFenceX(100);
    setGameOver(false);
    setScore(0);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      paddingTop: '100px', 
      minHeight: '100vh',
      background: '#1a1a2e',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      
      {/* Arcade Window (Wider Design) */}
      <div className="gm-window" style={{
        width: '100%',
        maxWidth: '800px',
        background: '#222',
        borderRadius: '30px',
        padding: '20px',
        border: '6px solid #333',
        boxShadow: '0 25px 70px rgba(0,0,0,0.9)',
        position: 'relative'
      }}>
        
        {/* Stats Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '20px',
          padding: '0 15px'
        }}>
          <div style={{ 
            background: '#00b4d8', 
            color: '#fff', 
            padding: '8px 25px', 
            borderRadius: '16px',
            fontSize: '1.4rem',
            fontWeight: 'bold',
            boxShadow: '0 5px 0 #0077b6'
          }}>
            ⭐ {score}
          </div>
          <div style={{ 
            color: '#fff', 
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 15px',
            borderRadius: '12px',
            fontSize: '1rem', 
            alignSelf: 'center' 
          }}>
            🏆 BEST: {highScore}
          </div>
        </div>

        {/* Viewport/Canvas */}
        <div 
          className="gm-canvas" 
          onClick={jump}
          style={{ 
            background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 100%)',
            height: '400px',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            border: '4px solid #111',
            cursor: 'pointer'
          }}
        >
          {/* Animated Stars */}
          {[...Array(15)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '3px', height: '3px',
              background: '#fff',
              borderRadius: '50%',
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.5
            }} />
          ))}

          {/* Grass Floor */}
          <div style={{
            position: 'absolute',
            bottom: 0, width: '100%', height: '15%',
            background: 'linear-gradient(to top, #2d5a27, #5bab4e)',
            zIndex: 2,
            borderTop: '4px solid #fff'
          }} />

          {/* The Horse (with smooth CSS jump) */}
          <div style={{ 
            position:'absolute', 
            left:'20%', 
            bottom: `calc(12% + ${horseY}px)`, 
            fontSize:'80px', 
            transform:'translateX(-50%) scaleX(-1)', 
            zIndex:6, 
            filter: 'drop-shadow(0 12px 15px rgba(0,0,0,0.5))',
            transition: 'bottom 0.35s cubic-bezier(0.1, 0.4, 0.4, 1)' 
          }}>🐎</div>

          {/* The Cactus */}
          <div style={{ 
            position:'absolute', 
            left:`${fenceX}%`, 
            bottom:'12%', 
            fontSize:'50px', 
            zIndex:5, 
            filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.4))'
          }}>🌵</div>

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="gm-overlay" style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', textAlign: 'center'
            }}>
              <h1 style={{ fontSize: '3rem', color: '#ff4d4d' }}>💥 CRASHED!</h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>You jumped {score} hurdles!</p>
              <button onClick={(e) => { e.stopPropagation(); restartGame(); }} style={{
                padding: '15px 45px', fontSize: '1.2rem', borderRadius: '50px',
                border: 'none', background: '#00b4d8', color: '#fff', cursor: 'pointer',
                boxShadow: '0 6px 0 #0077b6', fontWeight: 'bold'
              }}>
                PLAY AGAIN 🔄
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0 5px', color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>
          TAP SCREEN OR PRESS SPACE TO JUMP!
        </div>
      </div>
    </div>
  );
}

// ── GAME 3: Memory Match ──────────────────────────────────────────────────────
const EMOJIS = ['🐎','🐴','🥕','🍎','🚧','🏆','🏇','🌾'];

function MemoryMatch() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const deck = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5).map((emoji, index) => ({ id: index, emoji }));
    setCards(deck); setSolved([]); setFlipped([]); setMoves(0);
  };

  useEffect(() => { initializeGame(); }, []);

  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;
    if (flipped.length === 0) { setFlipped([id]); return; }
    if (flipped.length === 1) {
      setDisabled(true); setFlipped([...flipped, id]); setMoves(moves + 1);
      const firstId = flipped[0];
      if (cards[firstId].emoji === cards[id].emoji) {
        setSolved([...solved, firstId, id]); setFlipped([]); setDisabled(false);
      } else {
        setTimeout(() => { setFlipped([]); setDisabled(false); }, 1000);
      }
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#1a1a2e,#0f3460)', padding:'20px', fontFamily:"'Fredoka One', cursive", textAlign:'center' }}>
      <h1 style={{ color:'#ff6b00', textShadow:'3px 3px 0 #000', fontSize:'2rem', letterSpacing:'2px' }}>🐎 HORSE MATCH</h1>
      <div style={{ background:'#ff6b00', border:'4px solid #000', borderRadius:'20px', display:'inline-block', padding:'4px 20px', marginBottom:'20px', color:'#fff', boxShadow:'0 4px 0 #000' }}>
        Moves: {moves} | Pairs: {solved.length/2}/{EMOJIS.length}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 80px)', gap:'12px', justifyContent:'center' }}>
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
          return (
            <div key={card.id} onClick={() => handleClick(card.id)} style={{
              width:'80px', height:'100px',
              background: isFlipped ? '#16213e' : '#ff6b00',
              border: isFlipped ? '3px solid #ff6b00' : '3px solid #000',
              borderRadius:'12px',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'40px', cursor:'pointer',
              boxShadow: isFlipped ? '0 4px 0 #0a0a1a' : '0 4px 0 #000',
              transition:'transform 0.2s',
              transform: isFlipped ? 'scale(1.05)' : 'scale(1)'
            }}>
              {isFlipped ? card.emoji : '❓'}
            </div>
          );
        })}
      </div>
      {solved.length === cards.length && cards.length > 0 && (
        <div style={{ marginTop:'30px' }}>
          <h2 style={{ color:'#ff6b00' }}>🎉 YOU WIN! {moves} moves!</h2>
          <button onClick={initializeGame} style={{ padding:'12px 36px', fontSize:'1.2rem', borderRadius:'20px', border:'4px solid #000', background:'linear-gradient(135deg,#ff9500,#ff6b00)', color:'white', cursor:'pointer', fontFamily:"'Fredoka One',cursive", boxShadow:'0 5px 0 #000' }}>Play Again! 🎮</button>
        </div>
      )}
    </div>
  );
}

// ── GAME SELECT DASHBOARD ─────────────────────────────────────────────────────
export default function GameMode() {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === 1) return (
    <div>
      <button onClick={() => setActiveGame(null)} style={{ position:'fixed', top:16, left:16, zIndex:999, background:'#ff6b00', color:'white', border:'4px solid #000', borderRadius:'14px', padding:'8px 18px', fontFamily:"'Fredoka One',cursive", fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 0 #000' }}>← BACK</button>
      <CarrotCatch />
    </div>
  );

  if (activeGame === 2) return (
    <div>
      <button onClick={() => setActiveGame(null)} style={{ position:'fixed', top:16, left:16, zIndex:999, background:'#ff6b00', color:'white', border:'4px solid #000', borderRadius:'14px', padding:'8px 18px', fontFamily:"'Fredoka One',cursive", fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 0 #000' }}>← BACK</button>
      <HorseyHop />
    </div>
  );

  if (activeGame === 3) return (
    <div>
      <button onClick={() => setActiveGame(null)} style={{ position:'fixed', top:16, left:16, zIndex:999, background:'#ff6b00', color:'white', border:'4px solid #000', borderRadius:'14px', padding:'8px 18px', fontFamily:"'Fredoka One',cursive", fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 0 #000' }}>← BACK</button>
      <MemoryMatch />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');
        .gm-wrapper { height:100vh; display:flex; flex-direction:column; background:linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%); font-family:'Fredoka One',cursive; }
        .gm-header { padding:14px 20px; display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.4); border-bottom:3px solid #ff6b00; }
        .gm-exit { background:#ff6b00; color:white; padding:8px 18px; border-radius:14px; text-decoration:none; font-size:1rem; border:3px solid #000; box-shadow:0 4px 0 #000; font-family:'Fredoka One',cursive; cursor:pointer; }
        .gm-stats { text-align:right; }
        .gm-score { font-size:1.4rem; color:#ff6b00; text-shadow:1px 1px 0 #000; }
        .gm-best { font-size:0.9rem; color:#aaa; }
        .gm-canvas { flex:1; margin:16px; background:linear-gradient(180deg,#0f3460 0%,#16213e 60%,#1a472a 100%); border-radius:30px; position:relative; overflow:hidden; cursor:none; border:4px solid #ff6b00; box-shadow:0 0 30px rgba(255,107,0,0.3); }
        .gm-canvas::after { content:''; position:absolute; bottom:0; left:0; right:0; height:18%; background:linear-gradient(180deg,#4CAF50,#2E7D32); border-radius:0 0 26px 26px; }
        .gm-overlay { position:absolute; inset:0; background:rgba(10,5,30,0.88); display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:26px; z-index:10; }
        .gm-overlay h1 { font-size:2.4rem; color:#ff6b00; text-shadow:3px 3px 0 #000,5px 5px 0 #7a3000; margin-bottom:8px; letter-spacing:2px; }
        .gm-overlay p { color:#ccc; font-family:'Nunito',sans-serif; font-size:1rem; margin-bottom:24px; text-align:center; padding: 0 20px; }
        .gm-play-btn { padding:14px 44px; font-size:1.4rem; border-radius:20px; border:4px solid #000; background:linear-gradient(135deg,#ff9500,#ff6b00); color:white; cursor:pointer; font-family:'Fredoka One',cursive; box-shadow:0 6px 0 #000; letter-spacing:2px; transition:transform 0.1s; }
        .gm-play-btn:active { transform:translateY(3px); box-shadow:0 2px 0 #000; }
        .gm-footer { text-align:center; padding:10px; color:rgba(255,255,255,0.5); font-size:0.9rem; font-family:'Nunito',sans-serif; }
        .game-wrapper { height:100vh; background:linear-gradient(180deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%); display:flex; flex-direction:column; align-items:center; justify-content:flex-end; overflow:hidden; position:relative; cursor:pointer; font-family:'Fredoka One',cursive; }
        .ground { position:absolute; bottom:0; width:100%; height:410px; background:linear-gradient(180deg,#4CAF50 0%,#388E3C 20%,#2E7D32 100%); border-radius:50% 50% 0 0/20px 20px 0 0; z-index:0; }
        .stars { position:absolute; top:0; left:0; width:100%; height:45%; pointer-events:none; }
        .star { position:absolute; background:white; border-radius:50%; animation:twinkle 2s infinite alternate; }
        @keyframes twinkle { from{opacity:0.3} to{opacity:1} }
        .cloud { position:absolute; font-size:48px; opacity:0.6; animation:floatCloud linear infinite; }
        @keyframes floatCloud { from{transform:translateX(110vw)} to{transform:translateX(-200px)} }
        .title { position:absolute; top:16px; font-size:2.4rem; color:#ff6b00; text-shadow:3px 3px 0 #000,5px 5px 0 #7a3000; z-index:10; letter-spacing:3px; }
        .score-box { position:absolute; top:95px; background:#ff6b00; border:4px solid #000; border-radius:20px; padding:4px 20px; font-size:1.4rem; color:#fff; z-index:10; box-shadow:0 4px 0 #000; }
        .horse { position:absolute; font-size:60px; z-index:5; transform:scaleX(-1); display:inline-block; filter:drop-shadow(2px 4px 4px rgba(0,0,0,0.4)); transition:bottom 0.35s ease-out; }
        .fence { position:absolute; font-size:50px; z-index:5; }
        .hint { position:absolute; bottom:18px; font-size:1rem; color:#fff; z-index:10; opacity:0.8; }
        .gameover-box { position:absolute; top:50%; transform:translateY(-50%); background:#1a1a2e; border:5px solid #ff6b00; border-radius:30px; padding:36px 48px; text-align:center; z-index:20; box-shadow:0 8px 0 #7a3000; }
        .gameover-title { font-size:2.4rem; color:#ff6b00; margin-bottom:8px; }
        .gameover-score { font-size:1.4rem; color:#aaa; margin-bottom:20px; font-family:'Nunito',sans-serif; }
        .restart-btn { background:linear-gradient(135deg,#ff9500,#ff6b00); color:white; border:4px solid #000; border-radius:20px; padding:12px 36px; font-size:1.3rem; font-family:'Fredoka One',cursive; cursor:pointer; box-shadow:0 5px 0 #000; transition:transform 0.1s; }
        .restart-btn:active { transform:translateY(3px); box-shadow:0 2px 0 #000; }
      `}</style>

      {/* DASHBOARD */}
      <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#1a1a2e,#0f3460)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Fredoka One',cursive", padding:'20px' }}>

        {/* stars */}
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{ position:'fixed', width:`${2+Math.random()*3}px`, height:`${2+Math.random()*3}px`, background:'white', borderRadius:'50%', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, opacity: 0.6, pointerEvents:'none' }} />
        ))}

        <h1 style={{ fontSize:'3rem', color:'#ff6b00', textShadow:'4px 4px 0 #000, 6px 6px 0 #7a3000', marginBottom:'8px', letterSpacing:'3px', textAlign:'center' }}>🐴 GAME ARCADE</h1>
        <p style={{ color:'#aaa', fontFamily:"'Nunito',sans-serif", marginBottom:'40px', fontSize:'1rem' }}>Pick a game and play!</p>

        <div style={{ display:'flex', flexDirection:'column', gap:'20px', width:'100%', maxWidth:'360px' }}>
          {[
            { id:1, emoji:'🥕', title:'CARROT CATCH', desc:'Move your mouse to catch carrots!', color:'#ff6b00' },
            { id:2, emoji:'🐴', title:'HORSEY HOP',   desc:'Jump over the cactus!',             color:'#00b4d8' },
            { id:3, emoji:'🧩', title:'HORSE MATCH',  desc:'Find the matching pairs!',           color:'#7b2ff7' },
          ].map(g => (
            <button key={g.id} onClick={() => setActiveGame(g.id)} style={{
              background:`linear-gradient(135deg, ${g.color}cc, ${g.color})`,
              border:'4px solid #000',
              borderRadius:'24px',
              padding:'20px 28px',
              display:'flex', alignItems:'center', gap:'16px',
              cursor:'pointer',
              boxShadow:'0 6px 0 #000',
              transition:'transform 0.1s',
              textAlign:'left',
            }}
            onMouseDown={e => e.currentTarget.style.transform='translateY(4px)'}
            onMouseUp={e => e.currentTarget.style.transform='translateY(0)'}
            >
              <span style={{ fontSize:'3rem' }}>{g.emoji}</span>
              <div>
                <div style={{ color:'#fff', fontSize:'1.4rem', letterSpacing:'2px', textShadow:'2px 2px 0 #000' }}>{g.title}</div>
                <div style={{ color:'rgba(255,255,255,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'0.85rem', marginTop:'2px' }}>{g.desc}</div>
              </div>
              <span style={{ marginLeft:'auto', color:'#fff', fontSize:'1.5rem' }}>▶</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}