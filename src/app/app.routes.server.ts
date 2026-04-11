import { RenderMode, ServerRoute } from '@angular/ssr';

/*
 * Configuracion antigua de prerender dinamico.
 *
 * Se deja aqui comentada como referencia porque esta parte consultaba la API
 * durante `ng build` para generar rutas dinamicas. Eso rompe el despliegue
 * cuando `https://api.clictec.es` no responde bien desde el build server
 * (por ejemplo con errores 522/timeout).
 *
 * Si en el futuro se quiere volver a activar, hay que hacerlo solo cuando el
 * build no dependa de la API publica en tiempo de compilacion.
 */

/*
import { inject } from '@angular/core';
import { PrerenderFallback } from '@angular/ssr';
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
*/

export const serverRoutes: ServerRoute[] = [
  {
    // Antes estaba en prerender dinamico con getPrerenderParams.
    // Se mantiene en cliente para que el build no consulte la API publica.
    path: 'moviles/:slug',
    renderMode: RenderMode.Client
  },
  {
    // Antes estaba en prerender dinamico con getPrerenderParams.
    // Se mantiene en cliente para evitar que falle el despliegue.
    path: 'marcas/:brandSlug',
    renderMode: RenderMode.Client
  },
  {
    // El resto de rutas sigue en prerender estatico.
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
