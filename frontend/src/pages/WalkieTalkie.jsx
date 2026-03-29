import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Peer from 'peerjs';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const QUICK_MESSAGES = [
  { emoji: '🏎️', label: 'Race',  text: "Let's race!" },
  { emoji: '🚨', label: 'Help',  text: 'I need help!' },
  { emoji: '👀', label: 'Look',  text: 'Come look at this!' },
  { emoji: '❤️', label: 'Love',  text: 'I love you!' },
];

const ROLES = [
  { id: 'pony',   icon: '🐴', label: 'I am Roady',   color: '#F59E0B', shadow: '#B45309' },
  { id: 'parent', icon: '🏃', label: 'I am Sibling', color: '#0EA5E9', shadow: '#0369A1' },
];

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function WalkieTalkie() {
  const [role, setRole]             = useState(null);
  const [status, setStatus]         = useState('Waiting to connect...');
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking]   = useState(false);
  const [flyingEmoji, setFlyingEmoji] = useState(null);
  const [rippleKey, setRippleKey]   = useState(0);
  const [voice, setVoice]           = useState(null);

  const peerInstance   = useRef(null);
  const audioCall      = useRef(null);
  const dataConn       = useRef(null);
  const remoteAudioRef = useRef(null);
  const myStreamRef    = useRef(null);

  const muteMusic    = () => window.dispatchEvent(new Event('pony-speak-start'));
  const restoreMusic = () => window.dispatchEvent(new Event('pony-speak-end'));

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const markVoice = availableVoices.find(v => v.name.includes("Mark"));
      setVoice(markVoice || availableVoices[0]);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // ── 1. INIT ──
  const selectRole = async (selectedRole) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getAudioTracks().forEach(t => (t.enabled = false));
      myStreamRef.current = stream;
    } catch {
      alert('Oops! We need microphone access to use the Walkie Talkie!');
      return; 
    }
    
    setRole(selectedRole);
    setStatus('Ready! Press Connect 📞');
    
    const myId = selectedRole === 'pony' ? 'roady-pony-device' : 'roady-parent-device';
    const peer = new Peer(myId);
   
    peerInstance.current = peer;
    
    peer.on('call', (call) => {
      setStatus('Incoming connection...');
      call.answer(myStreamRef.current);
      audioCall.current = call;
      call.on('stream', (s) => {
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = s;
        setIsConnected(true);
        setStatus('Connected! 🟢');
      });
      call.on('close', endCall);
    });
    
    peer.on('connection', (conn) => {
      dataConn.current = conn;
      conn.on('data', (d) => triggerEmojiMagic(d));
    });
  };

  // ── 2. CONNECT ──
  const startCall = () => {
    const targetId = role === 'pony' ? 'roady-parent-device' : 'roady-pony-device';
    setStatus('Connecting... 📡');
    
    const call = peerInstance.current.call(targetId, myStreamRef.current);
    audioCall.current = call;
    
    call.on('stream', (s) => {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = s;
      setIsConnected(true);
      setStatus('Connected! 🟢');
    });
    call.on('close', endCall);
    call.on('error', () => setStatus('Call failed ⚠️'));
    
    const conn = peerInstance.current.connect(targetId);
    conn.on('open', () => { dataConn.current = conn; });
  };

  // ── 3. EMOJI MAGIC ──
  const triggerEmojiMagic = (emoji) => {
    setFlyingEmoji(emoji);
    setRippleKey(k => k + 1);
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    setTimeout(() => setFlyingEmoji(null), 2600);
  };

  // ── 4. PUSH-TO-TALK ──
  const handleTalkStart = () => {
    if (!isConnected) return;
    setIsTalking(true);
    muteMusic();
    myStreamRef.current?.getAudioTracks().forEach(t => (t.enabled = true));
    if (dataConn.current && dataConn.current.open) dataConn.current.send('🔊');
  };
  
  const handleTalkEnd = () => {
    setIsTalking(false);
    restoreMusic();
    myStreamRef.current?.getAudioTracks().forEach(t => (t.enabled = false));
  };

  // ── 5. QUICK MESSAGES ──
  const sendQuickMessage = (text, emoji) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.pitch = 1.3;
    speechSynthesis.speak(utterance);
    
    if (dataConn.current && dataConn.current.open) dataConn.current.send(emoji);
    triggerEmojiMagic(emoji); 
  };

  // ── 6. HANG UP ──
  const endCall = () => {
    audioCall.current?.close();
    dataConn.current?.close();
    setIsConnected(false);
    setStatus('Ready to call again 🎤');
    restoreMusic();
  };

  useEffect(() => {
    return () => {
      peerInstance.current?.destroy();
      myStreamRef.current?.getTracks().forEach(t => t.stop());
      restoreMusic();
    };
  }, []);

  const pillColor = !isConnected ? '#EF4444' : isTalking ? '#22C55E' : '#0EA5E9';
  const pillShadow = !isConnected ? '#991B1B' : isTalking ? '#15803D' : '#0369A1';

  // ✨ THE NEW DYNAMIC THEME LOGIC ✨
  const activeRoleInfo = ROLES.find(r => r.id === role);
  const radioBg = role === 'pony' ? '#F59E0B' : '#0EA5E9';      // Amber vs Blue
  const radioBorder = role === 'pony' ? '#FEF3C7' : '#E0F2FE';  // Light border
  const radioShadow = role === 'pony' ? '#B45309' : '#0369A1';  // Dark shadow
  const radioText = role === 'pony' ? '#78350F' : '#FFFFFF';    // High contrast text

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wt-root {
          --font-head: 'Fredoka One', cursive;
          --font-body: 'Nunito', sans-serif;
          min-height: 100vh;
          background: #FFFBEB;
          display: flex;
          flex-direction: column;
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        /* ── HEADER ── */
        .wt-header {
          display: flex; align-items: center; gap: 12px; padding: 12px 20px;
          background: #fff; border-bottom: 3px solid #FEF3C7; border-radius: 0 0 28px 28px;
          box-shadow: 0 4px 0 #FDE68A; z-index: 10; flex-shrink: 0;
        }
        .wt-home-btn {
          display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 50px;
          background: #1D4ED8; color: #fff; font-family: var(--font-head); font-size: 17px;
          text-decoration: none; box-shadow: 0 5px 0 #1E3A8A; transition: transform .1s, box-shadow .1s;
        }
        .wt-home-btn:active { transform: translateY(5px); box-shadow: 0 0 0 #1E3A8A; }
        .wt-header-title { flex: 1; text-align: center; font-family: var(--font-head); font-size: 28px; color: #78350F; letter-spacing: .5px; }
        .wt-status-pill { padding: 8px 16px; border-radius: 50px; font-family: var(--font-head); font-size: 15px; color: #fff; transition: background .3s, box-shadow .3s; }

        /* ── MAIN ── */
        .wt-main { flex: 1; display: flex; justify-content: center; align-items: center; padding: 28px 20px 36px; }

        /* ── ROLE SELECTION ── */
        .wt-role-wrap { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 28px; }
        .wt-role-heading { font-family: var(--font-head); font-size: 36px; color: #78350F; }
        .wt-role-row { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
        .wt-role-btn {
          display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 36px 44px;
          border: none; border-radius: 40px; cursor: pointer; transition: transform .12s cubic-bezier(.34,1.56,.64,1), box-shadow .12s;
          color: #fff; font-family: var(--font-head); font-size: 26px;
        }
        .wt-role-btn:hover  { transform: translateY(-4px) scale(1.03); }
        .wt-role-btn:active { transform: translateY(8px) scale(.97); box-shadow: 0 0 0 transparent !important; }
        .wt-role-icon { font-size: 68px; line-height: 1; }

        /* ── RADIO DEVICE ── */
        .wt-device {
          width: 100%; max-width: 420px; border-radius: 44px; padding: 32px 28px;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
          border: 8px solid; transition: box-shadow .3s, background .3s; position: relative;
        }

        .wt-antenna {
          width: 6px; height: 44px; border-radius: 6px; position: absolute; top: -50px; right: 40px;
        }
        .wt-antenna::after {
          content: ''; position: absolute; top: -7px; left: 50%; transform: translateX(-50%);
          width: 14px; height: 14px; border-radius: 50%; background: #F59E0B; box-shadow: 0 3px 0 #B45309;
        }

        .wt-device-status { font-family: var(--font-head); font-size: 20px; text-align: center; margin-top: 10px; }

        .wt-connect-btn {
          width: 100%; padding: 20px; border-radius: 50px; border: none; background: #22C55E; color: #fff;
          font-family: var(--font-head); font-size: 26px; box-shadow: 0 8px 0 #15803D; cursor: pointer; transition: transform .1s, box-shadow .1s;
        }
        .wt-connect-btn:active { transform: translateY(8px); box-shadow: 0 0 0 #15803D; }

        .wt-talk-btn {
          width: 100%; padding: 28px; border-radius: 50px; border: none; font-family: var(--font-head);
          font-size: 26px; cursor: pointer; transition: transform .1s, box-shadow .1s, background .1s; user-select: none; -webkit-user-select: none;
        }
        .wt-talk-btn.idle { background: #F59E0B; color: #78350F; box-shadow: 0 10px 0 #B45309; }
        .wt-talk-btn.talking { background: #22C55E; color: #fff; box-shadow: 0 0 0 transparent; transform: translateY(10px); }

        .wt-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; }
        .wt-quick-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 10px; border-radius: 24px;
          border: none; background: #EDE9FE; color: #4C1D95; font-family: var(--font-head); font-size: 15px;
          cursor: pointer; box-shadow: 0 5px 0 #C4B5FD; transition: transform .1s, box-shadow .1s;
        }
        .wt-quick-btn span:first-child { font-size: 30px; line-height: 1; }
        .wt-quick-btn:active { transform: translateY(5px); box-shadow: 0 0 0 #C4B5FD; }

        .wt-hangup-btn {
          width: 100%; padding: 16px; border-radius: 50px; border: none; background: #EF4444; color: #fff;
          font-family: var(--font-head); font-size: 22px; box-shadow: 0 7px 0 #991B1B; cursor: pointer; transition: transform .1s, box-shadow .1s;
        }
        .wt-hangup-btn:active { transform: translateY(7px); box-shadow: 0 0 0 #991B1B; }

        .wt-emoji-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 9999; }
        .wt-flying-emoji { font-size: 160px; animation: wt-float-up 2.5s cubic-bezier(.25,1,.5,1) forwards; filter: drop-shadow(0 20px 20px rgba(0,0,0,.2)); }
        @keyframes wt-float-up { 0% { transform: translateY(80px) scale(0); opacity: 0; } 20% { transform: translateY(0) scale(1.2); opacity: 1; } 80% { transform: translateY(-60px) scale(1); opacity: 1; } 100% { transform: translateY(-200px) scale(.5);opacity: 0; } }

        .wt-talk-ring {
          position: absolute; top: -50px; right: 23px; width: 40px; height: 40px; border-radius: 50%;
          border: 4px solid #22C55E; animation: wt-ring-pulse 1s ease-out infinite; pointer-events: none;
        }
        @keyframes wt-ring-pulse { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(3.5); opacity: 0;  } }
      `}</style>

      {flyingEmoji && (
        <div className="wt-emoji-overlay">
          <div key={rippleKey} className="wt-flying-emoji">{flyingEmoji}</div>
        </div>
      )}

      <audio ref={remoteAudioRef} autoPlay />

      <div className="wt-root">
        <header className="wt-header">
          <Link to="/" className="wt-home-btn">🏠 Home</Link>
          <h1 className="wt-header-title">Walkie Talkie 📻</h1>
          <div
            className="wt-status-pill"
            style={{ background: pillColor, boxShadow: `0 4px 0 ${pillShadow}` }}
          >
            {!isConnected ? 'Offline' : isTalking ? 'Talking!' : 'Online'}
          </div>
        </header>

        <main className="wt-main">
          {!role && (
            <div className="wt-role-wrap">
              <div className="wt-role-heading">Who is playing? 🎉</div>
              <div className="wt-role-row">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    className="wt-role-btn"
                    style={{ background: r.color, boxShadow: `0 10px 0 ${r.shadow}` }}
                    onClick={() => selectRole(r.id)}
                  >
                    <span className="wt-role-icon">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {role && (
            <div
              className="wt-device"
              style={{
                background: radioBg,
                borderColor: radioBorder,
                boxShadow: `0 0 40px ${pillColor}55, 0 14px 0 ${radioShadow}`,
              }}
            >
              <div className="wt-antenna" style={{ background: radioBorder }} />

              {isTalking && <div className="wt-talk-ring" />}

              {/* ✨ NEW: Tiny Name Tag Badge ✨ */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '6px 16px',
                borderRadius: '20px',
                color: radioText,
                fontFamily: 'var(--font-head)',
                fontSize: '16px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '-5px'
              }}>
                <span>{activeRoleInfo?.icon}</span>
                <span>{activeRoleInfo?.label}'s Radio</span>
              </div>

              <div className="wt-device-status" style={{ color: radioText }}>{status}</div>

              {!isConnected && (
                <button className="wt-connect-btn" onClick={startCall}>
                  Connect 📞
                </button>
              )}

              {isConnected && (
                <>
                  <button
                    className={`wt-talk-btn ${isTalking ? 'talking' : 'idle'}`}
                    onMouseDown={handleTalkStart}
                    onMouseUp={handleTalkEnd}
                    onTouchStart={handleTalkStart}
                    onTouchEnd={handleTalkEnd}
                  >
                    {isTalking ? '🎤 Sending...' : 'Hold to Talk'}
                  </button>

                  <div className="wt-quick-grid">
                    {QUICK_MESSAGES.map(m => (
                      <button
                        key={m.label}
                        className="wt-quick-btn"
                        onClick={() => sendQuickMessage(m.text, m.emoji)}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <button className="wt-hangup-btn" onClick={endCall}>
                    Hang Up 🛑
                  </button>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}