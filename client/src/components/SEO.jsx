import { Helmet } from 'react-helmet-async';

/**
 * SEO - Her sayfa için dinamik meta tag yönetimi
 * - Title, description, keywords
 * - Open Graph (Facebook, Instagram)
 * - Twitter Card
 * - JSON-LD Structured Data
 * - Canonical URL
 */
const SEO = ({
  title,
  description,
  keywords,
  image = '/logo.png',
  url,
  type = 'website',
  jsonLd,
  noindex = false,
}) => {
  const siteName = 'PAPUÇGNC';
  const baseUrl = 'https://papucgnc.com';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Sokağın Ritmini Yakala`;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImage = image?.startsWith('http') ? image : `${baseUrl}${image}`;
  const defaultDescription = 'Nike, Adidas, Vans, Puma, New Balance ve daha fazla markanın en yeni ayakkabı modelleri. Uygun fiyat, hızlı kargo, kapıda ödeme seçenekleri ile PAPUÇGNC.';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

