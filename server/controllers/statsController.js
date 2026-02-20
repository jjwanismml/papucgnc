const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/stats - İstatistikleri getir
exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Beklemede' });
    const totalProducts = await Product.countDocuments();
    
    // Toplam ciro
    const orders = await Order.find({ status: { $ne: 'Beklemede' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalOrders,
      pendingOrders,
      totalProducts,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

