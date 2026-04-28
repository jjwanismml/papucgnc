# ✅ HashRouter'a Geçiş Tamamlandı

## Yapılan Değişiklik

**BrowserRouter** → **HashRouter**

### Neden?
- Plesk'te `.htaccess` dosyası çalışmıyor olabilir
- HashRouter sunucu ayarı gerektirmez
- Her ortamda çalışır (Apache, nginx, IIS, statik hosting)

### URL Değişikliği

**Önceki URL'ler (BrowserRouter):**
```
https://papucgnc.com/adminjwan/login
https://papucgnc.com/store
https://papucgnc.com/product/123
```

**Yeni URL'ler (HashRouter):**
```
https://papucgnc.com/#/adminjwan/login
https://papucgnc.com/#/store
https://papucgnc.com/#/product/123
```

**Fark:** URL'lerde `#` (hash) işareti var.

## 📦 Plesk'e Yükleme

### 1. Build Dosyaları Hazır
```
d:\Yeni klasör (2)\client\dist\
```

### 2. Plesk'e Yükle
- Plesk File Manager > `httpdocs` klasörü
- Mevcut dosyaları sil
- `dist/` klasöründeki **TÜM** dosyaları yükle

### 3. Test Et
```
https://papucgnc.com/
https://papucgnc.com/#/store
https://papucgnc.com/#/adminjwan/login  ← Admin panel
```

## ✨ Avantajlar

✅ Sunucu ayarı gerektirmez (`.htaccess` gerekmez)
✅ Her hosting'de çalışır
✅ 404 hatası vermez
✅ Tarayıcı yenileme çalışır

## ⚠️ Dezavantajlar

❌ URL'lerde `#` işareti var (SEO için ideal değil)
❌ Sosyal medya paylaşımlarında hash kısmı kaybolabilir

## 🔄 Geri Dönmek İsterseniz

Eğer `.htaccess` çalışır hale gelirse ve BrowserRouter'a dönmek isterseniz:

```javascript
// App.jsx - 2. satır
import { BrowserRouter as Router, ... } from 'react-router-dom'
```

Sonra yeniden build alın.

## 📝 Not

Admin panel artık şu adreste:
```
https://papucgnc.com/#/adminjwan/login
```

Eski bookmark'larınızı güncelleyin!
