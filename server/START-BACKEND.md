# Backend Başlatma Talimatları

## Adım 1: Terminal Açın
PowerShell veya CMD açın.

## Adım 2: Server Klasörüne Gidin
```bash
cd "D:\Yeni klasör (2)\server"
```

## Adım 3: Bağımlılıkları Kurun
```bash
npm install
```

Bu komut şunları kuracak:
- express
- mongoose
- cors
- dotenv
- nodemon (dev dependency)

## Adım 4: Backend'i Başlatın

### Geliştirme Modu (Otomatik Yeniden Başlatma):
```bash
npm run dev
```

### Veya Normal Mod:
```bash
npm start
```

## Beklenen Çıktı

Backend başarıyla başladığında şu mesajları görmelisiniz:

```
MongoDB bağlandı: papucgnc.2eix75x.mongodb.net
Server 5000 portunda çalışıyor
```

## Sorun Giderme

### Hata: "Cannot find module"
- `npm install` komutunu tekrar çalıştırın

### Hata: "MongoDB bağlantı hatası"
- `.env` dosyasını kontrol edin
- MongoDB URI'nin doğru olduğundan emin olun

### Hata: "Port 5000 already in use"
- 5000 portunu kullanan başka bir uygulamayı kapatın
- Veya `.env` dosyasında PORT değerini değiştirin

## Not
Backend çalışırken terminal penceresini açık tutun!

