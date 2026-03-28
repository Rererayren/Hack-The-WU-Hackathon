import React, { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from "jspdf";

function App() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const videoRef = useRef(null);

  // --- WEBCAM LOGIC ---
  const toggleWebcam = async () => {
    if (!webcamActive) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setWebcamActive(true);
    } else {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      setWebcamActive(false);
    }
  };

  const captureFrame = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const frame = canvas.toDataURL("image/jpeg");
    setImage(frame);
    return frame;
  };

  // --- AI LOGIC ---
  const callAI = async (mode, customImage = null) => {
    const activeImage = customImage || image;
    setLoading(true);
    setResponse('AI is thinking...');

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { 
        prompt, image: activeImage, mode 
      });
      setResponse(res.data.text);
    } catch (err) {
      setResponse("❌ Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  // --- UTILITIES ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    const text = response.replace(/[#*`]/g, '');
    doc.text("Study Session Summary", 10, 10);
    doc.text(doc.splitTextToSize(text, 180), 10, 20);
    doc.save("study-notes.pdf");
  };

  const speak = () => {
    const speech = new SpeechSynthesisUtterance(response.replace(/[#*`]/g, ''));
    window.speechSynthesis.speak(speech);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1a73e8' }}>AI Study Companion 🎓</h1>

      {/* WEBCAM SECTION */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button onClick={toggleWebcam} style={btnStyle}>{webcamActive ? "Turn Off Camera" : "Start Study Cam"}</button>
        <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: '10px', marginTop: '10px', display: webcamActive ? 'block' : 'none' }} />
        {webcamActive && <button onClick={() => callAI('detect', captureFrame())} style={{...btnStyle, backgroundColor: '#ea4335'}}>Detect Object Collision</button>}
      </div>

      {/* UPLOAD & INPUT */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Ask a question..." value={prompt} onChange={e => setPrompt(e.target.value)} style={{ flex: 1, padding: '10px' }} />
        <button onClick={() => callAI('chat')} disabled={loading} style={btnStyle}>Ask</button>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => callAI('quiz')} style={{...btnStyle, backgroundColor: '#34a853'}}>✨ Magic Quiz</button>
        <button onClick={speak} style={{...btnStyle, backgroundColor: '#f4b400'}}>🔊 Read Aloud</button>
        <button onClick={downloadPDF} style={{...btnStyle, backgroundColor: '#5f6368'}}>📄 Save PDF</button>
      </div>

      {/* RESPONSE AREA */}
      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '1px solid #ddd' }}>
        <ReactMarkdown>{response || "Welcome! Use the tools above to start studying."}</ReactMarkdown>
      </div>
    </div>
  );
}

const btnStyle = { padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#4285f4', color: 'white', fontWeight: 'bold' };

export default App;