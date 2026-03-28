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
    if (!prompt && !image) return alert("Please enter a question or upload a photo!");
    setLoading(true);
    setResponse(mode === 'quiz' ? '🧠 Preparing your quiz...' : 'Thinking...');
    
    try {
      const res = await axios.post('http://localhost:5000/api/chat', { 
        prompt, image, mode 
      });
      setResponse(res.data.text);
    } catch (err) {
      setResponse("❌ Connection Error. Is your backend server running?");
    } finally {
      setLoading(false);
    }
  };

  const saveAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Roadie Study Session", 10, 10);
    doc.setFontSize(12);
    doc.text(doc.splitTextToSize(response.replace(/[#*`]/g, ''), 180), 10, 20);
    doc.save("roadie-notes.pdf");
  };

  // --- CATEGORY CONFIGURATION ---
  const categories = [
    { title: "Collision", to: "/safety", icon: "🛡️", color: "#FF8A65" },
    { title: "Horns", to: "/horns", icon: "🎺", color: "#BA68C8" },
    { title: "Discover", to: "/discover", icon: "🔍", color: "#4FC3F7" },
    { title: "Minigames", to: "/game", icon: "🎮", color: "#81C784" }, // Fixed Path
    { title: "Themes", to: "/themes", icon: "🎨", color: "#FFD54F" },
    { title: "Map", to: "/map", icon: "🗺️", color: "#90A4AE" },
  ];

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        
        {/* Header Section */}
        <header style={headerStyle}>
          <h1 style={titleStyle}>Roadie Dashboard</h1>
          <p style={subtitleStyle}>Interactive Learning + Fun Tools</p>
        </header>

        {/* Apps Grid */}
        <section style={gridStyle}>
          {categories.map((cat) => (
            <Link key={cat.title} to={cat.to} style={cardStyle(cat.color)}>
              <div style={iconStyle}>{cat.icon}</div>
              <div style={cardTitleStyle}>{cat.title}</div>
            </Link>
          ))}
        </section>

        {/* AI Assistant Section */}
        <section style={aiSectionStyle}>
          <h2 style={sectionTitleStyle}>✨ AI Study Companion</h2>
          
          <div style={uploadBoxStyle}>
            <label style={uploadLabel}>
              {image ? "📸 Image Ready!" : "📁 Upload a Study Image"}
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {image && <img src={image} alt="Preview" style={previewImageStyle} />}
          </div>

          <div style={inputGroupStyle}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask your Roadie assistant a question..."
              style={inputStyle}
            />
            <button 
              onClick={() => callAI('chat')} 
              disabled={loading} 
              style={askButtonStyle(loading)}
            >
              {loading ? "..." : "Ask"}
            </button>
          </div>

          <div style={actionButtonGroup}>
            <button onClick={() => callAI('quiz')} style={secondaryButtonStyle}>📝 Generate Quiz</button>
            <button onClick={saveAsPDF} style={secondaryButtonStyle}>📥 Save as PDF</button>
          </div>

          <div style={responseAreaStyle}>
            <ReactMarkdown>
              {response || "Your AI notes, quizzes, and answers will appear here. Try uploading a diagram or asking a math question!"}
            </ReactMarkdown>
          </div>
        </section>

      </div>
    </div>
  );
}

// --- STYLES ---

const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  padding: '40px 20px',
  fontFamily: '"Segoe UI", Roboto, Helvetica, sans-serif',
};

const contentWrapper = {
  maxWidth: '900px',
  margin: '0 auto',
};

const headerStyle = {
  marginBottom: '40px',
  textAlign: 'center',
};

const titleStyle = {
  fontSize: '42px',
  fontWeight: '900',
  color: '#2c3e50',
  margin: '0 0 10px 0',
  letterSpacing: '-1px',
};

const subtitleStyle = {
  fontSize: '18px',
  color: '#7f8c8d',
  margin: 0,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '50px',
};

const cardStyle = (color) => ({
  textDecoration: 'none',
  padding: '30px',
  backgroundColor: '#fff',
  borderRadius: '24px',
  border: '1px solid #eee',
  textAlign: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
  borderBottom: `6px solid ${color}`,
});

const iconStyle = {
  fontSize: '40px',
  marginBottom: '10px',
};

const cardTitleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#34495e',
};

const aiSectionStyle = {
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '32px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
  border: '1px solid #f1f1f1',
};

const sectionTitleStyle = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#1a73e8',
  marginTop: 0,
  marginBottom: '25px',
};

const uploadBoxStyle = {
  marginBottom: '20px',
  textAlign: 'center',
};

const uploadLabel = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#f1f3f4',
  color: '#5f6368',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  border: '2px dashed #dadce0',
};

const previewImageStyle = {
  display: 'block',
  width: '100%',
  maxWidth: '300px',
  margin: '15px auto 0',
  borderRadius: '12px',
  maxHeight: '200px',
  objectFit: 'contain',
};

const inputGroupStyle = {
  display: 'flex',
  gap: '12px',
  marginBottom: '15px',
};

const inputStyle = {
  flex: 1,
  padding: '16px',
  borderRadius: '16px',
  border: '1px solid #dadce0',
  fontSize: '16px',
  outline: 'none',
};

const askButtonStyle = (loading) => ({
  padding: '0 30px',
  backgroundColor: loading ? '#ccc' : '#1a73e8',
  color: '#fff',
  border: 'none',
  borderRadius: '16px',
  fontWeight: 'bold',
  cursor: loading ? 'default' : 'pointer',
  transition: 'background 0.2s',
});

const actionButtonGroup = {
  display: 'flex',
  gap: '12px',
  marginBottom: '30px',
};

const secondaryButtonStyle = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#f8f9fa',
  color: '#3c4043',
  border: '1px solid #dadce0',
  borderRadius: '12px',
  fontWeight: '600',
  cursor: 'pointer',
};

const responseAreaStyle = {
  padding: '25px',
  backgroundColor: '#fdfdfd',
  borderRadius: '20px',
  border: '1px solid #f1f1f1',
  color: '#2c3e50',
  lineHeight: '1.6',
};

export default Dashboard;