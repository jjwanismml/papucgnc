const express = require('express');
const cors = require('cors');
const path = require('path');

// Yakalanmamış hataları logla
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  console.error(err.stack);
});

// .env dosyasını yükle (lokal geliştirme için)
require('dotenv').config({ path: path.join(__dirname, '.env') });

// MongoDB URI kontrolü
if (!process.env.MONGODB_URI) {
  console.error('HATA: MONGODB_URI tanımlı değil!');
  process.exit(1);
}

const connectDB = require('./config/db');
const app = express();

// MongoDB Connection
connectDB();

// CORS - tüm originlere izin ver
app.use(cors());

// Manuel CORS header - yedek
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Statik dosya sunumu
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API calisiyor', status: 'ok', port: process.env.PORT });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT} portunda calisiyor`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
