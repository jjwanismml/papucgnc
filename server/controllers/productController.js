const Product = require('../models/Product');

// POST /api/products - Yeni ürün ekleme
exports.createProduct = async (req, res) => {
  try {
    // Validasyon
    const { name, description, price, originalPrice, brand, category, colors } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Ürün adı gereklidir' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Açıklama gereklidir' });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Geçerli bir fiyat girin' });
    }

    if (!brand) {
      return res.status(400).json({ error: 'Marka seçilmelidir' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Kategori gereklidir' });
    }

    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({ error: 'En az bir renk varyasyonu eklemelisiniz' });
    }

    // Renk validasyonu
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      if (!color.colorName || !color.colorName.trim()) {
        return res.status(400).json({ error: `Renk ${i + 1}: Renk adı gereklidir` });
      }
      if (!color.hexCode) {
        return res.status(400).json({ error: `Renk ${i + 1}: Hex kodu gereklidir` });
      }
      if (!color.images || !Array.isArray(color.images) || color.images.length === 0) {
        return res.status(400).json({ error: `Renk ${i + 1}: En az bir görsel eklemelisiniz` });
      }
      if (!color.sizes || !Array.isArray(color.sizes) || color.sizes.length === 0) {
        return res.status(400).json({ error: `Renk ${i + 1}: Stok bilgisi gereklidir` });
      }
      
      // Stok kontrolü
      const hasStock = color.sizes.some(size => size.stock > 0);
      if (!hasStock) {
        return res.status(400).json({ error: `Renk ${i + 1}: En az bir numara için stok girmelisiniz` });
      }
    }

    // Fiyat hesaplama - çizili fiyat girilmişse, büyük olan originalPrice, küçük olan price olmalı
    let finalPrice = parseFloat(price);
    let finalOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
    
    if (finalOriginalPrice !== null && finalOriginalPrice > 0 && finalOriginalPrice !== finalPrice) {
      // Her zaman: price = düşük fiyat (güncel), originalPrice = yüksek fiyat (eski/çizili)
      const high = Math.max(finalPrice, finalOriginalPrice);
      const low = Math.min(finalPrice, finalOriginalPrice);
      finalPrice = low;
      finalOriginalPrice = high;
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      brand,
      category: category.trim(),
      colors: colors.map(color => ({
        colorName: color.colorName.trim(),
        hexCode: color.hexCode,
        images: color.images.filter(img => img && img.trim()),
        hoverVideo: color.hoverVideo || '',
        sizes: color.sizes.map(size => ({
          size: parseInt(size.size),
          stock: parseInt(size.stock) || 0
        }))
      }))
    });

    await product.save();
    await product.populate('brand');
    
    res.status(201).json({
      message: 'Ürün başarıyla eklendi',
      product
    });
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    
    // Mongoose validation hatalarını daha anlaşılır hale getir
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }

    res.status(500).json({ 
      error: 'Ürün eklenirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/products - Tüm ürünleri getir (Filtreleme: Marka, Öne Çıkanlar)
exports.getProducts = async (req, res) => {
  try {
    const { brand, isFeatured } = req.query;
    const filter = {};

    if (brand) {
      filter.brand = brand;
    }

    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }

    const products = await Product.find(filter).populate('brand').sort({ isFeatured: -1, featuredAt: 1, createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/products/:id - Tekil ürün detayı
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand');
    
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    // Benzer ürünler (aynı marka veya kategori)
    const similarProducts = await Product.find({
      $or: [
        { brand: product.brand._id },
        { category: product.category }
      ],
      _id: { $ne: product._id }
    })
    .populate('brand')
    .limit(4)
    .sort({ createdAt: -1 });

    res.json({
      product,
      similarProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/products/:id - Ürün güncelleme
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, brand, category, colors } = req.body;

    // Validasyon
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Ürün adı gereklidir' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Açıklama gereklidir' });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Geçerli bir fiyat girin' });
    }
    if (!brand) {
      return res.status(400).json({ error: 'Marka seçilmelidir' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Kategori gereklidir' });
    }
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({ error: 'En az bir renk varyasyonu eklemelisiniz' });
    }

    // Renk validasyonu
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      if (!color.colorName || !color.colorName.trim()) {
        return res.status(400).json({ error: `Renk ${i + 1}: Renk adı gereklidir` });
      }
      if (!color.hexCode) {
        return res.status(400).json({ error: `Renk ${i + 1}: Hex kodu gereklidir` });
      }
      if (!color.images || !Array.isArray(color.images) || color.images.length === 0) {
        return res.status(400).json({ error: `Renk ${i + 1}: En az bir görsel eklemelisiniz` });
      }
      if (!color.sizes || !Array.isArray(color.sizes) || color.sizes.length === 0) {
        return res.status(400).json({ error: `Renk ${i + 1}: Stok bilgisi gereklidir` });
      }
      const hasStock = color.sizes.some(size => size.stock > 0);
      if (!hasStock) {
        return res.status(400).json({ error: `Renk ${i + 1}: En az bir numara için stok girmelisiniz` });
      }
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    // Fiyat hesaplama - çizili fiyat girilmişse, büyük olan originalPrice, küçük olan price olmalı
    let finalPrice = parseFloat(price);
    let finalOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
    
    if (finalOriginalPrice !== null && finalOriginalPrice > 0 && finalOriginalPrice !== finalPrice) {
      const high = Math.max(finalPrice, finalOriginalPrice);
      const low = Math.min(finalPrice, finalOriginalPrice);
      finalPrice = low;
      finalOriginalPrice = high;
    }

    product.name = name.trim();
    product.description = description.trim();
    product.price = finalPrice;
    product.originalPrice = finalOriginalPrice;
    product.brand = brand;
    product.category = category.trim();
    product.colors = colors.map(color => ({
      colorName: color.colorName.trim(),
      hexCode: color.hexCode,
      images: color.images.filter(img => img && img.trim()),
      hoverVideo: color.hoverVideo || '',
      sizes: color.sizes.map(size => ({
        size: parseInt(size.size),
        stock: parseInt(size.stock) || 0
      }))
    }));

    await product.save();
    await product.populate('brand');

    res.json({
      message: 'Ürün başarıyla güncellendi',
      product
    });
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }
    res.status(500).json({
      error: 'Ürün güncellenirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE /api/products/:id - Ürün silme
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    res.status(500).json({ error: 'Ürün silinirken bir hata oluştu' });
  }
};

// PUT /api/products/:id/feature - Ürünü öne çıkar/çıkarma toggle
exports.toggleFeature = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    product.isFeatured = !product.isFeatured;
    product.featuredAt = product.isFeatured ? new Date() : null;
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

