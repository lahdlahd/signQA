import type { Metadata } from 'next';
import { siteConfig } from './siteConfig';

interface BuildMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  updatedTime?: string;
}

const defaultOgImage =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80&sat=-100';

const normalizedBaseTitle =
  typeof siteConfig.name === 'string' ? `${siteConfig.name} | ${siteConfig.tagline}` : siteConfig.name;

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: normalizedBaseTitle,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  category: 'Accessibility',
  alternates: {
    canonical: siteConfig.url,
    types: {
      'application/rss+xml': `${siteConfig.url}/rss.xml`
    }
  },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    title: normalizedBaseTitle,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteConfig.tagline
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@signqa',
    creator: '@signqa',
    images: [defaultOgImage]
  }
};

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  updatedTime
}: BuildMetadataOptions): Metadata {
  const canonical = path ? new URL(path, siteConfig.url).toString() : siteConfig.url;
  const resolvedTitle = title ?? normalizedBaseTitle;
  const resolvedDescription = description ?? siteConfig.description;
  const ogImage = image ?? defaultOgImage;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical
    },
    openGraph: {
      type,
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle
        }
      ],
      ...(publishedTime && { publishedTime }),
      ...(updatedTime && { modifiedTime: updatedTime })
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImage]
    }
  } satisfies Metadata;
}
