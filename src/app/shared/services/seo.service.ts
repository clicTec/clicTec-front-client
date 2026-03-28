import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_META } from '../config/site-meta.config';

export interface SeoPageData {
  title: string;
  description: string;
  path?: string;
  robots?: string;
  image?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown> | readonly Record<string, unknown>[];
}

export interface ArticleSchemaData {
  headline: string;
  description: string;
  path: string;
  image?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly canonicalSelector = 'link[rel="canonical"][data-clictec="canonical"]';
  private readonly structuredDataSelector =
    'script[type="application/ld+json"][data-clictec="structured-data"]';

  applyPage(data: SeoPageData): void {
    const title = this.composeTitle(data.title);
    const description = data.description.trim() || SITE_META.defaultDescription;
    const robots = data.robots?.trim() || SITE_META.defaultRobots;
    const canonicalUrl = this.resolveUrl(data.path ?? this.currentPath());
    const imageUrl = this.resolveImage(data.image);
    const ogType = data.type ?? 'website';

    this.title.setTitle(title);
    this.updateMeta('name', 'description', description);
    this.updateMeta('name', 'robots', robots);
    this.updateMeta('property', 'og:site_name', SITE_META.brandName);
    this.updateMeta('property', 'og:locale', SITE_META.locale);
    this.updateMeta('property', 'og:title', title);
    this.updateMeta('property', 'og:description', description);
    this.updateMeta('property', 'og:type', ogType);
    this.updateMeta('property', 'og:url', canonicalUrl);
    this.updateMeta('property', 'og:image', imageUrl);
    this.updateMeta('name', 'twitter:card', 'summary_large_image');
    this.updateMeta('name', 'twitter:title', title);
    this.updateMeta('name', 'twitter:description', description);
    this.updateMeta('name', 'twitter:image', imageUrl);
    this.updateCanonical(canonicalUrl);

    if (data.structuredData) {
      this.updateStructuredData(data.structuredData);
      return;
    }

    this.clearStructuredData();
  }

  applyNotFound(path?: string): void {
    this.applyPage({
      title: 'Página no encontrada',
      description: 'La URL solicitada no existe o ya no está disponible en clicTec.',
      path,
      robots: 'noindex,follow,noarchive'
    });
  }

  buildWebsiteSchema(): readonly Record<string, unknown>[] {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_META.brandName,
        url: SITE_META.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: SITE_META.defaultImage
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_META.brandName,
        url: SITE_META.siteUrl,
        inLanguage: 'es-ES'
      }
    ];
  }

  buildArticleSchema(data: ArticleSchemaData): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.headline,
      description: data.description,
      mainEntityOfPage: this.resolveUrl(data.path),
      inLanguage: 'es-ES',
      author: {
        '@type': 'Organization',
        name: SITE_META.brandName
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_META.brandName,
        logo: {
          '@type': 'ImageObject',
          url: SITE_META.defaultImage
        }
      }
    };

    const image = this.resolveImage(data.image);
    if (image) {
      schema['image'] = [image];
    }

    if (data.publishedAt) {
      schema['datePublished'] = data.publishedAt;
    }

    if (data.updatedAt ?? data.publishedAt) {
      schema['dateModified'] = data.updatedAt ?? data.publishedAt;
    }

    return schema;
  }

  clearStructuredData(): void {
    this.document.head
      .querySelectorAll(this.structuredDataSelector)
      .forEach((element) => element.remove());
  }

  private composeTitle(title: string): string {
    const trimmed = title.trim() || SITE_META.defaultTitle;
    return trimmed.includes(SITE_META.brandName) ? trimmed : `${trimmed} | ${SITE_META.brandName}`;
  }

  private currentPath(): string {
    const location = this.document.location;
    if (!location) {
      return '/';
    }

    return `${location.pathname}${location.search}` || '/';
  }

  private resolveUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = path.trim() || '/';
    if (normalizedPath === '/') {
      return `${SITE_META.siteUrl}/`;
    }

    return `${SITE_META.siteUrl}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
  }

  private resolveImage(image?: string): string {
    const candidate = image?.trim();
    if (!candidate) {
      return SITE_META.defaultImage;
    }

    if (/^https?:\/\//i.test(candidate)) {
      return candidate;
    }

    return `${SITE_META.siteUrl}${candidate.startsWith('/') ? candidate : `/${candidate}`}`;
  }

  private updateMeta(attributeName: 'name' | 'property', attributeValue: string, content: string): void {
    this.meta.updateTag({
      [attributeName]: attributeValue,
      content
    });
  }

  private updateCanonical(href: string): void {
    let canonical = this.document.head.querySelector<HTMLLinkElement>(this.canonicalSelector);
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('data-clictec', 'canonical');
      this.document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', href);
  }

  private updateStructuredData(
    data: Record<string, unknown> | readonly Record<string, unknown>[]
  ): void {
    this.clearStructuredData();

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-clictec', 'structured-data');
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }
}
