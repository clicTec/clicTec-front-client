import { NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  MOBILE_CARD_IMAGE_OVERRIDES,
  MobileImageOverride,
  MobileImageStyle
} from '../../shared/config/mobile-card-image.config';
import { ConsentAwareHtmlPipe } from '../../shared/pipes/consent-aware-html.pipe';
import {
  ContentApiService,
  MobileCardResponse,
  MobileFilterGroupResponse
} from '../../shared/services/content-api.service';
import { SeoService } from '../../shared/services/seo.service';
import { resolveBrandNameFromSlug } from '../../shared/utils/brand.utils';

type FilterKey = 'brand' | 'tier' | 'priceRange' | 'os';

@Component({
  selector: 'app-marca-page',
  standalone: true,
  imports: [RouterLink, ConsentAwareHtmlPipe, NgStyle],
  templateUrl: './marca-page.html',
  styleUrls: ['./marca-page.scss']
})
export class MarcaPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly contentApiService = inject(ContentApiService);
  private readonly seoService = inject(SeoService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly pageSize = 9;
  private readonly maxVisiblePages = 5;
  private routeSubscription?: Subscription;
  private searchQuery = '';

  protected readonly cardImageOverrides = MOBILE_CARD_IMAGE_OVERRIDES;
  protected isLoading = true;
  protected errorMessage = '';
  protected brandName = '';
  protected brandSlug = '';
  protected mobileCatalog: readonly MobileCardResponse[] = [];
  protected filterGroups: readonly MobileFilterGroupResponse[] = [];
  protected isFilterMenuOpen = false;
  protected currentPage = 1;
  protected searchDraft = '';
  protected selectedFilters: Record<FilterKey, string> = {
    brand: '',
    tier: '',
    priceRange: '',
    os: ''
  };
  protected totalItems = 0;
  protected totalPages = 1;
  protected hasPublishedMobiles = false;

  protected get orderedFilterGroups(): readonly MobileFilterGroupResponse[] {
    const order: Record<FilterKey, number> = {
      brand: 0,
      tier: 1,
      os: 2,
      priceRange: 3
    };

    return [...this.filterGroups]
      .filter((group) => group.key !== 'brand')
      .sort((left, right) => order[left.key] - order[right.key]);
  }

  protected get activeFilterCount(): number {
    return Object.entries(this.selectedFilters)
      .filter(([key, value]) => key !== 'brand' && value.trim().length > 0)
      .length;
  }

  protected get emptyStateMessage(): string {
    if (!this.brandName) {
      return '';
    }

    if (!this.hasPublishedMobiles) {
      return `Ahora mismo no hay móviles publicados de ${this.brandName}.`;
    }

    return `No hay móviles de ${this.brandName} que coincidan con la búsqueda o los filtros.`;
  }

  protected get pageNumbers(): readonly number[] {
    if (this.totalPages <= this.maxVisiblePages) {
      return Array.from({ length: this.totalPages }, (_, index) => index + 1);
    }

    const halfWindow = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - halfWindow);
    let end = start + this.maxVisiblePages - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = end - this.maxVisiblePages + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((paramMap) => {
      const brandSlug = (paramMap.get('brandSlug') ?? '').trim();
      this.loadBrandPage(brandSlug);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    const filterMenu = this.host.nativeElement.querySelector('.marca-page__filter');
    if (filterMenu instanceof HTMLElement && !filterMenu.contains(target)) {
      this.isFilterMenuOpen = false;
    }
  }

  protected toggleFilterMenu(): void {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  protected setFilter(key: FilterKey, value: string): void {
    if (this.selectedFilters[key] === value) {
      return;
    }

    this.selectedFilters = {
      ...this.selectedFilters,
      [key]: value
    };
    this.currentPage = 1;
    this.loadBrandCatalog(this.brandName);
  }

  protected resetFilters(): void {
    this.selectedFilters = {
      brand: '',
      tier: '',
      priceRange: '',
      os: ''
    };
    this.isFilterMenuOpen = false;
    this.currentPage = 1;
    this.loadBrandCatalog(this.brandName);
  }

  protected updateSearchDraft(value: string): void {
    this.searchDraft = value;
  }

  protected applySearch(value: string = this.searchDraft): void {
    const nextQuery = value.trim();
    this.searchDraft = nextQuery;
    if (nextQuery === this.searchQuery && this.currentPage === 1) {
      return;
    }

    this.searchQuery = nextQuery;
    this.currentPage = 1;
    this.loadBrandCatalog(this.brandName);
  }

  protected getSelectedFilterValue(key: string): string {
    return this.selectedFilters[key as FilterKey] ?? '';
  }

  protected getPhoneImageSource(phone: MobileCardResponse): string {
    const overrideSource = this.getPhoneImageOverride(phone.slug)?.src?.trim();
    return overrideSource && overrideSource.length > 0 ? overrideSource : phone.image.trim();
  }

  protected getPhoneImageFrameStyle(slug: string): MobileImageStyle | null {
    return this.getPhoneImageOverride(slug)?.frameStyle ?? null;
  }

  protected getPhoneImageStyle(slug: string): MobileImageStyle | null {
    return this.getPhoneImageOverride(slug)?.imageStyle ?? null;
  }

  protected previousPage(): void {
    if (this.currentPage === 1) {
      return;
    }

    this.currentPage -= 1;
    this.loadBrandCatalog(this.brandName);
  }

  protected nextPage(): void {
    if (this.currentPage === this.totalPages) {
      return;
    }

    this.currentPage += 1;
    this.loadBrandCatalog(this.brandName);
    this.scrollToFirstMobileRow();
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadBrandCatalog(this.brandName);
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
    this.filterGroups = [];
    this.isFilterMenuOpen = false;
    this.searchDraft = '';
    this.searchQuery = '';
    this.hasPublishedMobiles = false;
    this.currentPage = 1;
    this.selectedFilters = {
      brand: '',
      tier: '',
      priceRange: '',
      os: ''
    };
    this.totalItems = 0;
    this.totalPages = 1;

    this.contentApiService
      .getMobilePage({
        brand: '',
        tier: '',
        priceRange: '',
        os: '',
        search: '',
        page: 1,
        size: 500
      })
      .subscribe({
        next: (response) => {
          const existingBrands = Array.from(new Set(response.catalog.items.map((item) => item.brand)));
          const brandName = resolveBrandNameFromSlug(brandSlug, existingBrands);

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
    if (!brandName) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.contentApiService
      .getMobilePage({
        brand: brandName,
        tier: this.selectedFilters.tier,
        priceRange: this.selectedFilters.priceRange,
        os: this.selectedFilters.os,
        search: this.searchQuery,
        page: this.currentPage,
        size: this.pageSize
      })
      .subscribe({
        next: (response) => {
          this.filterGroups = response.filterGroups;
          this.mobileCatalog = response.catalog.items;
          this.currentPage = response.catalog.page;
          this.totalItems = response.catalog.totalItems;
          this.totalPages = Math.max(1, response.catalog.totalPages);
          if (this.searchQuery.length === 0 && this.activeFilterCount === 0) {
            this.hasPublishedMobiles = this.totalItems > 0;
          }
          this.isLoading = false;
          this.seoService.applyPage({
            title: brandName,
            description:
              this.hasPublishedMobiles
                ? `Móviles y reviews publicadas de ${brandName} en clicTec.`
                : `Página de marca ${brandName} en clicTec.`,
            path: `/marcas/${this.brandSlug}`,
            image: this.mobileCatalog[0] ? this.getPhoneImageSource(this.mobileCatalog[0]) : undefined,
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

  private scrollToFirstMobileRow(): void {
    const catalogGrid = this.host.nativeElement.querySelector('.marca-page__grid');
    if (!(catalogGrid instanceof HTMLElement)) {
      return;
    }

    const top = catalogGrid.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }

  private getPhoneImageOverride(slug: string): MobileImageOverride | undefined {
    return this.cardImageOverrides[slug];
  }
}
