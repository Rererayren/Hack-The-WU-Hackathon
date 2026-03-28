import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function SafetyCamera() {
  const videoRef = useRef(null);
  const [active, setActive] = useState(false);

  const toggleCamera = async () => {
    if (!active) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setActive(true);
        }
      } catch (err) {
        alert("The Pony needs to see! Please turn on the camera. 🐴");
      }
    } else {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
      setActive(false);
    }
  };

  return (
    <div style={simpleContainer}>
      {/* 1. Header - Just one big back button */}
      <div style={simpleHeader}>
        <Link to="/" style={goBackButton}>⬅ BACK</Link>
        <div style={statusDot(active)}>
          {active ? "Pony is Awake! ✨" : "Pony is Sleeping 💤"}
        </div>
      </div>

      {/* 2. The Viewing Area */}
      <div style={cameraArea}>
        <div style={roundedFrame(active)}>
          <video 
            ref={videoRef} 
            autoPlay 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              display: active ? 'block' : 'none',
              borderRadius: '30px'
            }} 
          />

          {!active && (
            <div style={centerContent}>
              <div style={bigEmoji}>🐴</div>
              <h2 style={{ color: '#5D4037' }}>Ready to See?</h2>
            </div>
          )}
        </div>
      </div>

      {/* 3. The Only Button You Need */}
      <div style={actionArea}>
        <button 
          onClick={toggleCamera} 
          style={active ? stopBtn : startBtn}
        >
          {active ? "STOP PONY" : "START PONY"}
        </button>
      </div>
    </div>
  );
}

// --- CLEAN & SIMPLE STYLES ---

const simpleContainer = {
  backgroundColor: '#E8F5E9', // Soft Green
  height: '100vh',
  fontFamily: 'sans-serif',
  display: 'flex',
  flexDirection: 'column',
};

const simpleHeader = {
  padding: '15px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'white',
};

const goBackButton = {
  backgroundColor: '#f44336',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '10px',
  textDecoration: 'none',
  fontWeight: 'bold',
};

const statusDot = (active) => ({
  fontWeight: 'bold',
  color: active ? '#4CAF50' : '#9E9E9E',
});

const cameraArea = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
};

const roundedFrame = (active) => ({
  width: '100%',
  maxWidth: '600px',
  aspectRatio: '4/3',
  backgroundColor: 'white',
  borderRadius: '40px',
  border: `8px solid ${active ? '#4CAF50' : '#E0E0E0'}`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
});

const centerContent = { textAlign: 'center' };
const bigEmoji = { fontSize: '100px' };

const actionArea = {
  padding: '30px',
  textAlign: 'center',
};

const startBtn = {
  width: '100%',
  maxWidth: '300px',
  padding: '20px',
  fontSize: '24px',
  fontWeight: 'bold',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  boxShadow: '0 6px 0px #388E3C',
};

const stopBtn = {
  width: '100%',
  maxWidth: '300px',
  padding: '20px',
  fontSize: '24px',
  fontWeight: 'bold',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  boxShadow: '0 6px 0px #d32f2f',
};

export default SafetyCamera;