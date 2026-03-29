import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


// --- THEME CONSTANTS ---
const ROADY_THEME = {
 bg: '#FFF6E0',
 textMain: '#5C3317',
 textSub: '#9B5E28',
 fontPrimary: "'Fredoka One', 'Nunito', sans-serif",
 dotColors: ['#FF8A80', '#FFCA28', '#69F0AE', '#80D8FF', '#B388FF', '#FF80AB', '#CCF9B0', '#FFAB40'],
 gameColors: {
   carrot: { bg: '#F0FFF4', ring: '#2E7D32', shadow: '#81C784', text: '#1B5E20' },
   hop: { bg: '#EEF6FF', ring: '#1565C0', shadow: '#64B5F6', text: '#0D47A1' },
   match: { bg: '#F5F0FF', ring: '#7B1FA2', shadow: '#BA68C8', text: '#4A148C' }
 }
};


// ── FULL SCREEN FALLING DOTS ──────────────────────────────────────────────
const FallingDotsBackground = () => {
 const [dots, setDots] = useState([]);
 useEffect(() => {
   const newDots = Array.from({ length: 30 }, (_, i) => ({
     id: i,
     left: `${Math.random() * 100}%`,
     size: Math.random() * 20 + 10,
     color: ROADY_THEME.dotColors[i % ROADY_THEME.dotColors.length],
     delay: `${Math.random() * 8}s`,
     duration: `${7 + Math.random() * 5}s`,
   }));
   setDots(newDots);
 }, []);


 return (
   <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
     {dots.map(dot => (
       <div key={dot.id} className="falling-dot" style={{
           position: 'absolute', top: '-30px', left: dot.left, width: dot.size, height: dot.size,
           backgroundColor: dot.color, borderRadius: '50%', opacity: 0.35,
           animation: `fall ${dot.duration} linear infinite ${dot.delay}`
       }} />
     ))}
   </div>
 );
};


// ── GAME 1: Carrot Catch ─────────────────────────────────────────────────────
function CarrotCatch() {
 const [score, setScore] = useState(0);
 const [gameActive, setGameActive] = useState(false);
 const [gameOver, setGameOver] = useState(false);
 const horseX = useRef(50);
 const horseTargetX = useRef(50);
 const [, setRender] = useState(0);
 const [carrot, setCarrot] = useState({ x: Math.random() * 80 + 10, y: -10, rotation: 0 });
 const gameLoop = useRef();


 const handleStartOrRetry = () => {
   setScore(0); setGameOver(false); setGameActive(true);
   setCarrot({ x: Math.random() * 80 + 10, y: -10, rotation: 0 });
 };


 const handleMove = (e) => {
   if (!gameActive) return;
   const rect = e.currentTarget.getBoundingClientRect();
   horseTargetX.current = ((e.clientX - rect.left) / rect.width) * 100;
 };


 useEffect(() => {
   if (!gameActive || gameOver) return;
   const frame = () => {
     horseX.current += (horseTargetX.current - horseX.current) * 0.2;
     setCarrot(prev => {
       let nextY = prev.y + (2 + score * 0.05);
       if (nextY > 75 && nextY < 88 && Math.abs(prev.x - horseX.current) < 10) {
         setScore(s => s + 1);
         return { x: Math.random() * 80 + 10, y: -10, rotation: 0 };
       }
       if (nextY > 105) { setGameOver(true); setGameActive(false); return prev; }
       return { ...prev, y: nextY, rotation: prev.rotation + 2 };
     });
     setRender(r => r + 1);
     gameLoop.current = requestAnimationFrame(frame);
   };
   gameLoop.current = requestAnimationFrame(frame);
   return () => cancelAnimationFrame(gameLoop.current);
 }, [gameActive, gameOver, score]);


 return (
   <div className="game-container" style={{ background: ROADY_THEME.gameColors.carrot.bg, boxShadow: `0 12px 0 ${ROADY_THEME.gameColors.carrot.shadow}, 0 0 0 6px ${ROADY_THEME.gameColors.carrot.ring}` }}>
     <div className="game-header">
       <div className="stat-pill" style={{ background: ROADY_THEME.gameColors.carrot.shadow, color: ROADY_THEME.gameColors.carrot.text }}>🥕 {score}</div>
       <h2 style={{ color: ROADY_THEME.gameColors.carrot.text }}>Carrot Catch</h2>
     </div>
     <div onMouseMove={handleMove} className="game-viewport" style={{ background: 'linear-gradient(#E3F2FD, #BBDEFB)' }}>
       <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '15%', background: '#8BC34A' }} />
       {!gameActive && (
         <div className="game-overlay">
           <h1>{gameOver ? "OH NO!" : "READY?"}</h1>
           <button className="play-btn" onClick={handleStartOrRetry}>{gameOver ? "RETRY" : "START"}</button>
         </div>
       )}
       {gameActive && (
         <>
           <div style={{ position:'absolute', left:`${carrot.x}%`, top:`${carrot.y}%`, fontSize:'60px', transform:'translateX(-50%)' }}>🥕</div>
           <div style={{ position:'absolute', left:`${horseX.current}%`, bottom:'10%', fontSize:'90px', transform:'translateX(-50%) scaleX(-1)' }}>🐴</div>
         </>
       )}
     </div>
   </div>
 );
}


