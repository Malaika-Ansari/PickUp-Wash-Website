import React, { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  type?: string;
}

const DEFAULT_DESCRIPTION =
  'Doorstep laundry pickup, hygienic wash & iron, and prompt 24-48h delivery across Kasur City, Pakistan. Free pickup on eligible first orders.';

/**
 * Lightweight, zero-dependency SEO & Metadata controller.
 * Dynamically updates document.title, meta descriptions, and OpenGraph/Twitter tags
 * on route changes for optimal search engine indexing and social sharing.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  type = 'website',
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const brandSuffix = 'Pickup Wash Kasur';
    const fullTitle = title.includes('Pickup Wash') ? title : `${title} | ${brandSuffix}`;
    document.title = fullTitle;

    // 2. Helper to set or create meta tags
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attributeName, attributeValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard SEO Description
    setMetaTag('name', 'description', description);

    // Open Graph Metadata
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);

    // Twitter Card Metadata
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);

    // 3. Canonical URL
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }
  }, [title, description, canonical, type]);

  return null;
};

export default SEO;

