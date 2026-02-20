const Order = require('../models/Order');

// POST /api/orders - Yeni sipariş oluştur
exports.createOrder = async (req, res) => {
  try {
    const { customerInfo, billingInfo, paymentMethod, items, subtotal, shippingCost, eftSurcharge, totalAmount, shippingCompany } = req.body;

    // Validasyon
    if (!customerInfo || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone || !customerInfo.email || !customerInfo.city || !customerInfo.district || !customerInfo.neighborhood || !customerInfo.addressDetail) {
      return res.status(400).json({ error: 'Tüm teslimat bilgileri gereklidir.' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Ödeme yöntemi seçilmelidir.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sepetinizde ürün bulunmalıdır.' });
    }

    const order = new Order({
      customerInfo,
      billingInfo: billingInfo || {},
      paymentMethod,
      items,
      subtotal,
      shippingCost: shippingCost || 0,
      eftSurcharge: eftSurcharge || 0,
      totalAmount,
      shippingCompany: shippingCompany || 'Sürat Kargo',
      paymentStatus: paymentMethod === 'havale-eft' ? 'Bekliyor' : 'Onaylandı'
    });

    await order.save();
    await order.populate('items.product');
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    res.status(400).json({ error: error.message });
  }
};

// GET /api/orders - Siparişleri listele (Pagination/Infinite Scroll)
exports.getOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments();

    res.json({
      orders,
      hasMore: skip + limit < total,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/orders/:id/status - Sipariş durumunu güncelle
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Beklemede', 'Onaylandı', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/orders/:id - Tek sipariş detayı
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/orders/track/:orderNumber - Sipariş takibi
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate('items.product');
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
