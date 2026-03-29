import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Peer from 'peerjs';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const INSTRUMENTS = [
  { id: 'airhorn', label: 'Honk!', emoji: '📢', color: '#F43F5E', shadow: '#9F1239', light: '#FFE4E6' },
  { id: 'drum',    label: 'Boom!', emoji: '🥁', color: '#0EA5E9', shadow: '#0369A1', light: '#E0F2FE' },
  { id: 'guitar',  label: 'Rock!', emoji: '🎸', color: '#F59E0B', shadow: '#B45309', light: '#FEF3C7' },
  { id: 'piano',   label: 'Ding!', emoji: '🎹', color: '#8B5CF6', shadow: '#5B21B6', light: '#EDE9FE' },
];

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function RadioPage() {
  const [gasLevel, setGasLevel]     = useState(0);
  const [status, setStatus]         = useState('Searching...');
  const [pressedId, setPressedId]   = useState(null);
  const [gasPressed, setGasPressed] = useState(null); // 'pump' | 'poof'
  const [fartFlash, setFartFlash]   = useState(false);
  const [noteFlash, setNoteFlash]   = useState(null); // instrument id

  const dataConn  = useRef(null);
  const bgMusicRef = useRef(null);

  // ── PeerJS ──
  useEffect(() => {
    const peer = new Peer('roady-dj-deck', { host: 'localhost', port: 5000, path: '/peerjs' });
    peer.on('open', () => {
      setStatus('Connecting... 📡');
      const conn = peer.connect('roady-pony-device');
      conn.on('open', () => {
        dataConn.current = conn;
        setStatus('Online! 🐴');
      });
      conn.on('error', () => setStatus('Retry... ⚠️'));
    });
    peer.on('error', () => setStatus('Searching... 📡'));
    return () => peer.destroy();
  }, []);

  // ── Audio ducking ──
  const playSoundWithDucking = (soundPath) => {
    if (bgMusicRef.current) bgMusicRef.current.volume = 0.2;
    const sfx = new Audio(soundPath);
    sfx.onended = () => { if (bgMusicRef.current) bgMusicRef.current.volume = 1.0; };
    sfx.play().catch(e => console.error('Sound missing:', soundPath, e));
  };

  // ── Send command ──
  const sendCommand = (type, id) => {
    const fileName = type === 'FART' ? 'fart.mp3' : `${id}.mp3`;
    if (dataConn.current?.open) dataConn.current.send(JSON.stringify({ type, id }));
    playSoundWithDucking(`/sounds/${fileName}`);
  };

  // ── Gas mechanics ──
  const pumpGas = () => {
    setGasPressed('pump');
    setTimeout(() => setGasPressed(null), 160);
    if (gasLevel < 100) setGasLevel(prev => Math.min(prev + 20, 100));
  };

  const releaseGas = () => {
    if (gasLevel < 100) return;
    setGasPressed('poof');
    setTimeout(() => setGasPressed(null), 160);
    setFartFlash(true);
    setTimeout(() => setFartFlash(false), 600);
    sendCommand('FART', 'fart');
    setGasLevel(0);
  };

  // ── Instrument press ──
  const handleInstrument = (ins) => {
    setPressedId(ins.id);
    setNoteFlash(ins.id);
    setTimeout(() => setPressedId(null), 160);
    setTimeout(() => setNoteFlash(null), 500);
    sendCommand('INSTRUMENT', ins.id);
  };

  const isOnline  = status === 'Online! 🐴';
  const tankFull  = gasLevel >= 100;
  const tankColor = tankFull ? '#22C55E' : gasLevel > 50 ? '#F59E0B' : '#EF4444';
  const tankShadow = tankFull ? '#15803D' : gasLevel > 50 ? '#B45309' : '#991B1B';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rp-root {
          --font-head: 'Fredoka One', cursive;
          --font-body: 'Nunito', sans-serif;
          min-height: 100vh;
          width: 100vw;
          background: #FFFBEB;
          display: flex;
          flex-direction: column;
          font-family: var(--font-body);
          overflow: hidden;
        }

        /* ── HEADER ── */
        .rp-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: #fff;
          border-bottom: 3px solid #FEF3C7;
          border-radius: 0 0 28px 28px;
          box-shadow: 0 4px 0 #FDE68A;
          z-index: 10;
          flex-shrink: 0;
        }
        .rp-home-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 50px;
          background: #1D4ED8;
          color: #fff;
          font-family: var(--font-head);
          font-size: 17px;
          text-decoration: none;
          box-shadow: 0 5px 0 #1E3A8A;
          transition: transform .1s, box-shadow .1s;
          flex-shrink: 0;
        }
        .rp-home-btn:active { transform: translateY(5px); box-shadow: 0 0 0 #1E3A8A; }
        .rp-header-title {
          flex: 1;
          text-align: center;
          font-family: var(--font-head);
          font-size: 28px;
          color: #78350F;
          letter-spacing: .5px;
        }
        .rp-status-pill {
          padding: 8px 16px;
          border-radius: 50px;
          font-family: var(--font-head);
          font-size: 15px;
          color: #fff;
          flex-shrink: 0;
          transition: background .3s, box-shadow .3s;
        }

        /* ── MAIN ── */
        .rp-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 18px 28px;
          gap: 20px;
          min-height: 0;
          overflow-y: auto;
        }
        .rp-inner {
          width: 100%;
          max-width: 820px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
        }

        /* ── GAS TANK CARD ── */
        .rp-card {
          background: #fff;
          border-radius: 32px;
          padding: 22px 24px;
          border: 4px solid #DDD6FE;
          box-shadow: 0 8px 0 #C4B5FD;
        }
        .rp-card-title {
          font-family: var(--font-head);
          font-size: 22px;
          color: #5B21B6;
          margin-bottom: 14px;
        }

        /* progress bar track */
        .rp-track {
          width: 100%;
          height: 42px;
          background: #F3F4F6;
          border-radius: 50px;
          padding: 5px;
          border: 3px solid #E5E7EB;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }
        .rp-fill {
          height: 100%;
          border-radius: 50px;
          transition: width .35s cubic-bezier(.175,.885,.32,1.275), background .4s;
        }
        .rp-tank-label {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-head);
          font-size: 16px;
          color: #374151;
          pointer-events: none;
        }

        /* gas buttons */
        .rp-gas-row {
          display: flex;
          gap: 14px;
        }
        .rp-gas-btn {
          flex: 1;
          padding: 16px;
          border-radius: 50px;
          border: none;
          font-family: var(--font-head);
          font-size: 22px;
          color: #fff;
          cursor: pointer;
          transition: transform .1s, box-shadow .1s;
        }
        .rp-gas-btn.pressed { transform: translateY(6px) !important; box-shadow: 0 0 0 transparent !important; }
        .rp-gas-btn:disabled { opacity: .45; cursor: not-allowed; }

        /* fart flash overlay */
        .rp-fart-flash {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: rp-flash .55s ease-out forwards;
        }
        @keyframes rp-flash {
          0%   { background: rgba(134,239,172,.5); }
          100% { background: rgba(134,239,172,0); }
        }
        .rp-fart-emoji {
          font-size: 120px;
          animation: rp-fart-pop .55s cubic-bezier(.34,1.56,.64,1) forwards;
        }
        @keyframes rp-fart-pop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          50%  { transform: scale(1.3) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg);   opacity: 0; }
        }

        /* ── INSTRUMENT SECTION ── */
        .rp-section-title {
          font-family: var(--font-head);
          font-size: 22px;
          color: #78350F;
        }
        .rp-instrument-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          flex: 1;
        }
        .rp-ins-btn {
          border: none;
          border-radius: 36px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 24px 16px;
          transition: transform .12s cubic-bezier(.34,1.56,.64,1), box-shadow .12s;
          position: relative;
          overflow: hidden;
          min-height: 130px;
        }
        .rp-ins-btn:hover  { transform: translateY(-4px) scale(1.03); }
        .rp-ins-btn.pressed { transform: translateY(8px) scale(.96) !important; box-shadow: 0 0 0 transparent !important; }

        .rp-ins-emoji {
          font-size: 52px;
          line-height: 1;
          transition: transform .12s;
        }
        .rp-ins-btn.pressed .rp-ins-emoji { transform: scale(.85); }

        .rp-ins-label {
          font-family: var(--font-head);
          font-size: 22px;
          color: #fff;
        }

        /* note burst */
        .rp-note-burst {
          position: absolute;
          top: 8px; right: 10px;
          font-size: 22px;
          animation: rp-note-up .5s ease-out forwards;
          pointer-events: none;
        }
        @keyframes rp-note-up {
          0%   { transform: translateY(0) scale(.6); opacity: 1; }
          100% { transform: translateY(-36px) scale(1.2); opacity: 0; }
        }
      `}</style>

      {/* FART FLASH */}
      {fartFlash && (
        <div className="rp-fart-flash">
          <span className="rp-fart-emoji">💨</span>
        </div>
      )}

      <div className="rp-root">

        {/* HEADER */}
        <header className="rp-header">
          <Link to="/" className="rp-home-btn">🏠 Home</Link>
          <h1 className="rp-header-title">DJ Horn Deck 🎶</h1>
          <div
            className="rp-status-pill"
            style={{
              background: isOnline ? '#22C55E' : '#EF4444',
              boxShadow: `0 4px 0 ${isOnline ? '#15803D' : '#991B1B'}`,
            }}
          >
            {isOnline ? 'Linked 🐴' : 'Searching'}
          </div>
        </header>

        {/* MAIN */}
        <main className="rp-main">
          <div className="rp-inner">

            {/* GAS TANK */}
            <div className="rp-card">
              <div className="rp-card-title">💨 Pump the Gas!</div>

              {/* progress track */}
              <div className="rp-track">
                <div
                  className="rp-fill"
                  style={{
                    width: `${gasLevel}%`,
                    background: tankColor,
                  }}
                />
                <span className="rp-tank-label">
                  {tankFull ? '🔥 FULL!' : `${gasLevel}%`}
                </span>
              </div>

              {/* pump / poof buttons */}
              <div className="rp-gas-row">
                <button
                  className={`rp-gas-btn${gasPressed === 'pump' ? ' pressed' : ''}`}
                  style={{
                    background: '#F59E0B',
                    boxShadow: '0 7px 0 #B45309',
                  }}
                  onClick={pumpGas}
                >
                  ⛽ Pump!
                </button>
                <button
                  className={`rp-gas-btn${gasPressed === 'poof' ? ' pressed' : ''}`}
                  style={{
                    background: tankFull ? '#22C55E' : '#9CA3AF',
                    boxShadow: `0 7px 0 ${tankFull ? '#15803D' : '#6B7280'}`,
                  }}
                  onClick={releaseGas}
                  disabled={!tankFull}
                >
                  💨 Poof!
                </button>
              </div>
            </div>

            {/* INSTRUMENT GRID */}
            <div className="rp-section-title">🎵 Play a Sound!</div>

            <div className="rp-instrument-grid">
              {INSTRUMENTS.map(ins => (
                <button
                  key={ins.id}
                  className={`rp-ins-btn${pressedId === ins.id ? ' pressed' : ''}`}
                  style={{
                    background: ins.color,
                    boxShadow: `0 9px 0 ${ins.shadow}`,
                  }}
                  onClick={() => handleInstrument(ins)}
                >
                  {/* floating note burst on press */}
                  {noteFlash === ins.id && (
                    <span key={Date.now()} className="rp-note-burst">🎵</span>
                  )}
                  <span className="rp-ins-emoji">{ins.emoji}</span>
                  <span className="rp-ins-label">{ins.label}</span>
                </button>
              ))}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}