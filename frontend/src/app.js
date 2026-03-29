import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import SafetyCamera from './pages/SafetyCamera';
import GameMode from './pages/GameMode';
import MapPage from './pages/MapPage';
import SoundBoard from './pages/SoundBoard';
import MusicPlayer from './components/MusicPlayer';
import WalkieTalkie from './pages/WalkieTalkie';

function App() {
  return (
    <Router>
      <MusicPlayer />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/safety" element={<SafetyCamera />} />
        <Route path="/game" element={<GameMode />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/horns" element={<SoundBoard />} />
        <Route path="/themes" element={<WalkieTalkie />} />
      </Routes>
    </Router>
  );
}

export default App;