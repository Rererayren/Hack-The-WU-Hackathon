import { useState, useEffect, useRef } from "react";

const DEFAULT_CENTER = { lat: 37.6872, lng: -97.3301 };
const DEFAULT_ZOOM = 17;
const API_KEY = "AIzaSyALghiW3PJRGA4adIEFiF0qzG1aNLoPyfo";

function drawCarIcon(pixelSize) {
  const W = pixelSize;
  const H = Math.round(pixelSize * 1.56);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext("2d");
  const r = (x, y, w, h, radius, fill, stroke, sw = 0) => {
    c.beginPath();
    c.moveTo(x + radius, y); c.lineTo(x + w - radius, y);
    c.quadraticCurveTo(x + w, y, x + w, y + radius);
    c.lineTo(x + w, y + h - radius);
    c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    c.lineTo(x + radius, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - radius);
    c.lineTo(x, y + radius); c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = sw; c.stroke(); }
  };
  const s = W / 64;
  c.beginPath(); c.ellipse(W/2, H-s*3, s*20, s*4, 0, 0, Math.PI*2);
  c.fillStyle = "rgba(44,44,42,0.2)"; c.fill();
  [[0,12],[51,12],[0,66],[51,66]].forEach(([wx,wy]) => {
    r(wx*s,wy*s,13*s,22*s,5*s,"#2c2c2a",null);
    r((wx+2)*s,(wy+3)*s,9*s,16*s,3*s,"#666",null);
  });
  r(7*s,16*s,50*s,68*s,12*s,"#e24b4a","#2c2c2a",3*s);
  r(11*s,8*s,42*s,13*s,6*s,"#c93a3a","#2c2c2a",2.5*s);
  r(11*s,79*s,42*s,11*s,6*s,"#c93a3a","#2c2c2a",2.5*s);
  r(9*s,8*s,13*s,9*s,3*s,"#fef08a","#2c2c2a",2*s);
  r(42*s,8*s,13*s,9*s,3*s,"#fef08a","#2c2c2a",2*s);
  r(9*s,81*s,13*s,8*s,3*s,"#f09595","#2c2c2a",2*s);
  r(42*s,81*s,13*s,8*s,3*s,"#f09595","#2c2c2a",2*s);
  r(14*s,25*s,36*s,24*s,7*s,"#7ec8e3","#2c2c2a",2.5*s);
  r(17*s,28*s,12*s,8*s,3*s,"rgba(255,255,255,0.5)",null);
  r(14*s,54*s,36*s,18*s,5*s,"#7ec8e3","#2c2c2a",2*s);
  return canvas.toDataURL("image/png");
}

function metersPerPixel(zoom, lat) {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}
function carPixelWidth(zoom, lat) {
  const mpp = metersPerPixel(zoom, lat);
  return Math.max(32, Math.min(Math.round(6.0 / mpp), 120));
}

