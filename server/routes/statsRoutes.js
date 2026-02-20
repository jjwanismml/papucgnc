const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// GET /api/stats - İstatistikleri getir
router.get('/', statsController.getStats);

module.exports = router;

