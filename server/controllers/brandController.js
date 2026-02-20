const Brand = require('../models/Brand');
const Product = require('../models/Product');

// GET /api/brands - Tüm markaları getir
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/brands - Yeni marka ekle
exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    // Validasyon
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Marka adı gereklidir' });
    }

    // Aynı isimde marka var mı kontrol et
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingBrand) {
      return res.status(400).json({ error: 'Bu isimde bir marka zaten mevcut' });
    }

    const brand = new Brand({
      name: name.trim(),
      logoUrl: req.body.logoUrl || ''
    });

    await brand.save();
    
    res.status(201).json({
      message: 'Marka başarıyla eklendi',
      brand
    });
  } catch (error) {
    console.error('Marka ekleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ 
      error: 'Marka eklenirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE /api/brands/:id - Marka sil (ve markaya ait tüm ürünleri de sil)
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Marka bulunamadı' });
    }

    // Markaya ait ürün sayısını bul
    const productCount = await Product.countDocuments({ brand: brand._id });

    // Markaya ait tüm ürünleri sil
    await Product.deleteMany({ brand: brand._id });

    // Markayı sil
    await Brand.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Marka ve ilişkili ürünler başarıyla silindi',
      deletedProducts: productCount
    });
  } catch (error) {
    console.error('Marka silme hatası:', error);
    res.status(500).json({
      error: 'Marka silinirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

