import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function SafetyCamera() {
  const videoRef = useRef(null);
  const [webcamActive, setWebcamActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please allow camera access!");
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
      <Link to="/" style={{ color: '#1a73e8', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Dashboard</Link>
      
      <h1 style={{ marginTop: '20px' }}>Safety Camera Mode</h1>
      <p>AI Collision Detection (Standby)</p>

      <div style={{ maxWidth: '700px', margin: '20px auto', background: '#000', borderRadius: '15px', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay style={{ width: '100%' }} />
      </div>

      {!webcamActive && (
        <button 
          onClick={startCamera}
          style={{ padding: '12px 24px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Enable Webcam
        </button>
      )}
    </div>
  );
}

export default SafetyCamera;