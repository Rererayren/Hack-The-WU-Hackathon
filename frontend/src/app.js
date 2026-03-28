import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SafetyCamera from './pages/SafetyCamera';

function App() {
  return (
    <Router>
      <Routes>
        {/* This is your original study guide page */}
        <Route path="/" element={<Dashboard />} /> 
        {/* This is your new safety camera page */}
        <Route path="/safety" element={<SafetyCamera />} />
      </Routes>
    </Router>
  );
}

export default App;