import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- DATA: The Sound Categories ---
const soundCategories = {
  discover: {
    title: "ABCs & Animals",
    color: '#FFB74D', // Orange
    items: [
      { icon: '🍎', label: 'Apple', sound: 'A is for Apple. Ah, ah, Apple!' },
      { icon: '🐻', label: 'Bear', sound: 'B is for Bear. Buh, buh, Bear!' },
      { icon: '🚗', label: 'Car', sound: 'C is for Car. Vroom vroom!' },
      { icon: '🐶', label: 'Dog', sound: 'D is for Dog. Woof woof!' },
      { icon: '🐘', label: 'Elephant', sound: 'E is for Elephant. Eh, eh, Elephant!' },
      { icon: '🐸', label: 'Frog', sound: 'F is for Frog. Ribbit ribbit!' },
      { icon: '🦒', label: 'Giraffe', sound: 'G is for Giraffe. Guh, guh, Giraffe!' },
      { icon: '🐴', label: 'Horse', sound: 'H is for Horse. Neigh!' },
      { icon: '🍦', label: 'Ice Cream', sound: 'I is for Ice Cream. Yummy!' },
      { icon: '🧃', label: 'Juice', sound: 'J is for Juice. Juh, juh, Juice!' },
      { icon: '🦘', label: 'Kangaroo', sound: 'K is for Kangaroo. Hop, hop, hop!' },
      { icon: '🦁', label: 'Lion', sound: 'L is for Lion. Roar!' },
      { icon: '🐒', label: 'Monkey', sound: 'M is for Monkey. Ooh ooh ah ah!' },
      { icon: '👃', label: 'Nose', sound: 'N is for Nose. Nuh, nuh, Nose!' },
      { icon: '🐙', label: 'Octopus', sound: 'O is for Octopus. Wiggle, wiggle!' },
      { icon: '🐷', label: 'Pig', sound: 'P is for Pig. Oink, oink!' },
      { icon: '👑', label: 'Queen', sound: 'Q is for Queen. Hello, your majesty!' },
      { icon: '🚀', label: 'Rocket', sound: 'R is for Rocket. Blast off!' },
      { icon: '☀️', label: 'Sun', sound: 'S is for Sun. Warm and bright!' },
      { icon: '🐯', label: 'Tiger', sound: 'T is for Tiger. Grrr!' },
      { icon: '☂️', label: 'Umbrella', sound: 'U is for Umbrella. Keeps us dry!' },
      { icon: '🌋', label: 'Volcano', sound: 'V is for Volcano. Vuh, vuh, Volcano!' },
      { icon: '🐳', label: 'Whale', sound: 'W is for Whale. Splash!' },
      { icon: '🎹', label: 'Xylophone', sound: 'X is for Xylophone. Ding, ding, ding!' },
      { icon: '🪀', label: 'Yo-yo', sound: 'Y is for Yo-yo. Up and down!' },
      { icon: '🦓', label: 'Zebra', sound: 'Z is for Zebra. Zuh, zuh, Zebra!' }
    ]
  },
  copilot: {
    title: "Let's Drive!",
    color: '#4FC3F7', // Blue
    items: [
      { icon: '🚦', label: 'Stop & Go', sound: 'Green means go! Red means stop!' },
      { icon: '👈', label: 'Left', sound: 'Turn to the left!' },
      { icon: '👉', label: 'Right', sound: 'Turn to the right!' },
      { icon: '🐢', label: 'Slow', sound: 'Nice and slow, like a turtle.' },
      { icon: '🐇', label: 'Fast', sound: 'Fast like a bunny! Zoom!' },
      { icon: '📯', label: 'Honk', sound: 'Beep beep! Coming through!' }
    ]
  },
  communicate: {
    title: "My Feelings",
    color: '#81C784', // Green
    items: [
      { icon: '😊', label: 'Happy', sound: 'I feel happy today!' },
      { icon: '😫', label: 'Too Loud', sound: 'It is too loud. I need a break.' },
      { icon: '🧃', label: 'Thirsty', sound: 'I am thirsty. Can I have a drink?' },
      { icon: '🥪', label: 'Hungry', sound: 'I am hungry for a snack.' },
      { icon: '🚽', label: 'Potty', sound: 'I need to use the potty.' },
      { icon: '🫂', label: 'Hug', sound: 'I would like a hug, please.' }
    ]
  }
};

