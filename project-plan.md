# Proje: Full Stack Ayakkabı E-Ticaret Platformu (MERN Stack)

Bu doküman, React (Vite) Frontend ve Node.js (Express) + MongoDB Backend içeren bir e-ticaret projesinin adım adım, hatasız ve üretim ortamına (Railway) uygun şekilde geliştirilmesi için hazırlanmıştır.

## 1. Teknoloji Yığını (Tech Stack)

* **Frontend:** React (Vite), Tailwind CSS, Lucide React (İkonlar), Axios, React Router DOM.
* **Backend:** Node.js, Express.js, Mongoose.
* **Veritabanı:** MongoDB (Atlas).
* **Resim/Video Depolama:** (Opsiyonel: Cloudinary veya Multer ile sunucu içi).
* **Deployment:** Railway uyumlu yapı (Environment variable yönetimi).

---

## 2. Proje Yapısı (Monorepo Yaklaşımı)

Proje kök dizininde iki ana klasör olmalı:
1.  `/client` (React Vite uygulaması)
2.  `/server` (Node.js Express API)

---

## 3. Veritabanı Şeması (Database Schema - MongoDB)

Backend geliştirmesine başlamadan önce aşağıdaki şema yapısını **kesinlikle** uygula.

### A. Product (Ürün) Modeli
```javascript
{
  name: String,
  description: String,
  price: Number,
  brand: { type: Schema.Types.ObjectId, ref: 'Brand' }, // Marka ilişkisi
  category: String, // Kampanya veya Kategori
  isFeatured: { type: Boolean, default: false }, // Öne Çıkarılan Ürün
  colors: [
    {
      colorName: String, // Örn: "Kırmızı"
      hexCode: String,   // Örn: "#FF0000" (Renk seçimi kutucukları için)
      images: [String],  // Ürün görselleri (Array)
      hoverVideo: String, // (Opsiyonel) Hover yapınca oynayacak kısa video/gif URL'i
      sizes: [
        {
          size: Number, // 36, 37... 44
          stock: Number // Stok adedi
        }
      ]
    }
  ],
  createdAt: Date
}

//B. Order (Sipariş) Modeli
// JavaScript
{
  customerInfo: { name: String, address: String, phone: String },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      selectedColor: String,
      selectedSize: Number,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: { type: String, enum: ['Beklemede', 'Onaylandı', 'Kargoya Verildi', 'Teslim Edildi'], default: 'Beklemede' },
  createdAt: Date
}


//C. Brand (Marka) Modeli
//JavaScript
{
  name: String,
  logoUrl: String
}

//Backend geliştirme adımları 
Kurulum: npm init, express, mongoose, cors, dotenv kurulumlarını yap.

Bağlantı: config/db.js oluştur ve MongoDB bağlantısını kur.

API Rotaları:

POST /api/products: Yeni ürün ekleme (Resim ve video URL'lerini array olarak alabilmeli).

GET /api/products: Tüm ürünleri getir (Filtreleme: Marka, Öne Çıkanlar).

GET /api/products/:id: Tekil ürün detayı ve "Benzer Ürünler" mantığı için kategori bazlı sorgu.

PUT /api/products/:id/feature: Ürünü öne çıkar/çıkarma toggle işlemi.

POST /api/orders: Yeni sipariş oluştur.

GET /api/orders: Siparişleri listele (Pagination/Infinite Scroll desteği için limit ve skip parametreleri almalı).

PUT /api/orders/:id/status: Sipariş durumunu güncelle.

GET /api/stats: Toplam satış, toplam sipariş, ürün sayısı gibi istatistikleri dön.
// FRONTEND GELİŞTİRME ADIMLARI 
A. Genel Ayarlar
axios instance oluştur (baseURL: import.meta.env.VITE_API_URL).

Global State: Basit bir CartContext oluştur (Sepete ekle, çıkar, güncelle).

B. Admin Paneli Sayfaları
Ürün Yönetimi:

Marka Listesi: Markalar kutucuklar halinde listelensin. Üzerine gelince (hover) "Ürün Ekle" butonu çıksın.

Ürün Ekleme Modalı:

Marka otomatik seçili gelsin.

Girdiler: Ad, Açıklama, Fiyat, Kampanya.

Varyasyon Yönetimi: Renk seçimi (Text input + Color Picker). Her renk için resim yükleme alanı ve opsiyonel Video URL alanı.

Stok Matrisi: 36'dan 44'e kadar olan numaralar bir grid (tablo) olarak listelensin. Her numaranın karşısına stok adedi girilebilsin.

Öne Çıkarma: Listelenen ürünlerin yanında bir "Yıldız/Toggle" butonu olsun.

Sipariş Yönetimi:

Siparişler kartlar halinde listelensin.

Infinite Scroll: Sayfanın en altına gelindiğinde yeni siparişler yüklensin (Pagination değil, sonsuz akış).

Her kartta "Detay" butonu ve Hızlı Durum Güncelleme (Select box) olsun.

İstatistikler:

Dashboard sayfası. Toplam ciro, bekleyen sipariş sayısı vb. kartlar.

C. Kullanıcı (Müşteri) Sayfaları
Anasayfa:

Hero section (Tanıtım banner).

Vitrini: "Öne Çıkan Ürünler" listesi.

Mağaza Sayfası:

Sol tarafta Marka ve Numara filtresi.

Ürün Kartı (Önemli):

Ürün resmi gözüksün.

Video Hover Özelliği: Mouse ile kartın üzerine gelindiğinde, eğer ürünün hoverVideo verisi varsa resim yerine o video sessiz ve döngüsel (loop) oynasın. Yoksa ikinci resim gözüksün.

Ürün Detay Sayfası:

Sol taraf: Büyük ürün görseli ve altında küçük galeri.

Sağ taraf: Ürün adı, Fiyat.

Renk Seçimi: Küçük yuvarlak veya kare renk kartları. Tıklanınca o rengin görselleri ve stok durumu yüklensin.

Numara Seçimi:

36-44 arası numaralar kutucuk olarak listelensin.

Logic: Seçilen rengin veritabanındaki stok durumuna bak. Eğer 42 numaranın stoğu 0 ise, o kutucuk gri olsun (disabled) ve seçilemesin.

Sepete Ekle: Numara ve renk seçilmeden aktif olmasın.

Benzer Ürünler (En Altta):

Aynı markadan veya aynı kategoriden rastgele 4 ürün gösterilsin.
// Geliştirme adımları 
Lütfen kodlamayı şu sırayla gerçekleştir ve her adımdan sonra onayım için bekleme, bütünlüğü koruyarak ilerle:

Backend kurulumu, Mongoose Modellerinin oluşturulması.

Backend Controller ve Router'ların yazılması (CRUD işlemleri).

Frontend kurulumu ve Tailwind konfigürasyonu.

Admin Paneli arayüzü ve API entegrasyonu (Özellikle karmaşık olan Ürün Ekleme Modalı).

Kullanıcı Arayüzü (Anasayfa, Mağaza).

Ürün Detay Sayfası mantığı (Stok kontrolü, Video Hover).

Cart (Sepet) ve Sipariş oluşturma entegrasyonu.

Son kontroller ve stil düzeltmeleri.

Önemli Not: Kodları yazarken, api klasörü altında controllers ve models ayrımına dikkat et. Frontend'de components klasörünü (ProductCard, Navbar, Sidebar vb.) modüler kullan.


