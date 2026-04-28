const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

// GET /api/stories - Aktif hikayeler (public)
router.get('/', storyController.getStories);

// GET /api/stories/all - Tüm hikayeler (admin)
router.get('/all', storyController.getAllStories);

// POST /api/stories - Hikaye ekle
router.post('/', storyController.createStory);

// PUT /api/stories/:id/toggle - Aktif/Pasif toggle
router.put('/:id/toggle', storyController.toggleStory);

// DELETE /api/stories/:id - Hikaye sil
router.delete('/:id', storyController.deleteStory);

module.exports = router;
