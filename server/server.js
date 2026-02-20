const express = require('express');
const cors = require('cors');
const path = require('path');

// Hata yakalama
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err.message, err.stack);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED:', err);
});

// .env yükle
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = parseInt(process.env.PORT) || 5000;

// CORS
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health endpoints
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API calisiyor', port: PORT });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// MongoDB bağlantısı
let dbConnected = false;
const connectDB = require('./config/db');
connectDB().then(() => {
  dbConnected = true;
  console.log('DB connected flag: true');
}).catch(err => {
  console.error('DB connection failed:', err.message);
});

// Statik dosyalar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
try {
  app.use('/api/upload', require('./routes/uploadRoutes'));
  app.use('/api/products', require('./routes/productRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/brands', require('./routes/brandRoutes'));
  app.use('/api/stats', require('./routes/statsRoutes'));
  console.log('All routes loaded successfully');
} catch (err) {
  console.error('ROUTE LOAD ERROR:', err.message, err.stack);
}

// Server başlat
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=== SERVER STARTED ON PORT ${PORT} ===`);
  console.log(`Listening on 0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('SERVER ERROR:', err.message);
});
