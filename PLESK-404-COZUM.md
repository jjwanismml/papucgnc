# 🔴 Admin Panel 404 Hatası Çözümü

## Sorun: nginx .htaccess dosyasını okumaz!

Plesk genellikle nginx kullanır ve `.htaccess` dosyası **sadece Apache** için çalışır.

## ✅ Çözüm 1: nginx Ayarlarını Düzenleyin (ÖNERİLEN)

### Adım 1: Plesk Panel'e Giriş
1. Plesk'e giriş yapın
2. Domain'inizi seçin
3. **Apache & nginx Settings** bölümüne gidin

### Adım 2: nginx Direktiflerini Ekleyin

**"Additional nginx directives"** kutusuna aşağıdaki kodu ekleyin:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Adım 3: Kaydet ve Yeniden Başlat
1. **OK** butonuna tıklayın
2. nginx otomatik olarak yeniden başlayacak
3. 1-2 dakika bekleyin

### Adım 4: Test Edin
```
https://yourdomain.com/adminjwan/login
```

---

## ✅ Çözüm 2: Sadece Apache Kullanın (Alternatif)

Eğer nginx'i kapatıp sadece Apache kullanmak isterseniz:

### Plesk'te:
1. **Apache & nginx Settings** > **nginx settings**
2. **Proxy mode** seçeneğini **KAPATIN**
3. Sadece Apache kullanılacak (`.htaccess` çalışır)

**Not:** Bu performansı düşürebilir, Çözüm 1 daha iyi.

---

## ✅ Çözüm 3: HashRouter Kullanın (Son Çare)

Eğer sunucu ayarlarını değiştiremiyorsanız, React Router'ı HashRouter'a çevirebiliriz:

```javascript
// URL'ler şu şekilde olur:
https://yourdomain.com/#/adminjwan/login
```

Bu çözümü isterseniz söyleyin, kodu değiştiririm.

---

## 🔍 Hangi Sunucu Kullandığınızı Kontrol Edin

### SSH ile kontrol:
```bash
curl -I https://yourdomain.com
```

Çıktıda şunlardan birini göreceksiniz:
- `Server: nginx` → nginx kullanıyor (Çözüm 1 gerekli)
- `Server: Apache` → Apache kullanıyor (.htaccess çalışmalı)

### Plesk'te kontrol:
1. **Apache & nginx Settings** sayfasını açın
2. Hangi modun aktif olduğunu görün:
   - ✅ **nginx + Apache (proxy mode)** → En yaygın
   - **Sadece Apache** → .htaccess çalışır
   - **Sadece nginx** → nginx config gerekli

---

## 📋 Hızlı Kontrol Listesi

Şunları kontrol edin:

- [ ] `dist/` klasöründeki tüm dosyalar Plesk'e yüklendi mi?
- [ ] `.htaccess` dosyası `httpdocs/` klasöründe var mı?
- [ ] Plesk'te nginx kullanılıyor mu? (Apache & nginx Settings)
- [ ] nginx kullanılıyorsa, yukarıdaki nginx direktifleri eklendi mi?
- [ ] Tarayıcı cache temizlendi mi? (Ctrl + Shift + Delete)
- [ ] Gizli pencerede test edildi mi?

---

## 🆘 Hala Çalışmıyorsa

Aşağıdaki bilgileri gönderin:

1. **Plesk > Apache & nginx Settings** ekran görüntüsü
2. `https://yourdomain.com` adresine gittiğinizde ana sayfa açılıyor mu?
3. Tarayıcı konsolunda (F12) hata var mı?
4. Domain adınız nedir? (test edebilmem için)

Ben kodu değiştirip HashRouter'a geçebilirim (sunucu ayarı gerektirmez).
