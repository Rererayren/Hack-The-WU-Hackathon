import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

function SafetyCamera() {
  const videoRef = useRef(null);
  const [active, setActive] = useState(false);
  const [detector, setDetector] = useState(null);
  const [navigation, setNavigation] = useState({ state: 'clear', action: '' });

  // Sensitivity Slider State
  const [sensitivity, setSensitivity] = useState(15); 

  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const markIndex = availableVoices.findIndex(v => v.name.includes("Microsoft Mark"));
      
      if (markIndex !== -1) {
        setSelectedVoiceIndex(markIndex);
      } else {
        const fallback = availableVoices.findIndex(v => v.name.includes("Google") || v.name.includes("Natural"));
        if (fallback !== -1) setSelectedVoiceIndex(fallback);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
      utterance.lang = voices[selectedVoiceIndex].lang;
    }
    utterance.rate = 1.0; 
    utterance.pitch = 1.2; 
    window.speechSynthesis.speak(utterance);
  };

  const getCommand = (actionToTake, langCode) => {
    const isSpanish = langCode.startsWith('es');
    const isFrench = langCode.startsWith('fr');

    if (actionToTake === 'TURN_RIGHT') {
      if (isSpanish) return "¡Gira a la derecha!";
      if (isFrench) return "Tourne à droite !";
      return "Turn right!";
    }
    if (actionToTake === 'TURN_LEFT') {
      if (isSpanish) return "¡Gira a la izquierda!";
      if (isFrench) return "Tourne à gauche !";
      return "Turn left!";
    }
    if (actionToTake === 'STOP') {
      if (isSpanish) return "¡Alto ahí!";
      if (isFrench) return "Arrête-toi !";
      return "Stop! Stop! Stop!";
    }
    return ""; // Silence when clear!
  };

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

  useEffect(() => {
    let animationFrameId;
    let lastAction = '';

    const detect = () => {
      if (detector && active && videoRef.current && videoRef.current.videoWidth > 0) {
        const detections = detector.detectForVideo(videoRef.current, performance.now());
        
        let requiredAction = '';

        if (detections.detections.length > 0) {
          const box = detections.detections[0].boundingBox;
          const objectArea = box.width * box.height;
          const screenArea = videoRef.current.videoWidth * videoRef.current.videoHeight;
          const objectSizePercent = (objectArea / screenArea) * 100;

          if (objectSizePercent >= sensitivity) {
            const centerX = (box.originX + box.width / 2) / videoRef.current.videoWidth;
            
            if (centerX < 0.33) requiredAction = 'TURN_RIGHT';
            else if (centerX > 0.66) requiredAction = 'TURN_LEFT';
            else requiredAction = 'STOP';
          }
        }

        if (requiredAction !== lastAction) {
          if (requiredAction !== '') {
            // WE HAVE A THREAT: Speak and Vibrate!
            const lang = voices[selectedVoiceIndex]?.lang || 'en-US';
            speak(getCommand(requiredAction, lang));
            setNavigation({ state: 'alert', action: requiredAction });
            if ("vibrate" in navigator) {
              navigator.vibrate(requiredAction === 'STOP' ? [300, 100, 300] : 150);
            }
          } else {
            // PATH IS CLEAR: Total Silence! Just update the visual state.
            setNavigation({ state: 'clear', action: '' });
          }
          lastAction = requiredAction;
        }
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    if (active) detect();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.speechSynthesis.cancel();
    };
  }, [active, detector, voices, selectedVoiceIndex, sensitivity]);

  const toggleCamera = async () => {
    if (!active) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setActive(true);
            // Just a quick startup chime to let them know the speaker works!
            speak("Pony awake!"); 
          };
        }
      } catch (err) { alert("Oops! The Pony's eyes are closed! 🐴"); }
    } else {
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
      setActive(false);
      setNavigation({ state: 'clear', action: '' });
    }
  };

  const getKidUI = () => {
    if (navigation.action === 'TURN_RIGHT') return { color: '#29B6F6', arrow: '👉', msg: 'TURN RIGHT!' };
    if (navigation.action === 'TURN_LEFT') return { color: '#29B6F6', arrow: '👈', msg: 'TURN LEFT!' };
    if (navigation.action === 'STOP') return { color: '#EF5350', arrow: '🛑', msg: 'STOP!' };
    return { color: '#66BB6A', arrow: '🌟', msg: 'ALL CLEAR!' };
  };

  const ui = getKidUI();

  return (
    <div style={{...containerStyle, backgroundColor: active ? '#E3F2FD' : '#FFF9C4'}}>
      <div style={headerStyle}>
        <Link to="/" style={homeBtnStyle}>🏠 HOME</Link>
        <div style={voicePickerStyle}>
          <span style={{fontSize: '10px', fontWeight: 'bold', color: '#5D4037'}}>VOICE: </span>
          <select 
            style={selectStyle}
            value={selectedVoiceIndex} 
            onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
          >
            {voices.map((v, i) => (
              <option key={i} value={i}>{v.name} {v.name.includes("Mark") ? "(Default)" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={mainStyle}>
        <div style={{...tvFrameStyle, borderColor: active ? ui.color : '#FFCA28', boxShadow: `0 10px 0 ${active ? ui.color + '88' : '#FFB300'}`}}>
          <video ref={videoRef} autoPlay muted playsInline style={videoStyle} />
          
          {active && navigation.action !== '' && (
            <div style={overlayStyle}>
              <div style={giantBubbleStyle(ui.color)}>
                <span style={{fontSize: '70px'}}>{ui.arrow}</span>
              </div>
            </div>
          )}

          {!active && (
            <div style={sleepingPonyStyle}>
              <div style={{fontSize: '70px', animation: 'bounce 2s infinite'}}>🐴</div>
              <h1 style={{color: '#5D4037', margin: '5px 0', fontSize: '24px'}}>Wake up Pony!</h1>
            </div>
          )}
        </div>
        
        <div style={{...instructionTextStyle, color: active ? ui.color : '#FFCA28'}}>
          {active ? ui.msg : "PRESS START TO PLAY"}
        </div>
      </div>

      <div style={footerStyle}>
        <div style={sliderContainerStyle}>
          <label style={sliderLabelStyle}>
            Sensor Range: {sensitivity < 10 ? "Far (Sensitive)" : sensitivity > 25 ? "Close (Relaxed)" : "Medium"}
          </label>
          <input 
            type="range" 
            min="5" 
            max="40" 
            value={sensitivity} 
            onChange={(e) => setSensitivity(parseInt(e.target.value))}
            style={sliderInputStyle}
          />
        </div>

        <button onClick={toggleCamera} style={active ? stopBtnStyle : startBtnStyle}>
          {active ? "SLEEP PONY 💤" : "START PONY 🚀"}
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'background-color 0.5s', fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', boxSizing: 'border-box' };
const headerStyle = { padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '0 0 20px 20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', zIndex: 10 };
const homeBtnStyle = { background: '#FF7043', padding: '8px 15px', borderRadius: '15px', textDecoration: 'none', color: 'white', fontWeight: '900', fontSize: '14px', boxShadow: '0 4px 0 #D84315' };
const voicePickerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };
const selectStyle = { padding: '5px', borderRadius: '10px', border: '2px solid #E0E0E0', fontSize: '12px', fontWeight: 'bold', outline: 'none', cursor: 'pointer', maxWidth: '140px' };
const mainStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px', minHeight: 0 };
const tvFrameStyle = { position: 'relative', width: '100%', maxWidth: '850px', maxHeight: '60vh', aspectRatio: '16/9', borderRadius: '40px', border: '12px solid', overflow: 'hidden', backgroundColor: 'white', transition: 'all 0.3s ease', boxSizing: 'border-box' };
const videoStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const overlayStyle = { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const giantBubbleStyle = (color) => ({ width: '120px', height: '120px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `6px solid ${color}`, boxShadow: `0 8px 15px rgba(0,0,0,0.2)` });
const sleepingPonyStyle = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#FFFDE7' };
const instructionTextStyle = { fontSize: '30px', fontWeight: '900', margin: '5px 0', textShadow: '2px 2px 0px white', textAlign: 'center', letterSpacing: '1px' };

const footerStyle = { padding: '10px 15px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const sliderContainerStyle = { width: '100%', maxWidth: '300px', marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const sliderLabelStyle = { fontSize: '14px', fontWeight: 'bold', color: '#5D4037', marginBottom: '5px' };
const sliderInputStyle = { width: '100%', cursor: 'pointer', accentColor: '#FF7043' };

const startBtnStyle = { width: '100%', maxWidth: '300px', padding: '15px', borderRadius: '30px', border: 'none', background: '#66BB6A', color: 'white', fontSize: '22px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 6px 0 #388E3C', transition: 'transform 0.1s' };
const stopBtnStyle = { width: '100%', maxWidth: '300px', padding: '15px', borderRadius: '30px', border: 'none', background: '#EF5350', color: 'white', fontSize: '22px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 6px 0 #C62828', transition: 'transform 0.1s' };

export default SafetyCamera;