function SoundBoard() {
  const [activeTab, setActiveTab] = useState('discover');
  const [activeButton, setActiveButton] = useState(null);
  
  // Voice setup
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const preferred = availableVoices.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Mark"));
      setVoice(preferred || availableVoices[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const playSound = (item, index) => {
    // Visual pop effect
    setActiveButton(index);
    setTimeout(() => setActiveButton(null), 200);

    // Haptic feedback for touchscreens
    if ("vibrate" in navigator) navigator.vibrate(50);

    // Speech synthesis
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(item.sound);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = 0.9; 
    utterance.pitch = 1.3; 
    window.speechSynthesis.speak(utterance);
  };

  const currentCategory = soundCategories[activeTab];

  return (
    <div style={containerStyle}>
      {/* 1. Header */}
      <div style={headerStyle}>
        <Link to="/" style={homeBtnStyle}>🏠 HOME</Link>
        <h1 style={titleStyle}>My SoundBoard 🎵</h1>
      </div>

      {/* 2. Developmental Stage Tabs */}
      <div style={tabContainerStyle}>
        {Object.entries(soundCategories).map(([key, category]) => (
          <button 
            key={key}
            onClick={() => {
              setActiveTab(key);
              window.speechSynthesis.cancel(); // Stop talking when switching tabs
            }}
            style={tabStyle(activeTab === key, category.color)}
          >
            {category.title}
          </button>
        ))}
      </div>

      {/* 3. The Interactive Grid */}
      <div style={{...gridContainerStyle, backgroundColor: currentCategory.color + '22'}}>
        <div style={gridStyle}>
          {currentCategory.items.map((item, index) => (
            <button 
              key={index} 
              onClick={() => playSound(item, index)}
              style={soundButtonStyle(activeButton === index, currentCategory.color)}
            >
              <div style={iconStyle}>{item.icon}</div>
              <div style={labelStyle}>{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---

const containerStyle = { height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFDE7', fontFamily: '"Segoe UI", Roboto, Helvetica, sans-serif', boxSizing: 'border-box', overflow: 'hidden' };
const headerStyle = { padding: '15px 20px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '0 0 25px 25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', zIndex: 10 };
const homeBtnStyle = { background: '#1a73e8', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '16px', marginRight: '20px' };
const titleStyle = { color: '#2c3e50', margin: 0, fontSize: '28px', flex: 1, textAlign: 'center', paddingRight: '100px' };

const tabContainerStyle = { display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px', flexWrap: 'wrap' };
const tabStyle = (isActive, color) => ({ padding: '12px 24px', borderRadius: '20px', border: 'none', backgroundColor: isActive ? color : 'white', color: isActive ? 'white' : '#5f6368', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: isActive ? `0 4px 0 ${color}aa` : '0 2px 5px rgba(0,0,0,0.1)', transform: isActive ? 'translateY(2px)' : 'none', transition: 'all 0.2s ease' });

const gridContainerStyle = { flex: 1, padding: '20px', borderRadius: '40px 40px 0 0', display: 'flex', justifyContent: 'center', overflowY: 'auto' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', width: '100%', maxWidth: '900px', alignContent: 'start' };

const soundButtonStyle = (isPressed, color) => ({ backgroundColor: 'white', border: `4px solid ${color}`, borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: isPressed ? `0 0 0 ${color}` : `0 6px 0 ${color}dd`, transform: isPressed ? 'translateY(6px)' : 'none', transition: 'all 0.1s', aspectRatio: '1/1' });
const iconStyle = { fontSize: '60px', marginBottom: '10px', lineHeight: 1 };
const labelStyle = { fontSize: '18px', fontWeight: 'bold', color: '#34495e', textTransform: 'uppercase' };

// Make sure this is at the absolute bottom of the file!
export default SoundBoard;