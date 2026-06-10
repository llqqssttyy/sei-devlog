import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { withBase } from '../utils/paths';

type ResolveCanonicalUrlOptions = {
  canonicalUrl?: string;
  pathname: string;
  site: URL;
};

type ResolvePageUrlOptions = {
  pageUrl?: string;
  currentUrl: URL;
  site: URL;
};

type ResolveOgImageUrlOptions = {
  ogImageUrl?: string;
  imageSrc?: string;
  currentUrl: URL;
  site: URL;
  fallbackOgImageUrl?: string;
};

type WebsiteJsonLdOptions = {
  siteHref: string;
  searchHref: string;
};

export function resolveDocumentTitle(title: string) {
  return title === SITE_TITLE ? title : `${title} — ${SITE_TITLE}`;
}

export function resolveCanonicalUrl({ canonicalUrl, pathname, site }: ResolveCanonicalUrlOptions) {
  return canonicalUrl ? new URL(canonicalUrl, site) : new URL(pathname, site);
}

export function resolvePageUrl({ pageUrl, currentUrl, site }: ResolvePageUrlOptions) {
  return pageUrl ? new URL(pageUrl, site).toString() : currentUrl.toString();
}

export function resolveOgImageUrl({
  ogImageUrl,
  imageSrc,
  currentUrl,
  site,
  fallbackOgImageUrl,
}: ResolveOgImageUrlOptions) {
  if (ogImageUrl) return new URL(withBase(ogImageUrl), site);
  if (imageSrc) return new URL(imageSrc, currentUrl);
  if (fallbackOgImageUrl) return new URL(withBase(fallbackOgImageUrl), site);
  return null;
}

export function createWebsiteJsonLd({ siteHref, searchHref }: WebsiteJsonLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: siteHref,
    author: { '@type': 'Person', name: SITE_AUTHOR },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${searchHref}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
