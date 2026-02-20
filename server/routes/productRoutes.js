const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// POST /api/products - Yeni ürün ekleme
router.post('/', productController.createProduct);

// GET /api/products - Tüm ürünleri getir (Filtreleme: Marka, Öne Çıkanlar)
router.get('/', productController.getProducts);

// GET /api/products/:id - Tekil ürün detayı
router.get('/:id', productController.getProductById);

// PUT /api/products/:id/feature - Ürünü öne çıkar/çıkarma toggle
router.put('/:id/feature', productController.toggleFeature);

// PUT /api/products/:id - Ürün güncelleme
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Ürün silme
router.delete('/:id', productController.deleteProduct);

module.exports = router;

