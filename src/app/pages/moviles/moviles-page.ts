import { NgStyle } from '@angular/common';
import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MOBILE_CARD_IMAGE_OVERRIDES,
  MobileImageOverride,
  MobileImageStyle,
  MOVILES_HERO_IMAGE
} from '../../shared/config/mobile-card-image.config';
import { ConsentAwareHtmlPipe } from '../../shared/pipes/consent-aware-html.pipe';
import {
  ContentApiService,
  LaunchEntryResponse,
  MobileCardResponse
} from '../../shared/services/content-api.service';

@Component({
  selector: 'app-moviles-page',
  standalone: true,
  imports: [RouterLink, ConsentAwareHtmlPipe, NgStyle],
  templateUrl: './moviles-page.html',
  styleUrl: './moviles-page.scss'
})
export class MovilesPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly pageSize = 9;
  private readonly maxVisiblePages = 5;

  protected readonly heroImage = MOVILES_HERO_IMAGE;
  protected readonly cardImageOverrides = MOBILE_CARD_IMAGE_OVERRIDES;
  protected isLoading = true;
  protected errorMessage = '';
  protected currentPage = 1;

  protected mobileCatalog: readonly MobileCardResponse[] = [];
  protected launchCalendar: readonly LaunchEntryResponse[] = [];
  protected buyingChecklist: readonly string[] = [];
  protected totalItems = 0;
  protected totalPages = 1;

  ngOnInit(): void {
    this.loadMobilePage();
  }

  protected get filteredCatalog(): readonly MobileCardResponse[] {
    return this.mobileCatalog;
  }

  protected get paginatedCatalog(): readonly MobileCardResponse[] {
    return this.mobileCatalog;
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

  protected get visibleStart(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  protected get visibleEnd(): number {
    const tentativeEnd = this.currentPage * this.pageSize;
    return Math.min(tentativeEnd, this.totalItems);
  }

  protected get emptyStateMessage(): string {
    return 'No hay móviles disponibles ahora mismo.';
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
    this.loadMobilePage();
    this.scrollToFirstMobileRow();
  }

  protected nextPage(): void {
    if (this.currentPage === this.totalPages) {
      return;
    }
    this.currentPage += 1;
    this.loadMobilePage();
    this.scrollToFirstMobileRow();
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadMobilePage();
    this.scrollToFirstMobileRow();
  }

  private loadMobilePage(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contentApiService
      .getMobilePage({
        brand: '',
        tier: '',
        priceRange: '',
        os: '',
        search: '',
        page: this.currentPage,
        size: this.pageSize
      })
      .subscribe({
        next: (response) => {
          this.launchCalendar = response.launchCalendar;
          this.buyingChecklist = response.buyingChecklist;
          this.mobileCatalog = response.catalog.items;
          this.currentPage = response.catalog.page;
          this.totalItems = response.catalog.totalItems;
          this.totalPages = Math.max(1, response.catalog.totalPages);
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar Reviews de móviles.';
          this.isLoading = false;
        }
      });
  }

  private scrollToFirstMobileRow(): void {
    const catalogSection = this.host.nativeElement.querySelector('.moviles-catalog');
    if (!(catalogSection instanceof HTMLElement)) {
      return;
    }

    const offset = window.innerWidth <= 760 ? 88 : 112;
    const top = catalogSection.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }

  private getPhoneImageOverride(slug: string): MobileImageOverride | undefined {
    return this.cardImageOverrides[slug];
  }
}
