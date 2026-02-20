const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://papucgnc-production.up.railway.app';

/**
 * Resim URL'sini tam URL'ye dönüştürür.
 * - Eğer URL zaten tam bir URL ise (http/https), olduğu gibi döner.
 * - Eğer sunucu yolu ise (/uploads/...), API_BASE ekler.
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
};

export default getImageUrl;


