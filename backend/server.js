import express from 'express';
import cors from 'cors';
import { ExpressPeerServer } from 'peer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;

// 1. Basic Health Check Route
app.get('/', (req, res) => {
  res.json({ message: "🚗 Roadie Telemetry Server is Live!" });
});

// 2. Start the HTTP Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Roadie Engine Live on ${PORT}`);
  console.log(`📡 PeerJS Signaling Server running at http://localhost:${PORT}/peerjs`);
});

// 3. ✨ THE MISSING RADIO TOWER ✨ Attach the Private PeerJS Server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});

app.use('/peerjs', peerServer);

// 4. Live Hackathon Logging
peerServer.on('connection', (client) => {
  console.log(`🟢 DEVICE CONNECTED: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`🔴 DEVICE DISCONNECTED: ${client.getId()}`);
});