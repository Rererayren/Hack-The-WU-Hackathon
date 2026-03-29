import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const soundCategories = {
  discover: {
    title: 'ABCs & Animals',
    emoji: '🦁',
    // High-energy warm amber — stimulating but not emergency-red
    color: '#F59E0B',
    shadow: '#B45309',
    light: '#FEF3C7',
    text: '#78350F',
    items: [
      { icon: '🍎', label: 'Apple',     sound: 'A is for Apple. Ah, ah, Apple!' },
      { icon: '🐻', label: 'Bear',      sound: 'B is for Bear. Buh, buh, Bear!' },
      { icon: '🚗', label: 'Car',       sound: 'C is for Car. Vroom vroom!' },
      { icon: '🐶', label: 'Dog',       sound: 'D is for Dog. Woof woof!' },
      { icon: '🐘', label: 'Elephant',  sound: 'E is for Elephant. Eh, eh, Elephant!' },
      { icon: '🐸', label: 'Frog',      sound: 'F is for Frog. Ribbit ribbit!' },
      { icon: '🦒', label: 'Giraffe',   sound: 'G is for Giraffe. Guh, guh, Giraffe!' },
      { icon: '🐴', label: 'Horse',     sound: 'H is for Horse. Neigh!' },
      { icon: '🍦', label: 'Ice Cream', sound: 'I is for Ice Cream. Yummy!' },
      { icon: '🧃', label: 'Juice',     sound: 'J is for Juice. Juh, juh, Juice!' },
      { icon: '🦘', label: 'Kangaroo',  sound: 'K is for Kangaroo. Hop, hop, hop!' },
      { icon: '🦁', label: 'Lion',      sound: 'L is for Lion. Roar!' },
      { icon: '🐒', label: 'Monkey',    sound: 'M is for Monkey. Ooh ooh ah ah!' },
      { icon: '👃', label: 'Nose',      sound: 'N is for Nose. Nuh, nuh, Nose!' },
      { icon: '🐙', label: 'Octopus',   sound: 'O is for Octopus. Wiggle, wiggle!' },
      { icon: '🐷', label: 'Pig',       sound: 'P is for Pig. Oink, oink!' },
      { icon: '👑', label: 'Queen',     sound: 'Q is for Queen. Hello, your majesty!' },
      { icon: '🚀', label: 'Rocket',    sound: 'R is for Rocket. Blast off!' },
      { icon: '☀️', label: 'Sun',       sound: 'S is for Sun. Warm and bright!' },
      { icon: '🐯', label: 'Tiger',     sound: 'T is for Tiger. Grrr!' },
      { icon: '☂️', label: 'Umbrella',  sound: 'U is for Umbrella. Keeps us dry!' },
      { icon: '🌋', label: 'Volcano',   sound: 'V is for Volcano. Vuh, vuh, Volcano!' },
      { icon: '🐳', label: 'Whale',     sound: 'W is for Whale. Splash!' },
      { icon: '🎹', label: 'Xylophone', sound: 'X is for Xylophone. Ding, ding, ding!' },
      { icon: '🪀', label: 'Yo-yo',     sound: 'Y is for Yo-yo. Up and down!' },
      { icon: '🦓', label: 'Zebra',     sound: 'Z is for Zebra. Zuh, zuh, Zebra!' },
    ],
  },
  copilot: {
    title: "Let's Drive!",
    emoji: '🚗',
    // Calming sky-blue — safe peripheral, no alarm connotation
    color: '#0EA5E9',
    shadow: '#0369A1',
    light: '#E0F2FE',
    text: '#0C4A6E',
    items: [
      { icon: '🚦', label: 'Stop & Go', sound: 'Green means go! Red means stop!' },
      { icon: '👈', label: 'Left',      sound: 'Turn to the left!' },
      { icon: '👉', label: 'Right',     sound: 'Turn to the right!' },
      { icon: '🐢', label: 'Slow',      sound: 'Nice and slow, like a turtle.' },
      { icon: '🐇', label: 'Fast',      sound: 'Fast like a bunny! Zoom!' },
      { icon: '📯', label: 'Honk',      sound: 'Beep beep! Coming through!' },
    ],
  },
  communicate: {
    title: 'My Feelings',
    emoji: '💬',
    // Soft sage-green — calming, emotionally neutral, safe
    color: '#22C55E',
    shadow: '#15803D',
    light: '#DCFCE7',
    text: '#14532D',
    items: [
      { icon: '😊', label: 'Happy',    sound: 'I feel happy today!' },
      { icon: '😫', label: 'Too Loud', sound: 'It is too loud. I need a break.' },
      { icon: '🧃', label: 'Thirsty',  sound: 'I am thirsty. Can I have a drink?' },
      { icon: '🥪', label: 'Hungry',   sound: 'I am hungry for a snack.' },
      { icon: '🚽', label: 'Potty',    sound: 'I need to use the potty.' },
      { icon: '🫂', label: 'Hug',      sound: 'I would like a hug, please.' },
    ],
  },
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function SoundBoard() {
  const [activeTab, setActiveTab]       = useState('discover');
  const [activeButton, setActiveButton] = useState(null);
  const [ripples, setRipples]           = useState({});
  const [voice, setVoice]               = useState(null);

  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      const pick   = voices.find(v =>
        v.name.includes('Ana')
      );
      setVoice(pick || voices[0]);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const playSound = (item, index) => {
    setActiveButton(index);
    setRipples(r => ({ ...r, [index]: Date.now() }));
    setTimeout(() => setActiveButton(null), 180);
    if ('vibrate' in navigator) navigator.vibrate(60);
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(item.sound);
    if (voice) { utt.voice = voice; utt.lang = voice.lang; }
    utt.rate  = 0.88;
    utt.pitch = 1.25;

    utt.onstart = () => window.dispatchEvent(new Event('pony-speak-start'));
    utt.onend = () => window.dispatchEvent(new Event('pony-speak-end'));
    utt.onerror = () => window.dispatchEvent(new Event('pony-speak-end')); // Safety catch
    window.speechSynthesis.speak(utt);
  };

  const cat = soundCategories[activeTab];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sb-root {
          --font-head: 'Fredoka One', cursive;
          --font-body: 'Nunito', sans-serif;
          --bg: #FFFBEB;
          --card-bg: #FFFFFF;
          --radius-card: 28px;
          --radius-btn: 50px;
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          font-family: var(--font-body);
          overflow: hidden;
        }

        /* ── HEADER ── */
        .sb-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          background: #fff;
          border-bottom: 3px solid #FEF3C7;
          border-radius: 0 0 28px 28px;
          box-shadow: 0 4px 0 #FDE68A;
          z-index: 10;
          flex-shrink: 0;
        }
        .sb-home-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 50px;
          background: #1D4ED8;
          color: #fff;
          font-family: var(--font-head);
          font-size: 17px;
          font-weight: 400;
          text-decoration: none;
          box-shadow: 0 5px 0 #1E3A8A;
          transition: transform .1s, box-shadow .1s;
          flex-shrink: 0;
        }
        .sb-home-btn:active { transform: translateY(5px); box-shadow: 0 0 0 #1E3A8A; }
        .sb-header-title {
          flex: 1;
          text-align: center;
          font-family: var(--font-head);
          font-size: 30px;
          color: #78350F;
          letter-spacing: .5px;
        }
        .sb-header-badge {
          background: #FEF3C7;
          color: #92400E;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
        }

        /* ── TABS ── */
        .sb-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          padding: 18px 20px 14px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .sb-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 50px;
          font-family: var(--font-head);
          font-size: 18px;
          cursor: pointer;
          transition: transform .12s cubic-bezier(.34,1.56,.64,1), box-shadow .12s;
          position: relative;
        }
        .sb-tab:not(.active) {
          background: #fff;
          color: #6B7280;
          box-shadow: 0 5px 0 #E5E7EB;
        }
        .sb-tab:not(.active):hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 0 #E5E7EB;
        }
        .sb-tab.active {
          color: #fff;
          transform: translateY(3px);
        }
        .sb-tab-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,.5);
        }

        /* ── GRID PANEL ── */
        .sb-panel {
          flex: 1;
          overflow-y: auto;
          border-radius: 32px 32px 0 0;
          padding: 24px 20px 32px;
          scroll-behavior: smooth;
        }
        .sb-panel::-webkit-scrollbar { width: 6px; }
        .sb-panel::-webkit-scrollbar-track { background: transparent; }
        .sb-panel::-webkit-scrollbar-thumb { border-radius: 6px; }

        .sb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
          gap: 18px;
          max-width: 960px;
          margin: 0 auto;
        }

        /* ── SOUND BUTTON ── */
        .sb-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          aspect-ratio: 1;
          border: none;
          border-radius: var(--radius-btn);
          background: var(--card-bg);
          cursor: pointer;
          overflow: hidden;
          transition: transform .12s cubic-bezier(.34,1.56,.64,1), box-shadow .12s;
          /* border + shadow set inline per category */
          padding: 12px 8px;
          -webkit-tap-highlight-color: transparent;
        }
        .sb-btn:hover  { transform: translateY(-4px) scale(1.03); }
        .sb-btn.pressed { transform: translateY(6px) scale(.97) !important; }

        .sb-btn-icon {
          font-size: 56px;
          line-height: 1;
          pointer-events: none;
          transition: transform .12s;
        }
        .sb-btn.pressed .sb-btn-icon { transform: scale(.88); }

        .sb-btn-label {
          font-family: var(--font-head);
          font-size: 15px;
          letter-spacing: .3px;
          pointer-events: none;
          text-transform: uppercase;
        }

        /* ripple */
        .sb-ripple {
          position: absolute;
          border-radius: 50%;
          width: 10px; height: 10px;
          transform: scale(0);
          opacity: .45;
          animation: sb-ripple-anim .5s ease-out forwards;
          pointer-events: none;
        }
        @keyframes sb-ripple-anim {
          to { transform: scale(30); opacity: 0; }
        }

        /* stagger cards in on tab switch */
        .sb-btn { animation: sb-pop-in .3s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes sb-pop-in {
          from { opacity: 0; transform: scale(.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="sb-root">

        {/* HEADER */}
        <header className="sb-header">
          <Link to="/" className="sb-home-btn">🏠 Home</Link>
          <h1 className="sb-header-title">My SoundBoard 🎵</h1>
          <div className="sb-header-badge">Ages 3–8</div>
        </header>

        {/* TABS */}
        <div className="sb-tabs">
          {Object.entries(soundCategories).map(([key, c]) => (
            <button
              key={key}
              className={`sb-tab${activeTab === key ? ' active' : ''}`}
              style={activeTab === key
                ? { background: c.color, boxShadow: `0 5px 0 ${c.shadow}` }
                : {}
              }
              onClick={() => {
                setActiveTab(key);
                window.speechSynthesis.cancel();
              }}
            >
              {activeTab === key && <div className="sb-tab-dot" />}
              <span>{c.emoji}</span>
              <span>{c.title}</span>
            </button>
          ))}
        </div>

        {/* GRID PANEL */}
        <div
          className="sb-panel"
          style={{ background: cat.light }}
        >
          <div className="sb-grid">
            {cat.items.map((item, i) => (
              <button
                key={`${activeTab}-${i}`}
                className={`sb-btn${activeButton === i ? ' pressed' : ''}`}
                style={{
                  border: `4px solid ${cat.color}`,
                  boxShadow: activeButton === i
                    ? `0 0 0 ${cat.shadow}`
                    : `0 7px 0 ${cat.shadow}`,
                  animationDelay: `${i * 28}ms`,
                  color: cat.text,
                }}
                onClick={() => playSound(item, i)}
              >
                {/* ripple layer */}
                {ripples[i] && (
                  <span
                    key={ripples[i]}
                    className="sb-ripple"
                    style={{
                      background: cat.color,
                      top: '50%', left: '50%',
                      marginTop: -5, marginLeft: -5,
                    }}
                  />
                )}
                <span className="sb-btn-icon">{item.icon}</span>
                <span className="sb-btn-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}