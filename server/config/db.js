const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // .env dosyasından MongoDB URI'yi al
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('HATA: MONGODB_URI .env dosyasında tanımlı değil!');
      console.error('Lütfen server/.env dosyasını kontrol edin.');
      process.exit(1);
    }

    console.log('MongoDB bağlantısı kuruluyor...');
    console.log('URI:', mongoURI.replace(/:[^:@]+@/, ':****@')); // Şifreyi gizle

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB bağlandı: ${conn.connection.host}`);
    console.log(`📊 Veritabanı: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    console.error('Detay:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