const CARTOON_STYLE = [
  { featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f9e04b" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#5cb85c" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#e8a87c" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d4a843" }, { weight: 2 }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ff922b" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c97a1e" }, { weight: 2 }] },
  { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#ffe066" }] },
  { featureType: "road.arterial", elementType: "geometry.stroke", stylers: [{ color: "#d4a843" }, { weight: 1.5 }] },
  { featureType: "road.local", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.local", elementType: "geometry.stroke", stylers: [{ color: "#e8d5a3" }, { weight: 1 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#4dd0e1" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#56c271" }] },
  { featureType: "poi.park", elementType: "geometry.stroke", stylers: [{ color: "#3da85a" }, { weight: 1.5 }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#78d87e" }] },
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#56c271" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5a3e1b" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 3 }] },
];

// Cartoon horse SVG drawn with canvas
function HorseSVG({ flip = false, size = 90 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip ? "scaleX(-1)" : "none", display: "block" }}>
      {/* Body */}
      <ellipse cx="60" cy="75" rx="32" ry="22" fill="#c8813a" stroke="#7a4a1a" strokeWidth="3"/>
      {/* Neck */}
      <path d="M72 60 Q82 45 78 32" stroke="#c8813a" strokeWidth="16" strokeLinecap="round" fill="none"/>
      <path d="M72 60 Q82 45 78 32" stroke="#7a4a1a" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Head */}
      <ellipse cx="76" cy="28" rx="14" ry="11" fill="#c8813a" stroke="#7a4a1a" strokeWidth="3"/>
      {/* Snout */}
      <ellipse cx="84" cy="33" rx="8" ry="6" fill="#e8a87c" stroke="#7a4a1a" strokeWidth="2"/>
      {/* Nostril */}
      <circle cx="86" cy="35" r="2" fill="#7a4a1a"/>
      {/* Eye */}
      <circle cx="73" cy="24" r="4" fill="white" stroke="#7a4a1a" strokeWidth="1.5"/>
      <circle cx="74" cy="24" r="2" fill="#2c1a08"/>
      <circle cx="75" cy="23" r="0.8" fill="white"/>
      {/* Ear */}
      <path d="M68 18 Q70 10 75 14 Q71 18 68 18Z" fill="#c8813a" stroke="#7a4a1a" strokeWidth="1.5"/>
      {/* Mane */}
      <path d="M70 22 Q65 30 67 40 Q63 32 66 22 Q62 28 65 38 Q60 28 63 18" stroke="#7a4a1a" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Legs */}
      <rect x="38" y="88" width="10" height="22" rx="5" fill="#c8813a" stroke="#7a4a1a" strokeWidth="2"/>
      <rect x="52" y="90" width="10" height="20" rx="5" fill="#c8813a" stroke="#7a4a1a" strokeWidth="2"/>
      <rect x="66" y="90" width="10" height="20" rx="5" fill="#c8813a" stroke="#7a4a1a" strokeWidth="2"/>
      <rect x="80" y="88" width="10" height="22" rx="5" fill="#c8813a" stroke="#7a4a1a" strokeWidth="2"/>
      {/* Hooves */}
      <rect x="37" y="107" width="12" height="5" rx="2.5" fill="#4a2e0a"/>
      <rect x="51" y="107" width="12" height="5" rx="2.5" fill="#4a2e0a"/>
      <rect x="65" y="107" width="12" height="5" rx="2.5" fill="#4a2e0a"/>
      <rect x="79" y="107" width="12" height="5" rx="2.5" fill="#4a2e0a"/>
      {/* Tail */}
      <path d="M30 70 Q18 80 22 95 Q26 108 20 112" stroke="#7a4a1a" strokeWidth="6" strokeLinecap="round" fill="none"/>
      {/* Belly spot */}
      <ellipse cx="55" cy="82" rx="12" ry="8" fill="#e8a87c" opacity="0.5"/>
      {/* Cheek blush */}
      <ellipse cx="80" cy="30" rx="4" ry="3" fill="#e07a5f" opacity="0.4"/>
    </svg>
  );
}

// Grass tuft SVG for margins
function GrassTuft({ color = "#56c271" }) {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 28 Q6 14 10 4 Q12 14 14 28Z" fill={color}/>
      <path d="M16 28 Q14 10 20 2 Q24 10 22 28Z" fill={color} opacity="0.9"/>
      <path d="M24 28 Q26 12 28 5 Q30 12 32 28Z" fill={color} opacity="0.8"/>
      <path d="M4 28 Q2 18 6 10 Q8 18 10 28Z" fill={color} opacity="0.7"/>
    </svg>
  );
}

// Flower for margins
function Flower({ color = "#ff6b9d" }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="8" r="5" fill={color}/>
      <circle cx="24" cy="16" r="5" fill={color}/>
      <circle cx="16" cy="24" r="5" fill={color}/>
      <circle cx="8" cy="16" r="5" fill={color}/>
      <circle cx="22" cy="10" r="4" fill={color} opacity="0.7"/>
      <circle cx="22" cy="22" r="4" fill={color} opacity="0.7"/>
      <circle cx="10" cy="22" r="4" fill={color} opacity="0.7"/>
      <circle cx="10" cy="10" r="4" fill={color} opacity="0.7"/>
      <circle cx="16" cy="16" r="6" fill="#fef08a" stroke="#f9c74f" strokeWidth="1"/>
    </svg>
  );
}

