import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { title: 'PLAYTIME',  to: '/game',   icon: '🎮', badge: "Let's play! 🕹️", bg: '#F0FFF4', ring: '#43A047', shadow: '#A5D6A7', bubble: '#C8E6C9', text: '#1B5E20', badgeBg: '#C8E6C9', badgeText: '#1B5E20', delay: '0s'   },
  { title: 'SOUND',     to: '/horns',  icon: '🎺', badge: 'Toot toot! 📯',   bg: '#FFF5E8', ring: '#FB8C00', shadow: '#FFCC80', bubble: '#FFE0B2', text: '#E65100', badgeBg: '#FFE0B2', badgeText: '#BF360C', delay: '.4s'  },
  { title: 'TALK TIME', to: '/themes', icon: '📻', badge: 'Chat away! 💬',   bg: '#F5F0FF', ring: '#8E24AA', shadow: '#CE93D8', bubble: '#E1BEE7', text: '#4A148C', badgeBg: '#E1BEE7', badgeText: '#4A148C', delay: '.8s'  },
  { title: 'VISION',    to: '/safety', icon: '🛡️', badge: 'Keep me safe!',   bg: '#FFF0F0', ring: '#FF5252', shadow: '#FFAAAA', bubble: '#FFCDD2', text: '#C62828', badgeBg: '#FFCDD2', badgeText: '#B71C1C', delay: '1.2s' },
  { title: 'MY MAP',    to: '/map',    icon: '🗺️', badge: 'Explore! 🧭',    bg: '#EEF6FF', ring: '#1E88E5', shadow: '#90CAF9', bubble: '#BBDEFB', text: '#0D47A1', badgeBg: '#BBDEFB', badgeText: '#0D47A1', delay: '1.6s' },
];
const STAR_COLORS = ['#FF8A80','#FFCA28','#69F0AE','#80D8FF','#B388FF','#FF80AB','#CCF9B0','#FFAB40'];

function generateStars(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 12 + 6,
    color: STAR_COLORS[i % STAR_COLORS.length],
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animDelay: `${(Math.random() * 2.4).toFixed(2)}s`,
    animDuration: `${(1.8 + Math.random() * 2).toFixed(2)}s`,
  }));
}

const stars = generateStars();

