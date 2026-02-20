const express = require('express');
const cors = require('cors');
const path = require('path');

// .env dosyasını yükle
require('dotenv').config({ path: path.join(__dirname, '.env') });

// .env kontrolü
if (!process.env.MONGODB_URI) {
  console.error('❌ HATA: .env dosyası bulunamadı veya MONGODB_URI tanımlı değil!');
  console.error('📁 Beklenen konum:', path.join(__dirname, '.env'));
  process.exit(1);
}

const connectDB = require('./config/db');
const app = express();

// MongoDB Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