export default function MapPage() {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [locationFound, setLocationFound] = useState(false);
  const [loading, setLoading] = useState(true);

  function buildMarkerIcon(zoom, lat) {
    const w = carPixelWidth(zoom, lat);
    const h = Math.round(w * 1.56);
    const png = drawCarIcon(w);
    return {
      url: png,
      scaledSize: new window.google.maps.Size(w, h),
      anchor: new window.google.maps.Point(w / 2, h / 2),
    };
  }

  function initMap(center) {
    if (!mapDivRef.current || mapRef.current) return;
    const google = window.google;
    const map = new google.maps.Map(mapDivRef.current, {
      center, zoom: DEFAULT_ZOOM, styles: CARTOON_STYLE,
      disableDefaultUI: true, zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      fullscreenControl: true,
    });
    const icon = buildMarkerIcon(DEFAULT_ZOOM, center.lat);
    const marker = new google.maps.Marker({ position: center, map, icon, title: "You are here!", optimized: false });
    map.addListener("zoom_changed", () => {
      marker.setIcon(buildMarkerIcon(map.getZoom(), marker.getPosition().lat()));
    });
    mapRef.current = map; markerRef.current = marker;
  }

  function flyToPosition(coords) {
    const map = mapRef.current; const marker = markerRef.current;
    if (!map || !marker) return;
    map.panTo(coords); map.setZoom(DEFAULT_ZOOM);
    marker.setPosition(coords);
    marker.setIcon(buildMarkerIcon(DEFAULT_ZOOM, coords.lat));
  }

  function requestGPS() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords); setLocationFound(true); setLoading(false);
        flyToPosition(coords);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    const onLoad = () => { initMap(DEFAULT_CENTER); requestGPS(); };
    if (window.google && window.google.maps) { onLoad(); return; }
    if (document.getElementById("gmaps-script")) {
      document.getElementById("gmaps-script").addEventListener("load", onLoad); return;
    }
    window.__onGMapsLoad = onLoad;
    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=__onGMapsLoad`;
    script.async = true; script.defer = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ background: "#78d87e", minHeight: "100vh", padding: "0", fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}>

      {/* ===== BIG CUTE HEADER ===== */}
      <div style={{
        background: "linear-gradient(180deg, #56c271 0%, #3da85a 100%)",
        borderBottom: "4px solid #2e7d32",
        padding: "16px 24px 12px",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
        boxShadow: "0 4px 0 #2e7d32",
      }}>
        {/* Left horse */}
        <div style={{ position: "absolute", left: "12px", bottom: 0, display: "flex", alignItems: "flex-end" }}>
          <HorseSVG size={80} />
        </div>

        {/* Title block */}
        <div style={{ textAlign: "center", zIndex: 1 }}>
          {/* Badge circle like PBS Kids */}
          <div style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center",
            background: "#f9e04b", borderRadius: "50%",
            width: 110, height: 110, justifyContent: "center",
            border: "5px solid #5a3e1b", boxShadow: "4px 4px 0 #5a3e1b",
            marginBottom: "6px",
          }}>
            <div style={{ fontSize: "36px", lineHeight: 1 }}>🐴</div>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#5a3e1b", lineHeight: 1.1, marginTop: "4px", letterSpacing: "-0.5px" }}>
              ROADIE
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#5a3e1b", opacity: 0.8 }}>GPS</div>
          </div>
          <div style={{ fontSize: "11px", color: "#d4f0da", fontWeight: 700, letterSpacing: "1px" }}>
            {loading ? "🔍 Finding you..." : locationFound ? "📍 You are here!" : "🗺️ Wichita, KS"}
          </div>
        </div>

        {/* Right horse (flipped) */}
        <div style={{ position: "absolute", right: "12px", bottom: 0, display: "flex", alignItems: "flex-end" }}>
          <HorseSVG size={80} flip />
        </div>
      </div>

      {/* ===== MAIN LAYOUT: side margins + map ===== */}
      <div style={{ display: "flex", alignItems: "stretch", padding: "0", gap: 0 }}>

        {/* Left margin */}
        <div style={{
          width: "80px", flexShrink: 0, background: "#56c271",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "space-around", padding: "16px 0",
          borderRight: "3px solid #3da85a",
        }}>
          <HorseSVG size={60} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
            <GrassTuft color="#3da85a" />
            <Flower color="#ff6b9d" />
            <GrassTuft color="#2e7d32" />
          </div>
          <Flower color="#ff922b" />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <GrassTuft />
            <Flower color="#a78bfa" />
          </div>
          <HorseSVG size={55} />
        </div>

        {/* Map + controls center */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 10px" }}>

          {/* Status + re-center row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{
              flex: 1, padding: "6px 12px", borderRadius: "999px",
              background: "#f9e04b", border: "2.5px solid #5a3e1b",
              fontSize: "12px", fontWeight: 700, color: "#5a3e1b",
              boxShadow: "2px 2px 0 #5a3e1b",
            }}>
              {locationFound
                ? `📍 ${position.lat.toFixed(4)}°, ${position.lng.toFixed(4)}°`
                : "📍 Enable location for live GPS"}
            </div>
            <button onClick={requestGPS} disabled={loading} style={{
              padding: "7px 16px", borderRadius: "999px", flexShrink: 0,
              background: "#ff922b", border: "2.5px solid #5a3e1b",
              fontSize: "12px", fontWeight: 700, color: "#ffffff",
              boxShadow: "2px 2px 0 #5a3e1b",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "⏳ …" : "🔄 Re-center"}
            </button>
          </div>

          {/* Map */}
          <div style={{
            borderRadius: "16px", overflow: "hidden",
            border: "4px solid #5a3e1b", boxShadow: "6px 6px 0 #5a3e1b", flex: 1,
          }}>
            <div ref={mapDivRef} style={{ width: "100%", height: "460px" }} />
          </div>

          <p style={{ margin: "8px 0 0", fontSize: "10px", color: "#3da85a", textAlign: "center", fontFamily: "sans-serif" }}>
            Google Maps • Roadie GPS • Car scales with zoom
          </p>
        </div>

        {/* Right margin */}
        <div style={{
          width: "80px", flexShrink: 0, background: "#56c271",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "space-around", padding: "16px 0",
          borderLeft: "3px solid #3da85a",
        }}>
          <HorseSVG size={60} flip />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
            <Flower color="#4dd0e1" />
            <GrassTuft color="#3da85a" />
            <Flower color="#ff6b9d" />
          </div>
          <Flower color="#f9e04b" />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <GrassTuft color="#2e7d32" />
            <Flower color="#ff922b" />
          </div>
          <HorseSVG size={55} flip />
        </div>
      </div>
    </div>
  );
}