const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// Multer - memory storage (dosyayı RAM'de tutar, diske yazmaz)
const storage = multer.memoryStorage();

// Dosya filtresi - sadece resimler
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, PNG, WebP, GIF)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB per file
  }
});

// Buffer'ı Cloudinary'ye yükle
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' } // Otomatik optimizasyon
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// POST /api/upload - Birden fazla resim yükleme (Cloudinary)
router.post('/', upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Lütfen en az bir resim yükleyin' });
    }

    // Tüm dosyaları paralel olarak Cloudinary'ye yükle
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'papucgnc/products')
    );

    const results = await Promise.all(uploadPromises);
    const urls = results.map(result => result.secure_url);

    res.json({
      message: `${req.files.length} resim başarıyla yüklendi`,
      urls
    });
  } catch (error) {
    console.error('Upload hatası:', error);
    res.status(500).json({ error: 'Dosya yüklenirken bir hata oluştu: ' + error.message });
  }
});

// Multer hata yakalama middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Dosya boyutu 10MB\'dan büyük olamaz' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'En fazla 20 resim yüklenebilir' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
