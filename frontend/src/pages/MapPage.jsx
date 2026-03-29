import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, OverlayView } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '3px solid #2c2c2a',
  boxShadow: '6px 6px 0px #2c2c2a',
};

const defaultCenter = { lat: 37.6872, lng: -97.3301 };

// Cartoonish map style — bold outlines, saturated colors, minimal labels
const cartoonMapStyle = [
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 4 }] },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#2c2c2a' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#d4edbc' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#e8dfc8' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#f5c842' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2c2c2a' }, { weight: 2 }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#aaa' }, { weight: 1.5 }] },
  { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{ color: '#ccc' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#7ec8e3' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#a8d5a2' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f4a261' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2c2c2a' }, { weight: 2 }] },
  { featureType: 'administrative.locality', elementType: 'labels.text', stylers: [{ weight: '1.5' }] },
];

// Custom cartoon SVG pin marker
const CartoonPin = () => (
  <div style={{ transform: 'translate(-50%, -100%)', cursor: 'pointer' }}>
    <svg width="48" height="60" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg">
      {/* Drop shadow blob */}
      <ellipse cx="24" cy="57" rx="10" ry="4" fill="#2c2c2a" opacity="0.25" />
      {/* Pin body */}
      <path
        d="M24 2C13.5 2 5 10.5 5 21C5 34 24 54 24 54C24 54 43 34 43 21C43 10.5 34.5 2 24 2Z"
        fill="#e24b4a"
        stroke="#2c2c2a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Shine highlight */}
      <ellipse cx="18" cy="15" rx="5" ry="7" fill="white" opacity="0.35" transform="rotate(-20 18 15)" />
      {/* Inner circle */}
      <circle cx="24" cy="21" r="9" fill="white" stroke="#2c2c2a" strokeWidth="2" />
      {/* Center dot */}
      <circle cx="24" cy="21" r="4" fill="#e24b4a" />
    </svg>
  </div>
);

export default function MapPage() {
  const [position, setPosition] = useState(defaultCenter);
  const [locationFound, setLocationFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationFound(true);
          setLoading(false);
        },
        (err) => {
          console.error('GPS error:', err);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#7ec8e3', border: '2.5px solid #2c2c2a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', boxShadow: '3px 3px 0 #2c2c2a',
        }}>🗺️</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#2c2c2a' }}>
            {loading ? 'Finding you...' : locationFound ? 'You are here!' : 'Default location'}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
            {locationFound
              ? `${position.lat.toFixed(4)}°, ${position.lng.toFixed(4)}°`
              : 'GPS unavailable — showing Wichita, KS'}
          </p>
        </div>

        {/* Status badge */}
        <div style={{
          marginLeft: 'auto',
          padding: '5px 12px',
          borderRadius: '999px',
          background: loading ? '#fac775' : locationFound ? '#c0dd97' : '#f7c1c1',
          border: '2px solid #2c2c2a',
          fontSize: '12px',
          fontWeight: 600,
          color: '#2c2c2a',
          boxShadow: '2px 2px 0 #2c2c2a',
        }}>
          {loading ? '⏳ Locating' : locationFound ? '📍 Live GPS' : '⚠️ Default'}
        </div>
      </div>

      {/* Map */}
      <LoadScript googleMapsApiKey="AIzaSyALghiW3PJRGA4adIEFiF0qzG1aNLoPyfo">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={16}
          options={{
            styles: cartoonMapStyle,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Custom cartoon pin overlay */}
          <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <CartoonPin />
          </OverlayView>
        </GoogleMap>
      </LoadScript>

      {/* Footer note */}
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#aaa', textAlign: 'center' }}>
        Map refreshes on page load • Grant location permission for live GPS
      </p>
    </div>
  );
}