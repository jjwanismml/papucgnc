# 🚀 Backend Başlatma Talimatları

## ⚠️ ÖNEMLİ: Backend çalışmadan marka/ürün eklenemez!

## Yöntem 1: Batch Dosyası ile (Kolay)

1. **Windows Dosya Gezgini'nde** `server` klasörüne gidin
2. **`start-backend.bat`** dosyasına **çift tıklayın**
3. Backend otomatik başlayacak!

## Yöntem 2: PowerShell ile (Manuel)

1. **PowerShell** açın (Yönetici olarak açmanıza gerek yok)
2. Şu komutları sırayla çalıştırın:

```powershell
cd "D:\Yeni klasör (2)\server"
npm install
npm run dev
```

## Yöntem 3: VS Code Terminal ile

1. **VS Code**'da projeyi açın
2. **Terminal** açın (Ctrl + `)
3. Şu komutları çalıştırın:

```bash
cd server
npm install
npm run dev
```

## ✅ Başarılı Başlatma İşareti

Backend başarıyla başladığında şu mesajları görmelisiniz:

```
MongoDB bağlandı: papucgnc.2eix75x.mongodb.net
Server 5000 portunda çalışıyor
```

## 🔍 Sorun Giderme

### Hata: "Cannot find module"
```bash
cd server
npm install
```

### Hata: "Port 5000 already in use"
- 5000 portunu kullanan başka bir uygulamayı kapatın
- Veya `.env` dosyasında `PORT=5001` yapın

### Hata: "MongoDB bağlantı hatası"
- `.env` dosyasının `server` klasöründe olduğundan emin olun
- MongoDB URI'nin doğru olduğunu kontrol edin

## ⚡ Hızlı Test

Backend çalışıyorsa tarayıcıda şu adresi açın:
```
http://localhost:5000
```

Şu mesajı görmelisiniz:
```json
{"message":"Shoe E-commerce API çalışıyor!"}
```

## 📝 Not

- Backend çalışırken **terminal penceresini açık tutun**
- Backend'i durdurmak için terminal'de **Ctrl + C** yapın
- Her değişiklikten sonra backend'i yeniden başlatmanız gerekebilir

---

**Backend çalıştıktan sonra frontend'te marka/ürün ekleyebilirsiniz!** 🎉

