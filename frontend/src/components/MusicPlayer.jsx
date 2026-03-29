import React, { useState, useRef, useEffect } from 'react';

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // --- SMOOTH FADER ENGINE ---
    const fadeVolume = (targetVolume, durationMs) => {
      if (!audioRef.current) return;
      const audio = audioRef.current;
      const startVol = audio.volume;
      const volChange = targetVolume - startVol;
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        
        // Slide the volume smoothly based on how much time has passed
        audio.volume = startVol + (volChange * progress);
        
        // Keep animating until we hit the target time
        if (progress < 1) requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    };

    // Fast fade out to 2% volume (takes 300 milliseconds)
    const duckAudio = () => fadeVolume(0.02, 300); 
    
    // Slow, gentle fade back in to 100% volume (takes 800 milliseconds)
    const unduckAudio = () => fadeVolume(1.0, 800);

    // Listen for the custom "Pony" events from your SoundBoard
    window.addEventListener('pony-speak-start', duckAudio);
    window.addEventListener('pony-speak-end', unduckAudio);

    return () => {
      window.removeEventListener('pony-speak-start', duckAudio);
      window.removeEventListener('pony-speak-end', unduckAudio);
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