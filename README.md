# Ayakkabı E-Ticaret Platformu (MERN Stack)

Full Stack ayakkabı e-ticaret platformu. React (Vite) frontend ve Node.js (Express) + MongoDB backend.

## Proje Yapısı

```
.
├── client/          # React Vite Frontend
├── server/          # Node.js Express Backend
└── project-plan.md  # Detaylı proje planı
```

## Teknoloji Yığını

### Frontend
- React (Vite)
- Tailwind CSS
- Lucide React (İkonlar)
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- Mongoose
- MongoDB (Atlas)

## Kurulum

### Backend Kurulumu

```bash
cd server
npm install
```

`.env` dosyası oluşturun:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shoe-ecommerce
NODE_ENV=development
```

Backend'i çalıştırın:
```bash
npm run dev
```

### Frontend Kurulumu

```bash
cd client
npm install
```

`.env` dosyası oluşturun:
```
VITE_API_URL=http://localhost:5000/api
```

Frontend'i çalıştırın:
```bash
npm run dev
```

## API Endpoints

### Ürünler
- `POST /api/products` - Yeni ürün ekle
- `GET /api/products` - Tüm ürünleri getir
- `GET /api/products/:id` - Ürün detayı
- `PUT /api/products/:id/feature` - Öne çıkar/çıkarma

### Siparişler
- `POST /api/orders` - Yeni sipariş oluştur
- `GET /api/orders` - Siparişleri listele
- `PUT /api/orders/:id/status` - Sipariş durumu güncelle

### Markalar
- `GET /api/brands` - Tüm markaları getir
- `POST /api/brands` - Yeni marka ekle

### İstatistikler
- `GET /api/stats` - Dashboard istatistikleri

## Geliştirme Notları

Detaylı proje planı için `project-plan.md` dosyasına bakın.

