import { Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ContentApiService,
  LaunchEntryResponse,
  MobileCardResponse,
  MobileFilterGroupResponse
} from '../../shared/services/content-api.service';

type FilterKey = 'brand' | 'tier' | 'priceRange' | 'os';

@Component({
  selector: 'app-moviles-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './moviles-page.html',
  styleUrl: './moviles-page.scss'
})
export class MovilesPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly pageSize = 3;

  protected isLoading = true;
  protected errorMessage = '';
  protected selectedFilters: Record<FilterKey, string> = {
    brand: '',
    tier: '',
    priceRange: '',
    os: ''
  };
  protected filterInputValues: Record<FilterKey, string> = {
    brand: '',
    tier: '',
    priceRange: '',
    os: ''
  };
  protected activeDropdown: FilterKey | null = null;
  protected currentPage = 1;

  protected filterGroups: readonly MobileFilterGroupResponse[] = [];
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
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
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

  protected setFilter(key: FilterKey, value: string): void {
    if (this.selectedFilters[key] === value) {
      this.filterInputValues = {
        ...this.filterInputValues,
        [key]: value
      };
      this.activeDropdown = null;
      return;
    }

    this.selectedFilters = {
      ...this.selectedFilters,
      [key]: value
    };
    this.filterInputValues = {
      ...this.filterInputValues,
      [key]: value
    };
    this.activeDropdown = null;
    this.currentPage = 1;
    this.loadMobilePage();
  }

  protected onFilterInput(key: FilterKey, value: string): void {
    this.filterInputValues = {
      ...this.filterInputValues,
      [key]: value
    };
    this.activeDropdown = key;
  }

  protected openDropdown(key: FilterKey): void {
    this.activeDropdown = key;
  }

  protected closeDropdown(key: FilterKey): void {
    window.setTimeout(() => {
      if (this.activeDropdown === key) {
        this.activeDropdown = null;
        this.filterInputValues = {
          ...this.filterInputValues,
          [key]: this.selectedFilters[key]
        };
      }
    }, 120);
  }

  protected getFilteredOptions(key: FilterKey): readonly string[] {
    const group = this.filterGroups.find((item) => item.key === key);
    if (!group) {
      return [];
    }

    const query = this.filterInputValues[key].trim().toLowerCase();
    if (!query) {
      return group.options;
    }

    return group.options.filter((option) => option.toLowerCase().includes(query));
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    const dropdowns = this.host.nativeElement.querySelectorAll('.moviles-filter-select') as NodeListOf<HTMLElement>;
    let clickedInsideDropdown = false;
    dropdowns.forEach((dropdown) => {
      if (dropdown.contains(target)) {
        clickedInsideDropdown = true;
      }
    });

    if (!clickedInsideDropdown && this.activeDropdown) {
      const activeKey = this.activeDropdown;
      this.activeDropdown = null;
      this.filterInputValues = {
        ...this.filterInputValues,
        [activeKey]: this.selectedFilters[activeKey]
      };
    }
  }

  protected isSelectedFilter(key: FilterKey, value: string): boolean {
    return this.selectedFilters[key] === value;
  }

  protected previousPage(): void {
    if (this.currentPage === 1) {
      return;
    }
    this.currentPage -= 1;
    this.loadMobilePage();
  }

  protected nextPage(): void {
    if (this.currentPage === this.totalPages) {
      return;
    }
    this.currentPage += 1;
    this.loadMobilePage();
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadMobilePage();
  }

  protected resetFilters(): void {
    this.selectedFilters = {
      brand: '',
      tier: '',
      priceRange: '',
      os: ''
    };
    this.filterInputValues = {
      brand: '',
      tier: '',
      priceRange: '',
      os: ''
    };
    this.activeDropdown = null;
    this.currentPage = 1;
    this.loadMobilePage();
  }

  private loadMobilePage(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contentApiService
      .getMobilePage({
        brand: this.selectedFilters.brand,
        tier: this.selectedFilters.tier,
        priceRange: this.selectedFilters.priceRange,
        os: this.selectedFilters.os,
        page: this.currentPage,
        size: this.pageSize
      })
      .subscribe({
        next: (response) => {
          this.filterGroups = response.filterGroups;
          this.launchCalendar = response.launchCalendar;
          this.buyingChecklist = response.buyingChecklist;
          this.mobileCatalog = response.catalog.items;
          this.currentPage = response.catalog.page;
          this.totalItems = response.catalog.totalItems;
          this.totalPages = Math.max(1, response.catalog.totalPages);
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar Review Moviles.';
          this.isLoading = false;
        }
      });
  }
}
