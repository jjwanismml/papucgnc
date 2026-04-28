const Story = require('../models/Story');

// GET /api/stories - Aktif hikayeleri getir
exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/stories/all - Tüm hikayeleri getir (admin)
exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/stories - Yeni hikaye ekle
exports.createStory = async (req, res) => {
  try {
    const { imageUrl, title, link, mediaType } = req.body;
    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({ error: 'Görsel/Video URL gereklidir' });
    }
    const story = new Story({
      imageUrl: imageUrl.trim(),
      mediaType: mediaType === 'video' ? 'video' : 'image',
      title: title?.trim() || '',
      link: link?.trim() || '',
    });
    await story.save();
    res.status(201).json({ message: 'Hikaye başarıyla eklendi', story });
  } catch (error) {
    console.error('Hikaye ekleme hatası:', error);
    res.status(500).json({ error: 'Hikaye eklenirken hata oluştu' });
  }
};

// PUT /api/stories/:id/toggle - Hikaye aktif/pasif toggle
exports.toggleStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Hikaye bulunamadı' });
    story.isActive = !story.isActive;
    await story.save();
    res.json({ message: 'Hikaye durumu güncellendi', story });
  } catch (error) {
    res.status(500).json({ error: 'Hikaye güncellenirken hata oluştu' });
  }
};

// DELETE /api/stories/:id - Hikaye sil
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ error: 'Hikaye bulunamadı' });
    res.json({ message: 'Hikaye silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Hikaye silinirken hata oluştu' });
  }
};
