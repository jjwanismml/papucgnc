import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Eye, EyeOff, AlertTriangle, X, Upload, Film, Loader2 } from 'lucide-react';
import api from '../../utils/axios';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ imageUrl: '', title: '', link: '', mediaType: 'image' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadMode, setUploadMode] = useState('url'); // 'url' | 'file'
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Silme onay
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stories/all');
      setStories(response.data);
    } catch (error) {
      console.error('Hikayeler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      setFormError('Görsel URL gereklidir');
      return;
    }
    try {
      setFormLoading(true);
      setFormError('');
      await api.post('/stories', {
        imageUrl: formData.imageUrl.trim(),
        mediaType: formData.mediaType,
        title: formData.title.trim(),
        link: formData.link.trim(),
      });
      setFormData({ imageUrl: '', title: '', link: '', mediaType: 'image' });
      setShowForm(false);
      fetchStories();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Hikaye eklenirken hata oluştu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      setFormError('Sadece resim veya video yükleyebilirsiniz');
      return;
    }
    try {
      setUploading(true);
      setFormError('');
      const fd = new FormData();
      fd.append('media', file);
      const res = await api.post('/upload/story', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((p) => ({
        ...p,
        imageUrl: res.data.url,
        mediaType: res.data.mediaType || (isVideo ? 'video' : 'image'),
      }));
    } catch (err) {
      setFormError(err.response?.data?.error || 'Yükleme başarısız');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/stories/${id}/toggle`);
      fetchStories();
    } catch (error) {
      console.error('Toggle hatası:', error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/stories/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchStories();
    } catch (error) {
      console.error('Silme hatası:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hikaye Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-1">{stories.length} hikaye</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold text-sm shadow-lg shadow-gray-900/10"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'İptal' : 'Yeni Hikaye'}
        </button>
      </div>

      {/* Ekleme Formu */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Yeni Hikaye Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full sm:w-fit">
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-colors ${uploadMode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                URL ile Ekle
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-colors ${uploadMode === 'file' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Bilgisayardan Yükle
              </button>
            </div>

            {/* Görsel/Video Kaynağı */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {formData.mediaType === 'video' ? 'Video' : 'Görsel'} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  {uploadMode === 'url' ? (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://example.com/story.jpg veya .mp4"
                          className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 focus:border-gray-900 bg-gray-50 focus:bg-white rounded-xl focus:ring-0 outline-none transition-colors text-sm font-medium"
                          autoFocus
                        />
                      </div>
                      <select
                        value={formData.mediaType}
                        onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                        className="px-3 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl text-sm font-bold focus:border-gray-900 focus:bg-white outline-none"
                      >
                        <option value="image">Resim</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 hover:border-gray-900 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {formData.imageUrl ? 'Başka dosya seç' : 'Resim veya Video Seç'}
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-gray-400 mt-1.5">Max 100MB · JPG, PNG, MP4, WebM</p>
                    </div>
                  )}
                </div>
                {formData.imageUrl.trim() && (
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl border-2 border-gray-200 overflow-hidden bg-black relative">
                    {formData.mediaType === 'video' ? (
                      <>
                        <video src={formData.imageUrl} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Film className="w-5 h-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={formData.imageUrl.trim()}
                        alt="Önizleme"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Başlık */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Başlık <span className="font-normal text-gray-400 normal-case">(isteğe bağlı)</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Hikaye başlığı"
                className="w-full px-4 py-3 border-2 border-gray-200 focus:border-gray-900 bg-gray-50 focus:bg-white rounded-xl focus:ring-0 outline-none transition-colors text-sm font-medium"
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Link <span className="font-normal text-gray-400 normal-case">(isteğe bağlı)</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com/kampanya"
                  className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 focus:border-gray-900 bg-gray-50 focus:bg-white rounded-xl focus:ring-0 outline-none transition-colors text-sm font-medium"
                />
              </div>
            </div>

            {formError && (
              <p className="text-red-500 text-sm font-medium">{formError}</p>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 font-semibold text-sm transition-colors"
            >
              {formLoading ? 'Ekleniyor...' : 'Hikayeyi Kaydet'}
            </button>
          </form>
        </div>
      )}

      {/* Hikaye Listesi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Henüz hikaye yok</p>
            <p className="text-gray-400 text-sm">İlk hikayeyi ekleyerek başlayın</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {stories.map((story) => (
              <div key={story._id} className="relative group rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
                {/* Görsel */}
                <div className="aspect-[9/16] bg-gray-100 relative">
                  {story.mediaType === 'video' ? (
                    <>
                      <video
                        src={story.imageUrl}
                        className={`w-full h-full object-cover ${!story.isActive ? 'opacity-40 grayscale' : ''}`}
                        muted
                        playsInline
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Film className="w-3 h-3" /> VIDEO
                      </div>
                    </>
                  ) : (
                    <img
                      src={story.imageUrl}
                      alt={story.title || 'Hikaye'}
                      className={`w-full h-full object-cover ${!story.isActive ? 'opacity-40 grayscale' : ''}`}
                    />
                  )}
                  {!story.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-black/70 text-white text-[10px] font-bold px-3 py-1 rounded-full">PASİF</span>
                    </div>
                  )}
                </div>

                {/* Alt Bilgi */}
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-800 truncate">{story.title || 'Başlıksız'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(story.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggle(story._id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors ${
                      story.isActive
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                    title={story.isActive ? 'Pasife Al' : 'Aktif Yap'}
                  >
                    {story.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(story)}
                    className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Silme Onay Modalı */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden" style={{ animation: 'modalIn 0.3s ease-out' }}>
            <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-black text-gray-900">Hikayeyi Sil</h3>
              <p className="text-sm text-gray-500 mt-2">Bu hikaye kalıcı olarak silinecek. Devam etmek istiyor musunuz?</p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-semibold text-sm"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold text-sm"
              >
                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
