import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { ConsentAwareHtmlPipe } from '../../shared/pipes/consent-aware-html.pipe';
import { ContentApiService, MobileCardResponse } from '../../shared/services/content-api.service';
import { SeoService } from '../../shared/services/seo.service';
import { resolveBrandNameFromSlug } from '../../shared/utils/brand.utils';

@Component({
  selector: 'app-marca-page',
  standalone: true,
  imports: [RouterLink, ConsentAwareHtmlPipe],
  templateUrl: './marca-page.html',
  styleUrls: ['./marca-page.scss']
})
export class MarcaPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly contentApiService = inject(ContentApiService);
  private readonly seoService = inject(SeoService);
  private readonly pageSize = 24;
  private routeSubscription?: Subscription;

  protected isLoading = true;
  protected errorMessage = '';
  protected brandName = '';
  protected brandSlug = '';
  protected mobileCatalog: readonly MobileCardResponse[] = [];
  protected totalItems = 0;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((paramMap) => {
      const brandSlug = (paramMap.get('brandSlug') ?? '').trim();
      this.loadBrandPage(brandSlug);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  protected get pageDescription(): string {
    if (!this.brandName) {
      return '';
    }

    if (this.totalItems === 0) {
      return `Ahora mismo no hay móviles publicados de ${this.brandName}.`;
    }

    if (this.totalItems === 1) {
      return `1 móvil publicado de ${this.brandName}.`;
    }

    return `${this.totalItems} móviles publicados de ${this.brandName}.`;
  }

  private loadBrandPage(brandSlug: string): void {
    if (!brandSlug) {
      this.handleNotFound('');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.brandName = '';
    this.brandSlug = brandSlug;
    this.mobileCatalog = [];
    this.totalItems = 0;

    this.contentApiService
      .getMobilePage({
        brand: '',
        tier: '',
        priceRange: '',
        os: '',
        search: '',
        page: 1,
        size: 1
      })
      .subscribe({
        next: (response) => {
          const availableBrands = response.filterGroups.find((group) => group.key === 'brand')?.options ?? [];
          const brandName = resolveBrandNameFromSlug(brandSlug, availableBrands);

          if (!brandName) {
            this.handleNotFound(brandSlug);
            return;
          }

          this.brandName = brandName;
          this.loadBrandCatalog(brandName);
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar la marca.';
          this.isLoading = false;
          this.seoService.applyNotFound(`/marcas/${brandSlug}`);
        }
      });
  }

  private loadBrandCatalog(brandName: string): void {
    this.contentApiService
      .getMobilePage({
        brand: brandName,
        tier: '',
        priceRange: '',
        os: '',
        search: '',
        page: 1,
        size: this.pageSize
      })
      .subscribe({
        next: (response) => {
          this.mobileCatalog = response.catalog.items;
          this.totalItems = response.catalog.totalItems;
          this.isLoading = false;
          this.seoService.applyPage({
            title: brandName,
            description:
              this.totalItems > 0
                ? `Móviles y reviews publicadas de ${brandName} en clicTec.`
                : `Página de marca ${brandName} en clicTec.`,
            path: `/marcas/${this.brandSlug}`,
            image: this.mobileCatalog[0]?.image || undefined,
            type: 'website'
          });
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar la marca.';
          this.isLoading = false;
          this.seoService.applyNotFound(`/marcas/${this.brandSlug}`);
        }
      });
  }

  private handleNotFound(brandSlug: string): void {
    this.errorMessage = 'Marca no encontrada.';
    this.isLoading = false;
    this.seoService.applyNotFound(brandSlug ? `/marcas/${brandSlug}` : '/marcas');
  }
}
