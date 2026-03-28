import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SafetyCamera from './pages/SafetyCamera';
import GameMode from './pages/GameMode'; // New Import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/safety" element={<SafetyCamera />} />
        <Route path="/game" element={<GameMode />} /> {/* New Route */}
      </Routes>
    </Router>
  );
}

export default App;