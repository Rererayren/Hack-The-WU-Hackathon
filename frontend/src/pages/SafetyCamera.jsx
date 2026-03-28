import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

function SafetyCamera() {
  const videoRef = useRef(null);
  const [active, setActive] = useState(false);
  const [detector, setDetector] = useState(null);
  const [navigation, setNavigation] = useState({ state: 'clear', dir: '' });

  // --- VOICE & LANGUAGE STATE ---
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);

  // 1. Load System Voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for common languages or just show all
      setVoices(availableVoices);
      
      // Default to a friendly sounding voice if possible
      const preferred = availableVoices.findIndex(v => v.name.includes("Google") || v.name.includes("Natural"));
      if (preferred !== -1) setSelectedVoiceIndex(preferred);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // 2. The Speaking Function
  const speak = (text) => {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
      utterance.lang = voices[selectedVoiceIndex].lang;
    }

    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  // 3. Translation Helper (Simple Map)
  const getCommand = (direction, langCode) => {
    const isSpanish = langCode.startsWith('es');
    const isFrench = langCode.startsWith('fr');

    if (direction === 'LEFT') {
      if (isSpanish) return "Objeto a la izquierda. Muévete a la derecha.";
      if (isFrench) return "Objet à gauche. Allez à droite.";
      return "Move right.";
    }
    if (direction === 'RIGHT') {
      if (isSpanish) return "Objeto a la derecha. Muévete a la izquierda.";
      if (isFrench) return "Objet à droite. Allez à gauche.";
      return "Move left.";
    }
    if (direction === 'CENTER') {
      if (isSpanish) return "¡Peligro al frente! Detente.";
      if (isFrench) return "Danger devant ! Arrêtez-vous.";
      return "Stop.";
    }
    return isSpanish ? "Camino despejado." : isFrench ? "Chemin libre." : "Path is clear.";
  };

  // 4. Initialize MediaPipe
  useEffect(() => {
    const initDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm");
      const objectDetector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
          delegate: "GPU"
        },
        scoreThreshold: 0.4,
        runningMode: "VIDEO"
      });
      setDetector(objectDetector);
    };
    initDetector();
  }, []);

  // 5. Detection Loop
  useEffect(() => {
    let animationFrameId;
    let lastSpokenDir = '';

    const detect = () => {
      if (detector && active && videoRef.current?.readyState === 4) {
        const detections = detector.detectForVideo(videoRef.current, performance.now());
        
        if (detections.detections.length > 0) {
          const box = detections.detections[0].boundingBox;
          const centerX = (box.originX + box.width / 2) / videoRef.current.videoWidth;
          
          let currentDir = '';
          if (centerX < 0.33) currentDir = 'LEFT';
          else if (centerX > 0.66) currentDir = 'RIGHT';
          else currentDir = 'CENTER';

          if (currentDir !== lastSpokenDir) {
            const lang = voices[selectedVoiceIndex]?.lang || 'en-US';
            speak(getCommand(currentDir, lang));
            setNavigation({ state: 'alert', dir: currentDir });
            
            if ("vibrate" in navigator) {
              navigator.vibrate(currentDir === 'CENTER' ? [400, 100, 400] : 200);
            }
          }
          lastSpokenDir = currentDir;
        } else if (lastSpokenDir !== '') {
          const lang = voices[selectedVoiceIndex]?.lang || 'en-US';
          speak(getCommand('CLEAR', lang));
          setNavigation({ state: 'clear', dir: '' });
          lastSpokenDir = '';
        }
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    if (active) detect();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.speechSynthesis.cancel();
    };
  }, [active, detector, voices, selectedVoiceIndex]);

  const toggleCamera = async () => {
    if (!active) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setActive(true);
        speak("Navigation started.");
      } catch (err) { alert("Camera access needed! 🐴"); }
    } else {
      videoRef.current.srcObject?.getTracks().forEach(t => t.stop());
      setActive(false);
      setNavigation({ state: 'clear', dir: '' });
    }
  };

  const ui = navigation.dir === 'LEFT' ? { color: '#FF9800', arrow: '👉', text: 'MOVE RIGHT' } :
             navigation.dir === 'RIGHT' ? { color: '#FF9800', arrow: '👈', text: 'MOVE LEFT' } :
             navigation.dir === 'CENTER' ? { color: '#f44336', arrow: '🛑', text: 'STOP!' } :
             { color: '#4CAF50', arrow: '✅', text: 'CLEAR' };

  return (
    <div style={container}>
      {/* Header with Voice Picker */}
      <div style={header}>
        <Link to="/" style={btnBack}>⬅ BACK</Link>
        <div style={pickerWrapper}>
          <span style={pickerLabel}>Language/Voice:</span>
          <select 
            style={selectStyle}
            value={selectedVoiceIndex} 
            onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
          >
            {voices.map((v, i) => (
              <option key={i} value={i}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={main}>
        <div style={{...frame, borderColor: ui.color}}>
          <video ref={videoRef} autoPlay muted playsInline style={video} />
          {active && (
            <div style={overlay}>
              <div style={arrowCircle(ui.color)}>{ui.arrow}</div>
            </div>
          )}
          {!active && <div style={center}>🐴<br/>Select a voice and press Start</div>}
        </div>
        <div style={{marginTop: '10px', fontWeight: 'bold', color: ui.color}}>{ui.text}</div>
      </div>

      <div style={footer}>
        <button onClick={toggleCamera} style={active ? btnStop : btnStart}>
          {active ? "STOP NAV" : "START NAV"}
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const container = { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', fontFamily: 'sans-serif' };
const header = { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' };
const btnBack = { background: '#f5f5f5', padding: '8px 15px', borderRadius: '10px', textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' };
const pickerWrapper = { textAlign: 'right', flex: 1, marginLeft: '20px' };
const pickerLabel = { fontSize: '11px', display: 'block', color: '#888', marginBottom: '2px' };
const selectStyle = { width: '100%', maxWidth: '200px', padding: '5px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px' };
const main = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' };
const frame = { position: 'relative', width: '100%', maxWidth: '500px', aspectRatio: '4/3', borderRadius: '35px', border: '10px solid', overflow: 'hidden', transition: 'all 0.3s' };
const video = { width: '100%', height: '100%', objectFit: 'cover' };
const overlay = { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const center = { textAlign: 'center', fontSize: '20px', color: '#aaa' };
const arrowCircle = (color) => ({ width: '120px', height: '120px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '70px', boxShadow: `0 0 30px ${color}`, border: `4px solid ${color}` });
const footer = { padding: '30px', textAlign: 'center' };
const btnStart = { width: '100%', maxWidth: '280px', padding: '18px', borderRadius: '25px', border: 'none', background: '#4CAF50', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 0 #2E7D32' };
const btnStop = { width: '100%', maxWidth: '280px', padding: '18px', borderRadius: '25px', border: 'none', background: '#f44336', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 0 #d32f2f' };

export default SafetyCamera;