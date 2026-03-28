import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from "jspdf";
import { Link } from 'react-router-dom'; // Crucial for moving between pages

function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // --- ORIGINAL STUDY LOGIC ---
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

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        
        {/* Navigation Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <h2 style={{ color: '#1a73e8', margin: 0 }}>HORSE DASH Dashboard</h2>
          <Link to="/safety" style={{ textDecoration: 'none', color: '#ea4335', fontWeight: 'bold', border: '2px solid #ea4335', padding: '5px 15px', borderRadius: '20px' }}>
            🛡️ GO TO SAFETY CAMERA
          </Link>
        </div>

        {/* Study Companion Content (Original) */}
        <div style={{ marginBottom: '20px' }}>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: '10px' }} />
          {image && <img src={image} alt="Preview" style={{ width: '100%', borderRadius: '10px', marginBottom: '15px', maxHeight: '200px', objectFit: 'contain' }} />}
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask your AI Study Companion..."
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <button onClick={() => callAI('chat')} disabled={loading} style={{ padding: '12px 24px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Ask</button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => callAI('quiz')} style={{ flex: 1, padding: '12px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✨ Generate Quiz</button>
            <button onClick={saveAsPDF} style={{ flex: 1, padding: '12px', backgroundColor: '#5f6368', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>📄 Save PDF</button>
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '2px solid #f0f2f5', backgroundColor: '#fafafa', borderRadius: '8px' }}>
          <ReactMarkdown>{response || "Your study notes and quiz will appear here."}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;