// ── GAME 2: Horsey Hop ────────────────────────────────────────────────────────
function HorseyHop() {
 const [y, setY] = useState(0);
 const [obsX, setObsX] = useState(100);
 const [score, setScore] = useState(0);
 const [gameOver, setGameOver] = useState(false);
 const [gameActive, setGameActive] = useState(false);
 const gameLoop = useRef();


 const jump = () => { if (y === 0 && gameActive) { setY(150); setTimeout(() => setY(0), 500); } };


 useEffect(() => {
   if (!gameActive || gameOver) return;
   const frame = () => {
     setObsX(prev => {
       let next = prev - (1.5 + score * 0.05);
       if (next < -10) { setScore(s => s + 1); return 110; }
       if (next > 15 && next < 25 && y < 50) { setGameOver(true); setGameActive(false); }
       return next;
     });
     gameLoop.current = requestAnimationFrame(frame);
   };
   gameLoop.current = requestAnimationFrame(frame);
   return () => cancelAnimationFrame(gameLoop.current);
 }, [gameActive, gameOver, score, y]);


 return (
   <div className="game-container" onClick={jump} style={{ background: ROADY_THEME.gameColors.hop.bg, boxShadow: `0 12px 0 ${ROADY_THEME.gameColors.hop.shadow}, 0 0 0 6px ${ROADY_THEME.gameColors.hop.ring}` }}>
     <div className="game-header">
       <div className="stat-pill" style={{ background: ROADY_THEME.gameColors.hop.shadow, color: ROADY_THEME.gameColors.hop.text }}>⭐ {score}</div>
       <h2 style={{ color: ROADY_THEME.gameColors.hop.text }}>Horsey Hop</h2>
     </div>
     <div className="game-viewport" style={{ background: 'linear-gradient(#1A237E, #3F51B5)' }}>
       <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '15%', background: '#7CB342' }} />
       {!gameActive && (
         <div className="game-overlay">
           <h1>{gameOver ? "BUMP!" : "READY?"}</h1>
           <button className="play-btn" style={{ background: '#1E88E5' }} onClick={(e) => { e.stopPropagation(); setScore(0); setObsX(100); setGameOver(false); setGameActive(true); }}>{gameOver ? "RETRY" : "PLAY"}</button>
         </div>
       )}
       <div style={{ position:'absolute', left:'20%', bottom: `calc(15% + ${y}px)`, fontSize:'80px', transform: 'scaleX(-1)', transition:'bottom 0.25s ease-out' }}>🐎</div>
       <div style={{ position:'absolute', left:`${obsX}%`, bottom:'15%', fontSize:'50px' }}>🌵</div>
     </div>
   </div>
 );
}


