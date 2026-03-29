import React, { useState, useRef, useEffect } from 'react';

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // Track the current animation so we can cancel it if they mash the button
  const fadeAnimationRef = useRef(null);

  useEffect(() => {
    // --- SMOOTH FADER ENGINE (Now Crash-Proof!) ---
    const fadeVolume = (targetVolume, durationMs) => {
      if (!audioRef.current) return;
      
      // 1. Cancel any fading that is currently happening
      if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);

      const audio = audioRef.current;
      const startVol = audio.volume;
      const volChange = targetVolume - startVol;
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        
        // Calculate the new volume
        let calculatedVolume = startVol + (volChange * progress);
        
        // ✨ THE FIX: Clamp the volume strictly between 0.0 and 1.0!
        calculatedVolume = Math.max(0, Math.min(1, calculatedVolume));
        
        // Apply the safe volume
        audio.volume = calculatedVolume;
        
        if (progress < 1) {
          fadeAnimationRef.current = requestAnimationFrame(animate);
        }
      };
      
      fadeAnimationRef.current = requestAnimationFrame(animate);
    };

    const duckAudio = () => fadeVolume(0.02, 300); 
    const unduckAudio = () => fadeVolume(1.0, 800);

    window.addEventListener('pony-speak-start', duckAudio);
    window.addEventListener('pony-speak-end', unduckAudio);

    return () => {
      window.removeEventListener('pony-speak-start', duckAudio);
      window.removeEventListener('pony-speak-end', unduckAudio);
      if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);
    };
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Autoplay blocked", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={floatingContainerStyle}>
      <audio ref={audioRef} src="/theme-song.mp3" loop />
      <button onClick={toggleMusic} style={buttonStyle(isPlaying)}>
        {isPlaying ? '⏸️ Music On' : '🎵 Music Off'}
      </button>
    </div>
  );
}

// --- STYLES ---
const floatingContainerStyle = { position: 'fixed', top: '20px', right: '20px', zIndex: 9999 };

const buttonStyle = (isPlaying) => ({
  backgroundColor: isPlaying ? '#FFCA28' : '#E0E0E0',
  color: '#5D4037',
  border: isPlaying ? '4px solid #FFB300' : '4px solid #BDBDBD',
  borderRadius: '30px',
  padding: '10px 20px',
  fontSize: '16px',
  fontWeight: '900',
  fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
  cursor: 'pointer',
  boxShadow: isPlaying ? '0 4px 0 #FF8F00' : '0 4px 0 #9E9E9E',
  transform: isPlaying ? 'rotate(2deg)' : 'none',
  transition: 'all 0.2s ease',
});

export default MusicPlayer;