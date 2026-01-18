// components/MetaTags.jsx
import { Helmet } from 'react-helmet-async';

const MetaTags = ({ 
  title = 'Sabit International | Professional Training & Development',
  description = 'Sabit International provides professional training, courses, and development programs to enhance your skills and career growth.',
  keywords = 'training, courses, development, professional, skills, career, bangladesh',
  ogTitle,
  ogDescription,
  ogImage = 'https://sabitinternational.com/og-image.jpg',
  ogUrl,
  canonicalUrl,
  twitterCard = 'summary_large_image',
  structuredData
}) => {
  const siteTitle = title.includes('Sabit International') ? title : `${title} | Sabit International`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Sabit International" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Sabit International" />
      <meta property="og:title" content={ogTitle || siteTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl || window.location.href} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || siteTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@sabitintl" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      {/* Structured Data / JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default MetaTags;