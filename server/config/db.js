const mongoose = require('mongoose');
const dns = require('dns');

// ISP DNS bazen MongoDB Atlas SRV sorgularını engeller (querySrv ECONNREFUSED).
// Google ve Cloudflare DNS'i öncelikli yap.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  console.warn('DNS ayarı yapılamadı:', e.message);
}

const connectDB = async (retryCount = 0) => {
  try {
    // .env dosyasından MongoDB URI'yi al
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('HATA: MONGODB_URI .env dosyasında tanımlı değil!');
      console.error('Lütfen server/.env (lokal) veya Railway env değişkenlerini kontrol edin.');
      // Prod'da exit etme; sunucu HTTP'yi servis etmeye devam etsin (health check 200 dönsün)
      if (process.env.NODE_ENV === 'production') return;
      process.exit(1);
    }

    console.log('MongoDB bağlantısı kuruluyor...');
    console.log('URI:', mongoURI.replace(/:[^:@]+@/, ':****@')); // Şifreyi gizle

    // Reasonable timeouts so a hanging DNS/connect doesn't block process forever
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB bağlandı: ${conn.connection.host}`);
    console.log(`📊 Veritabanı: ${conn.connection.name}`);

    // Reconnect logging
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB bağlantısı koptu, mongoose otomatik yeniden denenecek...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB yeniden bağlandı');
    });
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);

    const isLocalDev = process.env.NODE_ENV === 'development' || process.env.LOCAL_DEV === 'true';
    if (isLocalDev) {
      console.log('⚠️ Lokal geliştirme modu: MongoDB olmadan devam ediliyor...');
      return;
    }

    // Prod'da exit etmek yerine üstel geri çekilme ile yeniden dene
    const delay = Math.min(30000, 2000 * Math.pow(2, retryCount));
    console.log(`⏳ ${delay / 1000}s sonra tekrar denenecek (deneme ${retryCount + 1})`);
    setTimeout(() => connectDB(retryCount + 1), delay);
  }
};

module.exports = connectDB;

