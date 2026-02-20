const express = require('express');
const cors = require('cors');
const path = require('path');

// .env dosyasını yükle (lokal geliştirme için)
require('dotenv').config({ path: path.join(__dirname, '.env') });

// MongoDB URI kontrolü
if (!process.env.MONGODB_URI) {
  console.error('❌ HATA: MONGODB_URI tanımlı değil!');
  console.error('📁 Lokal: .env dosyasını kontrol edin');
  console.error('☁️  Railway: Environment Variables bölümünden MONGODB_URI ekleyin');
  process.exit(1);
}

const connectDB = require('./config/db');
const app = express();

// MongoDB Connection
connectDB();

// Middleware - CORS
app.use(cors({
  origin: ['https://papucgnc.com', 'https://www.papucgnc.com', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Preflight OPTIONS isteklerini her zaman geçir
app.options('*', cors({
  origin: ['https://papucgnc.com', 'https://www.papucgnc.com', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Statik dosya sunumu - yüklenen resimler
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Shoe E-commerce API çalışıyor!' });
});

// API Routes
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

