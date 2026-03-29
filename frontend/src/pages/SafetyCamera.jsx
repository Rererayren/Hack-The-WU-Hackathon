import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const STATES = {
  clear:      { color: '#22C55E', shadow: '#15803D', light: '#DCFCE7', label: 'ALL CLEAR!',   arrow: '🌟' },
  turn_right: { color: '#0EA5E9', shadow: '#0369A1', light: '#E0F2FE', label: 'TURN RIGHT!',  arrow: '👉' },
  turn_left:  { color: '#0EA5E9', shadow: '#0369A1', light: '#E0F2FE', label: 'TURN LEFT!',   arrow: '👈' },
  stop:       { color: '#EF4444', shadow: '#991B1B', light: '#FEE2E2', label: 'STOP!',         arrow: '🛑' },
};

const getCommand = (action, lang = 'en-US') => {
  const es = lang.startsWith('es');
  const fr = lang.startsWith('fr');
  if (action === 'turn_right') return es ? '¡Gira a la derecha!' : fr ? 'Tourne à droite !' : 'Turn right!';
  if (action === 'turn_left')  return es ? '¡Gira a la izquierda!' : fr ? 'Tourne à gauche !' : 'Turn left!';
  if (action === 'stop')       return es ? '¡Alto ahí!' : fr ? 'Arrête-toi !' : 'Stop! Stop! Stop!';
  return '';
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function SafetyCamera() {
  const videoRef               = useRef(null);
  const [active, setActive]    = useState(false);
  const [detector, setDetector]= useState(null);
  const [navState, setNavState]= useState('clear');   // 'clear' | 'turn_right' | 'turn_left' | 'stop'
  const [sensitivity, setSensitivity] = useState(15);
  const [voice, setVoice]      = useState(null);
  const [loading, setLoading]  = useState(true);

  // ── voices ──
  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      const pick = voices.find(v =>
        v.name.includes('Ana')
      );
      setVoice(pick || voices[0]);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (voice) { utt.voice = voice; utt.lang = voice.lang; }
    utt.rate  = 1.0;
    utt.pitch = 1.2;

    utt.onstart = () => window.dispatchEvent(new Event('pony-speak-start'));
    utt.onend = () => window.dispatchEvent(new Event('pony-speak-end'));
    utt.onerror = () => window.dispatchEvent(new Event('pony-speak-end')); // Safety catch

    window.speechSynthesis.speak(utt);
  };

  // ── detector init ──
  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm'
        );
        const od = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
            delegate: 'GPU',
          },
          scoreThreshold: 0.4,
          runningMode: 'VIDEO',
        });
        setDetector(od);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── detection loop ──
  useEffect(() => {
    let rafId;
    let lastAction = '';

    const detect = () => {
      const vid = videoRef.current;
      if (detector && active && vid && vid.videoWidth > 0) {
        const result = detector.detectForVideo(vid, performance.now());
        let action = '';

        if (result.detections.length > 0) {
          const box = result.detections[0].boundingBox;
          const pct = (box.width * box.height) / (vid.videoWidth * vid.videoHeight) * 100;
          if (pct >= sensitivity) {
            const cx = (box.originX + box.width / 2) / vid.videoWidth;
            if (cx < 0.33)      action = 'turn_right';
            else if (cx > 0.66) action = 'turn_left';
            else                action = 'stop';
          }
        }

        if (action !== lastAction) {
          lastAction = action;
          if (action) {
            speak(getCommand(action, voice?.lang || 'en-US'));
            setNavState(action);
            if ('vibrate' in navigator)
              navigator.vibrate(action === 'stop' ? [300, 100, 300] : 150);
          } else {
            setNavState('clear');
          }
        }
      }
      rafId = requestAnimationFrame(detect);
    };

    if (active) detect();
    return () => {
      cancelAnimationFrame(rafId);
      window.speechSynthesis.cancel();
    };
  }, [active, detector, voice, sensitivity]);

  // ── toggle camera ──
  const toggleCamera = async () => {
    if (!active) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setActive(true);
            speak('Pony awake!');
          };
        }
      } catch {
        alert("Oops! The Pony's eyes are closed! 🐴");
      }
    } else {
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
      setActive(false);
      setNavState('clear');
    }
  };

  const ui = STATES[navState] || STATES.clear;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sc-root {
          --font-head: 'Fredoka One', cursive;
          --font-body: 'Nunito', sans-serif;
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: var(--font-body);
          transition: background-color .5s ease;
        }

        /* ── HEADER ── */
        .sc-header {
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
        .sc-home-btn {
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
        .sc-home-btn:active { transform: translateY(5px); box-shadow: 0 0 0 #1E3A8A; }
        .sc-header-title {
          flex: 1;
          text-align: center;
          font-family: var(--font-head);
          font-size: 28px;
          color: #78350F;
          letter-spacing: .5px;
        }
        .sc-status-pill {
          padding: 8px 18px;
          border-radius: 50px;
          font-family: var(--font-head);
          font-size: 16px;
          font-weight: 400;
          transition: background .3s, color .3s;
          flex-shrink: 0;
          color: #fff;
        }

        /* ── MAIN ── */
        .sc-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 16px 8px;
          min-height: 0;
        }

        /* ── TV FRAME ── */
        .sc-tv {
          position: relative;
          width: 100%;
          max-width: 860px;
          aspect-ratio: 16/9;
          max-height: 58vh;
          border-radius: 36px;
          border: 10px solid;
          overflow: hidden;
          background: #fff;
          transition: border-color .3s, box-shadow .3s;
        }
        .sc-video {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

        /* overlay bubble */
        .sc-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .sc-bubble {
          width: 130px; height: 130px;
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 68px;
          border: 6px solid transparent;
          animation: sc-pulse .6s ease-in-out infinite alternate;
        }
        @keyframes sc-pulse {
          from { transform: scale(1);    }
          to   { transform: scale(1.12); }
        }

        /* sleeping pony */
        .sc-sleep {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #FFFDE7;
        }
        .sc-sleep-pony {
          font-size: 72px;
          animation: sc-bounce 2s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes sc-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }
        .sc-sleep-label {
          font-family: var(--font-head);
          font-size: 26px;
          color: #78350F;
        }

        /* loading shimmer */
        .sc-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: #FFFDE7;
        }
        .sc-spinner {
          width: 52px; height: 52px;
          border: 6px solid #FDE68A;
          border-top-color: #F59E0B;
          border-radius: 50%;
          animation: sc-spin .8s linear infinite;
        }
        @keyframes sc-spin { to { transform: rotate(360deg); } }
        .sc-loading-label {
          font-family: var(--font-head);
          font-size: 20px;
          color: #92400E;
        }

        /* ── STATUS LABEL ── */
        .sc-action-label {
          font-family: var(--font-head);
          font-size: 32px;
          letter-spacing: 1px;
          margin-top: 10px;
          text-shadow: 2px 2px 0 #fff;
          transition: color .3s;
        }

        /* ── FOOTER ── */
        .sc-footer {
          padding: 10px 20px 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        /* slider */
        .sc-slider-wrap {
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .sc-slider-label {
          font-family: var(--font-head);
          font-size: 16px;
          color: #78350F;
        }
        .sc-slider {
          width: 100%;
          cursor: pointer;
          accent-color: #F59E0B;
          height: 6px;
        }
        .sc-slider-range {
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
          color: #A16207;
        }

        /* start / stop buttons */
        .sc-btn {
          width: 100%;
          max-width: 320px;
          padding: 15px;
          border-radius: 50px;
          border: none;
          font-family: var(--font-head);
          font-size: 22px;
          color: #fff;
          cursor: pointer;
          transition: transform .1s, box-shadow .1s;
        }
        .sc-btn:active { transform: translateY(6px); box-shadow: 0 0 0 transparent !important; }
        .sc-btn-start {
          background: #22C55E;
          box-shadow: 0 7px 0 #15803D;
        }
        .sc-btn-stop {
          background: #EF4444;
          box-shadow: 0 7px 0 #991B1B;
        }
      `}</style>

      <div
        className="sc-root"
        style={{ background: active ? ui.light : '#FFFBEB' }}
      >

        {/* HEADER */}
        <header className="sc-header">
          <Link to="/" className="sc-home-btn">🏠 Home</Link>
          <h1 className="sc-header-title">Pony Safety Cam 🐴</h1>
          <div
            className="sc-status-pill"
            style={{ background: ui.color, boxShadow: `0 4px 0 ${ui.shadow}` }}
          >
            {active ? ui.label : 'Ready'}
          </div>
        </header>

        {/* MAIN */}
        <main className="sc-main">
          <div
            className="sc-tv"
            style={{
              borderColor: active ? ui.color : '#F59E0B',
              boxShadow: `0 10px 0 ${active ? ui.shadow : '#B45309'}`,
            }}
          >
            <video
              ref={videoRef}
              className="sc-video"
              autoPlay
              muted
              playsInline
            />

            {/* loading overlay */}
            {loading && (
              <div className="sc-loading">
                <div className="sc-spinner" />
                <div className="sc-loading-label">Loading Pony Brain…</div>
              </div>
            )}

            {/* sleeping pony (camera off) */}
            {!loading && !active && (
              <div className="sc-sleep">
                <span className="sc-sleep-pony">🐴</span>
                <div className="sc-sleep-label">Wake up Pony!</div>
              </div>
            )}

            {/* alert bubble */}
            {active && navState !== 'clear' && (
              <div className="sc-overlay">
                <div
                  className="sc-bubble"
                  style={{ borderColor: ui.color }}
                >
                  {ui.arrow}
                </div>
              </div>
            )}
          </div>

          {/* action label below frame */}
          <div
            className="sc-action-label"
            style={{ color: ui.color }}
          >
            {active ? ui.label : 'PRESS START TO PLAY'}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="sc-footer">
          <div className="sc-slider-wrap">
            <div className="sc-slider-label">
              Sensor Range:{' '}
              {sensitivity < 10 ? '🔭 Far (Sensitive)' : sensitivity > 25 ? '👁️ Close (Relaxed)' : '🎯 Medium'}
            </div>
            <input
              type="range"
              className="sc-slider"
              min="5"
              max="40"
              step="1"
              value={sensitivity}
              onChange={e => setSensitivity(parseInt(e.target.value, 10))}
            />
            <div className="sc-slider-range">
              <span>Far</span>
              <span>Close</span>
            </div>
          </div>

          <button
            className={`sc-btn ${active ? 'sc-btn-stop' : 'sc-btn-start'}`}
            onClick={toggleCamera}
            disabled={loading}
          >
            {loading ? '⏳ Loading…' : active ? 'Sleep Pony 💤' : 'Start Pony 🚀'}
          </button>
        </footer>

      </div>
    </>
  );
}