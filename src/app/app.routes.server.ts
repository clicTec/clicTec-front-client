import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';
import { slugifyBrand } from './shared/utils/brand.utils';
import { ContentApiService, MobileCardResponse } from './shared/services/content-api.service';

const prerenderPageSize = 100;

async function getAllPublishedMobileCards(contentApiService: ContentApiService): Promise<MobileCardResponse[]> {
  const items: MobileCardResponse[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await firstValueFrom(
      contentApiService.getMobilePage({
        brand: '',
        tier: '',
        priceRange: '',
        os: '',
        search: '',
        page,
        size: prerenderPageSize
      })
    );

    items.push(...response.catalog.items);
    totalPages = Math.max(1, response.catalog.totalPages);
    page += 1;
  } while (page <= totalPages);

  return items;
}

async function getMobileReviewPrerenderParams(): Promise<Record<string, string>[]> {
  const contentApiService = inject(ContentApiService);
  const items = await getAllPublishedMobileCards(contentApiService);

  return Array.from(new Set(items.map((item) => item.slug.trim()).filter(Boolean))).map((slug) => ({
    slug
  }));
}

async function getBrandPrerenderParams(): Promise<Record<string, string>[]> {
  const contentApiService = inject(ContentApiService);
  const items = await getAllPublishedMobileCards(contentApiService);

  return Array.from(
    new Set(
      items
        .map((item) => slugifyBrand(item.brand))
        .map((brandSlug) => brandSlug.trim())
        .filter(Boolean)
    )
  ).map((brandSlug) => ({
    brandSlug
  }));
}

export const serverRoutes: ServerRoute[] = [
  {
    path: 'moviles/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    getPrerenderParams: getMobileReviewPrerenderParams
  },
  {
    path: 'marcas/:brandSlug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    getPrerenderParams: getBrandPrerenderParams
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
