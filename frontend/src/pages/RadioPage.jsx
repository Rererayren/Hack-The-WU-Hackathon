import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Peer from 'peerjs';

const INSTRUMENTS = [
  { id: 'trumpet', label: 'HONK!',    emoji: '🎺', color: '#FF70A6', shadow: '#D64D85' },
  { id: 'drums',   label: 'BOOM!',    emoji: '🥁', color: '#70D6FF', shadow: '#4DA9CC' },
  { id: 'guitar',  label: 'ROCK!',    emoji: '🎸', color: '#FF9770', shadow: '#D67554' },
  { id: 'piano',   label: 'DING!',    emoji: '🎹', color: '#A380FF', shadow: '#7F5FCC' },
];

export default function RadioPage() {
  const [gasLevel, setGasLevel] = useState(0);
  const [status, setStatus] = useState('Wait...');
  const dataConn = useRef(null);
  
  // 🎵 Audio Management Refs
  const bgMusicRef = useRef(null); 

  useEffect(() => {
    const peer = new Peer('roady-dj-deck', { host: 'localhost', port: 5000, path: '/peerjs' });
    peer.on('open', () => {
      setStatus('Ready! ✅');
      const conn = peer.connect('roady-pony-device');
      conn.on('open', () => { dataConn.current = conn; setStatus('Online! 🐴'); });
    });
    return () => peer.destroy();
  }, []);

  // ✨ THE DUCKING LOGIC
  const playSoundWithDucking = (soundPath) => {
    // 1. If background music is playing, lower the volume
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.2; 
    }

    const sfx = new Audio(soundPath);
    
    // 2. When the sound effect ends, bring the music back up
    sfx.onended = () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 1.0;
      }
    };

    sfx.play().catch(e => console.log("Audio play blocked or missing file"));
  };

  const sendCommand = (type, id) => {
    const soundPath = type === 'FART' ? '/sounds/mega_fart.mp3' : `/sounds/${id}.mp3`;
    
    if (dataConn.current?.open) {
      dataConn.current.send(JSON.stringify({ type, id }));
    }
    
    // Play locally with the volume ducking effect
    playSoundWithDucking(soundPath);
  };

  const pumpGas = () => { if (gasLevel < 100) setGasLevel(prev => Math.min(prev + 20, 100)); };
  const releaseGas = () => { if (gasLevel >= 100) { sendCommand('FART', 'mega_fart'); setGasLevel(0); } };

  return (
    <div style={{ 
      background: '#FDFFB6', 
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      justifyContent: 'center', 
      alignItems: 'center',     
      fontFamily: "'Fredoka One', cursive", 
      color: '#5C3317',
      boxSizing: 'border-box',
      overflow: 'hidden' 
    }}>
      
      <div style={{
        width: '100%',
        maxWidth: '800px',      
        height: '100%',
        maxHeight: '700px',     
        padding: '30px',        
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>

        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexShrink: 0 }}>
          <Link to="/" style={{ 
            textDecoration: 'none', background: '#FFD6A5', padding: '10px 18px', 
            borderRadius: '20px', color: '#8B4513', fontSize: '14px', fontWeight: '900',
            boxShadow: '0 4px 0 #EAB676' 
          }}>🏠 HOME</Link>
          <div style={{ background: '#CAFFBF', padding: '8px 18px', borderRadius: '25px', fontSize: '12px', border: '2px solid #95D5B2' }}>
            {status === 'Online! 🐴' ? 'Pony Linked! ✨' : 'Searching...'}
          </div>
        </header>

        <section style={{ 
          background: '#FFFFFF', padding: '20px', borderRadius: '35px', 
          border: '5px solid #BDB2FF', boxShadow: '0 8px 0 #9D94E0',
          flex: '0 1 auto', marginBottom: '25px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#A380FF', marginTop: 0 }}>FART POWER! 💨</h2>
          
          <div style={{ 
            width: '100%', height: '44px', background: '#F0F0F0', borderRadius: '22px', 
            padding: '6px', border: '3px solid #DDD', marginBottom: '15px'
          }}>
            <div style={{ 
              width: `${gasLevel}%`, height: '100%', 
              background: gasLevel >= 100 ? '#9BF6FF' : '#FFADAD', 
              borderRadius: '15px', transition: 'width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={pumpGas} style={{ 
              flex: 1, padding: '15px', borderRadius: '20px', border: 'none', 
              background: '#FFADAD', color: 'white', fontSize: '20px', fontWeight: '900', 
              boxShadow: '0 6px 0 #FF8585', cursor: 'pointer' 
            }}>PUMP!</button>
            
            <button onClick={releaseGas} disabled={gasLevel < 100} style={{ 
              flex: 1, padding: '15px', borderRadius: '20px', border: 'none', 
              background: gasLevel >= 100 ? '#9BF6FF' : '#D0D0D0', 
              color: gasLevel >= 100 ? '#0077B6' : '#888', fontSize: '20px', fontWeight: '900', 
              boxShadow: gasLevel >= 100 ? '0 6px 0 #7ACDD6' : '0 6px 0 #B0B0B0'
            }}>POOF!</button>
          </div>
        </section>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#5C3317', marginTop: 0 }}>PLAY A SONG! 🎶</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gridTemplateRows: '1fr 1fr', 
            gap: '20px', 
            height: '100%' 
          }}>
            {INSTRUMENTS.map(ins => (
              <button 
                key={ins.id} 
                onClick={() => sendCommand('INSTRUMENT', ins.id)}
                style={{ 
                  background: ins.color, borderRadius: '35px', 
                  border: 'none', color: 'white', cursor: 'pointer',
                  boxShadow: `0 8px 0 ${ins.shadow}`, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.1s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: '48px' }}>{ins.emoji}</div>
                <div style={{ fontWeight: '900', fontSize: '18px', marginTop: '5px' }}>{ins.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}