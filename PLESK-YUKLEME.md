# Plesk'e Yükleme Talimatları

## ✅ Sorun Çözüldü

Admin panel 404 hatası için gerekli düzenlemeler yapıldı:
- `.htaccess` dosyası güçlendirildi (SPA routing için)
- Production build hazırlandı
- Railway API URL'leri yapılandırıldı

## 📦 Yükleme Adımları

### 1. Plesk File Manager'a Giriş
- Plesk panel'e giriş yapın
- Domain'inizi seçin
- **Files** > **File Manager** bölümüne gidin
- `httpdocs` veya `public_html` klasörüne gidin

### 2. Mevcut Dosyaları Temizleme
- `httpdocs` klasöründeki **TÜM** dosyaları silin (yedek aldıysanız)
- Klasör tamamen boş olmalı

### 3. Yeni Dosyaları Yükleme
Aşağıdaki klasörden tüm dosyaları yükleyin:
```
d:\Yeni klasör (2)\client\dist\
```

**Yüklenmesi gereken dosyalar:**
- ✅ `.htaccess` (GİZLİ DOSYA - mutlaka yükleyin!)
- ✅ `index.html`
- ✅ `assets/` klasörü (tüm JS ve CSS dosyaları)
- ✅ Tüm resim dosyaları (.webp, .png)
- ✅ `robots.txt`
- ✅ `sitemap.xml`

### 4. .htaccess Dosyasını Kontrol
**ÖNEMLİ:** `.htaccess` dosyası gizli bir dosyadır!

Plesk File Manager'da:
1. Sağ üst köşede **Settings** (Ayarlar) butonuna tıklayın
2. **Show hidden files** (Gizli dosyaları göster) seçeneğini aktif edin
3. `.htaccess` dosyasının yüklendiğini kontrol edin

### 5. Dosya İzinlerini Kontrol
- `.htaccess` dosyası: **644** (rw-r--r--)
- `index.html`: **644**
- Klasörler: **755** (rwxr-xr-x)

### 6. Apache Modüllerini Kontrol
Plesk'te şu modüllerin aktif olduğundan emin olun:
- ✅ `mod_rewrite` (URL yeniden yazma için)
- ✅ `mod_headers` (Güvenlik başlıkları için)
- ✅ `mod_deflate` (Gzip sıkıştırma için)

**Kontrol için:** Plesk > Apache & nginx Settings

### 7. Test Etme
Yükleme tamamlandıktan sonra test edin:

```
https://yourdomain.com/
https://yourdomain.com/store
https://yourdomain.com/adminjwan/login  ← Admin panel
https://yourdomain.com/adminjwan        ← Dashboard
```

## 🔧 Sorun Giderme

### Admin panel hala 404 veriyor?

**1. .htaccess dosyası yüklendi mi kontrol edin:**
```bash
# Plesk SSH'de:
ls -la httpdocs/.htaccess
cat httpdocs/.htaccess
```

**2. Apache mod_rewrite aktif mi kontrol edin:**
- Plesk > Apache & nginx Settings
- "mod_rewrite" modülünün aktif olduğundan emin olun

**3. Tarayıcı cache'ini temizleyin:**
- Ctrl + Shift + Delete (Chrome/Edge)
- Tüm cache ve cookies'i temizleyin
- Gizli pencerede test edin

**4. Plesk'te PHP ayarlarını kontrol edin:**
- Apache & nginx Settings > Additional directives
- `.htaccess` dosyasının okunabildiğinden emin olun

### Alternatif: nginx kullanıyorsanız

Eğer Plesk'te nginx kullanıyorsanız, `.htaccess` çalışmaz!

**nginx için:**
Plesk > Apache & nginx Settings > Additional nginx directives:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📝 Notlar

- **Railway Backend:** https://papucgnc-production-01f6.up.railway.app
- **Admin URL:** `/adminjwan/login`
- **API Endpoint:** `/api/*` (Railway'e proxy)

## ✨ Yeni Build Almak İçin

Gelecekte değişiklik yaptığınızda:

```bash
cd "d:\Yeni klasör (2)\client"
npm run build
```

Sonra `dist/` klasöründeki dosyaları Plesk'e yükleyin.
