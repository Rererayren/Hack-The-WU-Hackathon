import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from "jspdf";
import { Link } from 'react-router-dom';

function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // --- AI LOGIC ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const callAI = async (mode = 'chat') => {
    setLoading(true);
    setResponse(mode === 'quiz' ? '🧠 Generating quiz...' : 'Thinking...');
    try {
      const res = await axios.post('http://localhost:5000/api/chat', { 
        prompt, image, mode 
      });
      setResponse(res.data.text);
    } catch (err) {
      setResponse("❌ Backend Error. Is server.js running?");
    } finally {
      setLoading(false);
    }
  };

  const saveAsPDF = () => {
    const doc = new jsPDF();
    doc.text("Study Session", 10, 10);
    doc.text(doc.splitTextToSize(response.replace(/[#*`]/g, ''), 180), 10, 20);
    doc.save("notes.pdf");
  };

  // --- SIMPLE CATEGORY CARDS (no components needed) ---
  const categories = [
    { title: "Collision", to: "/collision" },
    { title: "Horns", to: "/horns" },
    { title: "Discover", to: "/discover" },
    { title: "Minigames", to: "/minigames" },
    { title: "Themes", to: "/themes" },
    { title: "Map", to: "/map" },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>Roadie Dashboard</h1>
          <p style={{ color: '#666' }}>Interactive Learning + Tools</p>
        </div>

        {/* CATEGORY GRID (from vibecode idea) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={cat.to}
              style={{
                textDecoration: 'none',
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #ddd',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#333',
                transition: '0.2s'
              }}
            >
              {cat.title}
            </Link>
          ))}
        </div>

        {/* YOUR ORIGINAL AI TOOL */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '15px' }}>
          
          <input type="file" accept="image/*" onChange={handleImageChange} />

          {image && (
            <img
              src={image}
              alt="Preview"
              style={{
                width: '100%',
                marginTop: '10px',
                borderRadius: '10px',
                maxHeight: '200px',
                objectFit: 'contain'
              }}
            />
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask your AI Study Companion..."
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
            />

            <button onClick={() => callAI('chat')} disabled={loading}>
              Ask
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={() => callAI('quiz')}>
              Generate Quiz
            </button>

            <button onClick={saveAsPDF}>
              Save PDF
            </button>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#fafafa',
            borderRadius: '10px'
          }}>
            <ReactMarkdown>
              {response || "Your study notes and quiz will appear here."}
            </ReactMarkdown>
          </div>
        </div>

        {/* NAV BUTTON (kept from your original) */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/safety">🛡️ Go to Safety Camera</Link>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;