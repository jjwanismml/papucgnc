const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Sipariş numarası
  orderNumber: {
    type: String,
    unique: true
  },
  // Teslimat bilgileri
  customerInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    neighborhood: {
      type: String,
      required: true
    },
    addressDetail: {
      type: String,
      required: true
    },
    orderNote: {
      type: String,
      default: ''
    }
  },
  // Fatura bilgileri
  billingInfo: {
    useDifferentAddress: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['bireysel', 'kurumsal'],
      default: 'bireysel'
    },
    firstName: String,
    lastName: String,
    phone: String,
    city: String,
    district: String,
    neighborhood: String,
    addressDetail: String,
    // Kurumsal fatura için
    companyName: String,
    taxOffice: String,
    taxNumber: String
  },
  // Ödeme yöntemi
  paymentMethod: {
    type: String,
    enum: ['kapida-nakit', 'kapida-kredikarti', 'havale-eft'],
    required: true
  },
  // Sipariş kalemleri
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      productName: String,
      productImage: String,
      selectedColor: {
        type: String,
        required: true
      },
      selectedSize: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  // Fiyatlandırma
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  eftSurcharge: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Kargo bilgisi
  shippingCompany: {
    type: String,
    default: 'Sürat Kargo'
  },
  // Durum
  status: {
    type: String,
    enum: ['Beklemede', 'Onaylandı', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'],
    default: 'Beklemede'
  },
  // Ödeme durumu (havale/eft için)
  paymentStatus: {
    type: String,
    enum: ['Bekliyor', 'Onaylandı'],
    default: 'Bekliyor'
  }
}, {
  timestamps: true
});

// Sipariş numarası oluştur
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.orderNumber = `PG${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
