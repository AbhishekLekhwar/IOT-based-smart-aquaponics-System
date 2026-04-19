require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const schedulerService = require('./services/schedulerService');

const app = express();
const server = http.createServer(app);

// ─── WebSocket Server ────────────────────────────────────────────────────────
const wss = new WebSocket.Server({ server, path: '/ws' });
const wsClients = new Set();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`🔌 WS client connected. Total: ${wsClients.size}`);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to AquaMonitor' }));
  ws.on('close', () => { wsClients.delete(ws); });
  ws.on('error', () => { wsClients.delete(ws); ws.terminate(); });
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
});

const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) { wsClients.delete(ws); return ws.terminate(); }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
wss.on('close', () => clearInterval(heartbeat));

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '50mb' }));  // Increased for base64 image data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => { console.log(`${req.method} ${req.path}`); next(); });
}

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/sensors',  require('./routes/sensorRoutes')(wsClients));
app.use('/api/devices',  require('./routes/deviceRoutes')(wsClients));
app.use('/api/settings', require('./routes/settingsRoutes')(wsClients));
app.use('/api/export',   require('./routes/exportRoutes'));
app.use('/api/camera',   require('./routes/cameraRoutes'));
app.use('/api/alerts',   require('./routes/alertRoutes'));  // SMS Alert routes

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()), wsClients: wsClients.size, timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ success: false, message: 'Internal server error' }); });

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await schedulerService.loadAll(wsClients);

  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@aquamonitor.local',
      password: process.env.ADMIN_PASSWORD || 'aqua1234',
      role: 'admin',
    });
    console.log(`👤 Default admin: ${process.env.ADMIN_EMAIL || 'admin@aquamonitor.local'} / aqua1234`);
  }

  server.listen(PORT, () => {
    console.log(`\n🌱 AquaMonitor Server → http://localhost:${PORT}`);
    console.log(`🔌 WebSocket         → ws://localhost:${PORT}/ws`);
    console.log(`🔐 Auth              → POST /api/auth/login\n`);
  });
});