export default function Dashboard() {
  const cardRefs = useRef([]);

  const handleCardClick = (i) => {
    const el = cardRefs.current[i];
    if (!el) return;
    el.style.transform = 'scale(1.15) rotate(3deg)';
    setTimeout(() => { el.style.transform = ''; }, 300);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');

        .pd-wrap {
          background: #FFF6E0;
          min-height: 100vh;
          padding: 36px 20px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Fredoka One', 'Nunito', sans-serif;
          overflow: hidden;
        }
        .pd-scene {
          position: relative;
          width: 100%;
          max-width: 880px;
        }
        .pd-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .pd-star {
          position: absolute;
          border-radius: 50%;
          animation: pd-twinkle var(--dur) ease-in-out infinite var(--delay);
        }
        @keyframes pd-twinkle {
          0%, 100% { opacity: .9; transform: scale(1); }
          50%       { opacity: .3; transform: scale(.5); }
        }
        .pd-hdr {
          text-align: center;
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
        }
        .pd-pony {
          font-size: 72px;
          display: inline-block;
          animation: pd-gallop 1.1s ease-in-out infinite alternate;
          transform-origin: bottom center;
        }
        @keyframes pd-gallop {
          0%   { transform: rotate(-6deg) translateY(0); }
          100% { transform: rotate(6deg)  translateY(-8px); }
        }
        .pd-title {
          font-size: 52px;
          font-weight: 900;
          color: #5C3317;
          letter-spacing: 2px;
          text-shadow: 4px 4px 0 #fff, 6px 6px 0 #F8B84E;
          line-height: 1.1;
          margin: 0;
        }
        .pd-sub {
          font-size: 22px;
          color: #9B5E28;
          margin-top: 8px;
          font-weight: 700;
        }
        .pd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 28px;
          position: relative;
          z-index: 1;
          width: 100%;
        }
        .pd-card {
          border-radius: 40% 60% 55% 45% / 45% 55% 60% 40%;
          padding: 32px 20px 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s;
          position: relative;
          overflow: hidden;
          text-decoration: none;
        }
        .pd-card:hover  { transform: scale(1.07) rotate(-1deg); }
        .pd-card:active { transform: scale(.95)  rotate(1deg);  }
        .pd-bubble {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          position: relative;
          flex-shrink: 0;
        }
        .pd-bubble::after {
          content: '✦ ✦ ✦';
          position: absolute;
          top: 4px; right: 4px;
          font-size: 9px;
          color: rgba(0,0,0,.15);
          letter-spacing: 2px;
          pointer-events: none;
        }
        .pd-icon {
          font-size: 54px;
          line-height: 1;
          display: block;
          animation: pd-wobble 2.8s ease-in-out infinite var(--icon-delay);
        }
        @keyframes pd-wobble {
          0%, 100% { transform: rotate(-8deg); }
          50%       { transform: rotate(8deg);  }
        }
        .pd-label {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: .5px;
          font-family: 'Fredoka One', 'Nunito', sans-serif;
        }
        .pd-badge {
          margin-top: 8px;
          padding: 4px 14px;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 700;
        }
        .pd-clouds {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 44px;
          position: relative;
          z-index: 1;
        }
        .pd-cloud {
          height: 30px;
          border-radius: 60px;
          animation: pd-float 3s ease-in-out infinite;
        }
        .pd-cloud:nth-child(2) { animation-delay: .6s;  }
        .pd-cloud:nth-child(3) { animation-delay: 1.2s; }
        @keyframes pd-float {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(-10px); }
        }
        .pd-ground {
          height: 16px;
          border-radius: 40px;
          margin-top: 16px;
          background: repeating-linear-gradient(90deg, #8BC34A 0 20px, #7CB342 20px 40px);
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="pd-wrap">
        <div className="pd-scene">

          {/* Floating stars */}
          <div className="pd-stars">
            {stars.map(s => (
              <div
                key={s.id}
                className="pd-star"
                style={{
                  width: s.size,
                  height: s.size,
                  background: s.color,
                  left: s.left,
                  top: s.top,
                  '--delay': s.animDelay,
                  '--dur': s.animDuration,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <header className="pd-hdr">
            <span className="pd-pony">🐴</span>
            <h1 className="pd-title">Roady The Horse</h1>
            <p className="pd-sub">🌟 Pick your adventure! 🌟</p>
          </header>

          {/* Cards */}
          <div className="pd-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.title}
                to={cat.to}
                className="pd-card"
                ref={el => cardRefs.current[i] = el}
                onClick={() => handleCardClick(i)}
                style={{
                  background: cat.bg,
                  boxShadow: `0 12px 0 ${cat.shadow}, 0 0 0 6px ${cat.ring}`,
                }}
              >
                <div className="pd-bubble" style={{ background: cat.bubble }}>
                  <span
                    className="pd-icon"
                    style={{ '--icon-delay': cat.delay }}
                  >
                    {cat.icon}
                  </span>
                </div>
                <div className="pd-label" style={{ color: cat.text }}>{cat.title}</div>
                <div
                  className="pd-badge"
                  style={{ background: cat.badgeBg, color: cat.badgeText }}
                >
                  {cat.badge}
                </div>
              </Link>
            ))}
          </div>

          {/* Ground / clouds */}
          <div className="pd-clouds">
            <div className="pd-cloud" style={{ width: 60,  background: '#FFF9C4' }} />
            <div className="pd-cloud" style={{ width: 90,  background: '#E3F2FD' }} />
            <div className="pd-cloud" style={{ width: 60,  background: '#FCE4EC' }} />
          </div>
          <div className="pd-ground" />

        </div>
      </div>
    </>
  );
}
