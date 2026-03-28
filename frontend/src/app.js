import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SafetyCamera from './pages/SafetyCamera';
import GameMode from './pages/GameMode';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/safety" element={<SafetyCamera />} />
        {/* This path MUST match the 'to' property in your Dashboard Link */}
        <Route path="/game" element={<GameMode />} /> 
      </Routes>
    </Router>
  );
}

export default App;