// ── GAME 3: Memory Match ──────────────────────────────────────────────────────
function MemoryMatch() {
 const emojis = ['🍎', '🥕', '🐴', '🏇', '🏆', '🌾'];
 const [cards, setCards] = useState([]);
 const [flipped, setFlipped] = useState([]);
 const [solved, setSolved] = useState([]);
 const [waiting, setWaiting] = useState(false);


 const initGame = () => {
   const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, e }));
   setCards(deck); setSolved([]); setFlipped([]); setWaiting(false);
 };
 useEffect(() => { initGame(); }, []);


 const click = (id) => {
   if (waiting || flipped.includes(id) || solved.includes(id)) return;
   const nextFlipped = [...flipped, id];
   setFlipped(nextFlipped);
   if (nextFlipped.length === 2) {
     const firstCard = cards[nextFlipped[0]];
     const secondCard = cards[nextFlipped[1]];
     if (firstCard.e === secondCard.e) {
       setSolved(prev => [...prev, firstCard.id, secondCard.id]);
       setFlipped([]);
     } else {
       setWaiting(true);
       setTimeout(() => { setFlipped([]); setWaiting(false); }, 1000);
     }
   }
 };


 return (
   <div className="game-container" style={{ background: ROADY_THEME.gameColors.match.bg, boxShadow: `0 12px 0 ${ROADY_THEME.gameColors.match.shadow}, 0 0 0 6px ${ROADY_THEME.gameColors.match.ring}` }}>
     <div className="game-header"><h2 style={{ color: ROADY_THEME.gameColors.match.text, width: '100%', textAlign: 'center' }}>Horse Memory</h2></div>
     <div className="game-viewport" style={{ background: '#F3E5F5', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', padding: '20px', alignContent: 'center' }}>
       {cards.map(c => {
         const isUp = flipped.includes(c.id) || solved.includes(c.id);
         return (
           <div key={c.id} onClick={() => click(c.id)} style={{ height: '100px', background: isUp ? '#fff' : '#8E24AA', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', cursor: (waiting || isUp) ? 'default' : 'pointer', border: isUp ? '4px solid #fff' : '4px solid #6A1B9A', boxShadow: isUp ? 'none' : '0 6px 0 #4A148C', transition: 'all 0.2s ease' }}>
             {isUp ? c.e : '?'}
           </div>
         );
       })}
     </div>
     <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
         <button className="play-btn" style={{ background: '#8E24AA' }} onClick={initGame}>RESTART</button>
     </div>
   </div>
 );
}


// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function RoadyArcade() {
 const [game, setGame] = useState(null);
 const navigate = useNavigate();


 return (
   <div className="pd-wrap">
     <FallingDotsBackground />
     <style>{`
       @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@900&display=swap');
       .pd-wrap { min-height: 100vh; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; font-family: ${ROADY_THEME.fontPrimary}; position: relative; }
      
       .pd-title { font-size: clamp(40px, 8vw, 64px); color: ${ROADY_THEME.textMain}; text-shadow: 4px 4px 0 #fff, 7px 7px 0 #F8B84E; margin: 10px 0; text-align: center; z-index: 1; }
       .pd-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px; width: 100%; max-width: 1000px; z-index: 1; margin-top: 30px; }
      
       .pd-card {
         border-radius: 35px; padding: 45px 25px; text-align: center; cursor: pointer; position: relative;
         display: flex; flex-direction: column; align-items: center;
         transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
         animation: float 4s ease-in-out infinite; overflow: hidden; border: 8px solid #fff;
         box-shadow: inset 0 10px 20px rgba(0,0,0,0.1), inset 0 -5px 10px rgba(255,255,255,0.5);
       }
       .pd-card:hover { transform: translateY(-8px) scale(1.03); }
       .pd-card:active { transform: translateY(12px); box-shadow: inset 0 5px 10px rgba(0,0,0,0.2) !important; }
       .pd-card .icon { font-size: 85px; margin-bottom: 20px; filter: drop-shadow(0 6px 0 rgba(0,0,0,0.15)); }
       .pd-card .label { font-size: 28px; font-weight: 900; letter-spacing: 1.5px; }


       .game-container { width: 100%; max-width: 1000px; border-radius: 40px; padding: 30px; z-index: 2; position: relative; }
       .game-viewport { height: 500px; border-radius: 30px; border: 6px solid #fff; position: relative; overflow: hidden; }
       .game-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.85); display: flex; flex-direction: column; align-items: center; justifyContent: center; z-index: 10; gap: 15px; }
      
       .play-btn { padding: 15px 50px; font-size: 24px; border-radius: 40px; border: none; background: #43A047; color: #fff; font-family: inherit; cursor: pointer; box-shadow: 0 6px 0 #1B5E20; }
       .back-btn { position: sticky; top: 20px; align-self: flex-start; z-index: 100; padding: 10px 20px; background: #fff; border: 4px solid #F8B84E; border-radius: 20px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 0 #F8B84E; transition: 0.1s; }
       .back-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #F8B84E; }
      
       @keyframes fall { from { transform: translateY(-50px); } to { transform: translateY(110vh); } }
       @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
     `}</style>


     {game ? (
       <>
         <button className="back-btn" onClick={() => setGame(null)}>← ARCADE MENU</button>
         {game === 1 && <CarrotCatch />}
         {game === 2 && <HorseyHop />}
         {game === 3 && <MemoryMatch />}
       </>
     ) : (
       <>
         <button className="back-btn" onClick={() => navigate('/')}>← HOME 🏠</button>
         <h1 className="pd-title">🐴 ROADY ARCADE</h1>
         <p style={{ color: ROADY_THEME.textSub, marginBottom: '20px', zIndex: 1, fontWeight: '900' }}>PICK AN ADVENTURE!</p>
         <div className="pd-grid">
           <div onClick={() => setGame(1)} className="pd-card" style={{ background: ROADY_THEME.gameColors.carrot.bg, boxShadow: `0 20px 0 ${ROADY_THEME.gameColors.carrot.ring}` }}>
             <div className="icon">🎮</div>
             <div className="label" style={{ color: ROADY_THEME.gameColors.carrot.text }}>CARROT CATCH</div>
           </div>
           <div onClick={() => setGame(2)} className="pd-card" style={{ background: ROADY_THEME.gameColors.hop.bg, boxShadow: `0 20px 0 ${ROADY_THEME.gameColors.hop.ring}` }}>
             <div className="icon" style={{ transform: 'scaleX(-1)' }}>🐎</div>
             <div className="label" style={{ color: ROADY_THEME.gameColors.hop.text }}>HORSEY HOP</div>
           </div>
           <div onClick={() => setGame(3)} className="pd-card" style={{ background: ROADY_THEME.gameColors.match.bg, boxShadow: `0 20px 0 ${ROADY_THEME.gameColors.match.ring}` }}>
             <div className="icon">🧩</div>
             <div className="label" style={{ color: ROADY_THEME.gameColors.match.text }}>MEMORY MATCH</div>
           </div>
         </div>
       </>
     )}
   </div>
 );
}
