const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - Yeni sipariş oluştur
router.post('/', orderController.createOrder);

// GET /api/orders - Siparişleri listele (Pagination/Infinite Scroll)
router.get('/', orderController.getOrders);

// GET /api/orders/track/:orderNumber - Sipariş takibi
router.get('/track/:orderNumber', orderController.trackOrder);

// GET /api/orders/:id - Tek sipariş detayı
router.get('/:id', orderController.getOrderById);

// PUT /api/orders/:id/status - Sipariş durumunu güncelle
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
