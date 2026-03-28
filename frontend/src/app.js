import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Added for pretty formatting

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testGemini = async () => {
    if (!prompt) return alert("Type something first!");
    setLoading(true);
    setResponse('Searching notes...');

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { prompt });
      setResponse(res.data.text);
    } catch (err) {
      setResponse("❌ Error connecting to the study engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#1a73e8', textAlign: 'center' }}>AI Study Companion</h1>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question about your notes..."
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <button 
            onClick={testGemini} 
            disabled={loading}
            style={{ padding: '12px 24px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>

        <div style={{ padding: '20px', borderTop: '2px solid #f0f2f5', lineHeight: '1.6' }}>
          {/* ReactMarkdown makes the AI's response look professional (bold, lists, etc) */}
          <ReactMarkdown>{response || "Your AI tutor is ready. Ask anything!"}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default App;