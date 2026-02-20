const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// GET /api/brands - Tüm markaları getir
router.get('/', brandController.getBrands);

// POST /api/brands - Yeni marka ekle
router.post('/', brandController.createBrand);

module.exports = router;

