import { DOCUMENT } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { ConsentService } from '../services/consent.service';

@Pipe({
  name: 'consentAwareHtml',
  standalone: true,
  pure: false
})
export class ConsentAwareHtmlPipe implements PipeTransform {
  private readonly document = inject(DOCUMENT);
  private readonly consentService = inject(ConsentService);
  private lastKey = '';
  private lastResult = '';
  private readonly affiliateHosts = [
    /(^|\.)amazon\./i,
    /(^|\.)amzn\.to$/i,
    /(^|\.)anrdoezrs\.net$/i,
    /(^|\.)awin1\.com$/i,
    /(^|\.)cj\.com$/i,
    /(^|\.)impact\.com$/i,
    /(^|\.)impactradius\.com$/i,
    /(^|\.)linksynergy\.com$/i,
    /(^|\.)partnerize\.com$/i,
    /(^|\.)pjatr\.com$/i,
    /(^|\.)rakutenadvertising\.com$/i,
    /(^|\.)shareasale\.com$/i,
    /(^|\.)skimresources\.com$/i,
    /(^|\.)go\.skimresources\.com$/i,
    /(^|\.)tradedoubler\.com$/i,
    /(^|\.)webgains\.com$/i
  ];
  private readonly affiliateParams = new Set([
    'aff',
    'aff_id',
    'affid',
    'affiliate',
    'irclickid',
    'linkcode',
    'mkevt',
    'mkrid',
    'partner',
    'partner_id',
    'ref',
    'ref_',
    'refid',
    'tag'
  ]);
  private readonly marketingParams = new Set([
    'dclid',
    'fbclid',
    'gclid',
    'gbraid',
    'msclkid',
    'twclid',
    'wbraid'
  ]);

  transform(html: string | null | undefined, commercialContext = false): string {
    if (!html) {
      return '';
    }

    const parsedDocument = this.document.implementation?.createHTMLDocument('consent-aware-html');
    if (!parsedDocument) {
      return html;
    }

    parsedDocument.body.innerHTML = html;
    const baseOrigin = this.document.location?.origin ?? 'http://localhost';
    const preferences = this.consentService.preferences();
    const cacheKey = [
      html,
      commercialContext ? 'commercial' : 'editorial',
      preferences.analytics ? 'analytics:on' : 'analytics:off',
      preferences.ads ? 'ads:on' : 'ads:off',
      preferences.affiliate ? 'affiliate:on' : 'affiliate:off'
    ].join('::');

    if (cacheKey === this.lastKey) {
      return this.lastResult;
    }

    for (const anchor of Array.from(parsedDocument.querySelectorAll('a[href]'))) {
      const href = (anchor.getAttribute('href') ?? '').trim();
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      try {
        const url = new URL(href, baseOrigin);
        const isExternal = url.origin !== baseOrigin;
        const isAffiliateHost = this.affiliateHosts.some((pattern) => pattern.test(url.hostname));
        const hadAffiliateParams = !preferences.affiliate
          ? this.stripTrackedParams(url, (key) => this.isAffiliateParam(key))
          : false;
        const hadMarketingParams = !preferences.analytics && !preferences.ads
          ? this.stripTrackedParams(url, (key) => this.isMarketingParam(key))
          : false;
        const shouldBlockAffiliateRedirect = !preferences.affiliate
          && isAffiliateHost
          && (commercialContext || hadAffiliateParams);

        if (shouldBlockAffiliateRedirect) {
          anchor.setAttribute('href', '/publicidad-afiliacion');
          anchor.setAttribute(
            'title',
            'Este enlace comercial está desactivado hasta que aceptes la categoría de afiliación.'
          );
          anchor.removeAttribute('target');
          anchor.classList.add('consent-aware-link--blocked');
        } else if (hadAffiliateParams || hadMarketingParams) {
          anchor.setAttribute('href', this.serializeHref(url, href));
        }

        if (!isExternal) {
          continue;
        }

        const relValues = new Set(
          (anchor.getAttribute('rel') ?? '')
            .split(/\s+/)
            .map((value) => value.trim())
            .filter(Boolean)
        );

        relValues.add('noopener');
        relValues.add('noreferrer');

        if (commercialContext || hadAffiliateParams || isAffiliateHost) {
          relValues.add('nofollow');
          relValues.add('sponsored');
        }

        anchor.setAttribute('rel', Array.from(relValues).join(' '));

        if (!shouldBlockAffiliateRedirect && !anchor.hasAttribute('target')) {
          anchor.setAttribute('target', '_blank');
        }
      } catch {
        continue;
      }
    }

    this.lastKey = cacheKey;
    this.lastResult = parsedDocument.body.innerHTML;
    return this.lastResult;
  }

  private stripTrackedParams(url: URL, matcher: (key: string) => boolean): boolean {
    let modified = false;

    for (const key of Array.from(url.searchParams.keys())) {
      if (!matcher(key)) {
        continue;
      }

      url.searchParams.delete(key);
      modified = true;
    }

    return modified;
  }

  private isAffiliateParam(key: string): boolean {
    const normalized = key.trim().toLowerCase();
    return normalized.startsWith('aff')
      || normalized.startsWith('ref')
      || normalized.startsWith('partner')
      || this.affiliateParams.has(normalized);
  }

  private isMarketingParam(key: string): boolean {
    const normalized = key.trim().toLowerCase();
    return normalized.startsWith('utm_') || this.marketingParams.has(normalized);
  }

  private serializeHref(url: URL, originalHref: string): string {
    if (originalHref.startsWith('//')) {
      return `//${url.host}${url.pathname}${url.search}${url.hash}`;
    }

    if (originalHref.startsWith('http://') || originalHref.startsWith('https://')) {
      return url.toString();
    }

    return `${url.pathname}${url.search}${url.hash}`;
  }
}
