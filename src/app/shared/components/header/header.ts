import { Component, ElementRef, HostListener, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ContentApiService, MobileCardResponse } from '../../services/content-api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly contentApiService = inject(ContentApiService);
  private readonly searchDebounceMs = 180;

  private searchDebounceId: ReturnType<typeof window.setTimeout> | null = null;
  private latestSearchToken = 0;

  protected isMenuOpen = false;
  protected isSearchOpen = false;
  protected searchDraft = '';
  protected isSearching = false;
  protected searchSuggestions: readonly MobileCardResponse[] = [];

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  protected closeMenu(): void {
    this.isMenuOpen = false;
  }

  protected toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) {
      this.clearPendingSearch();
      return;
    }

    this.closeMenu();

    window.setTimeout(() => {
      const input = this.host.nativeElement.querySelector('.topbar-search__input');
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }, 0);
  }

  protected closeSearch(clearDraft = false): void {
    this.isSearchOpen = false;
    this.isSearching = false;
    this.clearPendingSearch();
    if (clearDraft) {
      this.searchDraft = '';
      this.searchSuggestions = [];
    }
  }

  protected updateSearchDraft(value: string): void {
    this.searchDraft = value;
    const query = value.trim();
    if (!query) {
      this.isSearching = false;
      this.searchSuggestions = [];
      this.clearPendingSearch();
      return;
    }

    this.scheduleSearch(query);
  }

  protected submitSearch(value: string = this.searchDraft): void {
    const query = value.trim();
    if (!query) {
      this.closeSearch(true);
      return;
    }

    this.router.navigate(['/moviles'], { queryParams: { q: query } });
    this.closeMenu();
    this.closeSearch();
  }

  @HostListener('window:keydown.escape')
  protected handleEscapeKey(): void {
    this.closeSearch();
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  protected handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target || this.host.nativeElement.contains(target)) {
      return;
    }

    this.closeSearch();
  }

  @HostListener('window:resize')
  protected handleWindowResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth > 760) {
      this.closeMenu();
    }
  }

  ngOnDestroy(): void {
    this.clearPendingSearch();
  }

  private scheduleSearch(query: string): void {
    this.clearPendingSearch();
    this.searchDebounceId = window.setTimeout(() => {
      this.searchDebounceId = null;
      this.fetchSuggestions(query);
    }, this.searchDebounceMs);
  }

  private fetchSuggestions(query: string): void {
    const token = ++this.latestSearchToken;
    this.isSearching = true;

    this.contentApiService
      .getMobilePage({
        brand: '',
        tier: '',
        priceRange: '',
        os: '',
        search: query,
        page: 1,
        size: 5
      })
      .subscribe({
        next: (response) => {
          if (token !== this.latestSearchToken) {
            return;
          }
          this.searchSuggestions = response.catalog.items;
          this.isSearching = false;
        },
        error: () => {
          if (token !== this.latestSearchToken) {
            return;
          }
          this.searchSuggestions = [];
          this.isSearching = false;
        }
      });
  }

  private clearPendingSearch(): void {
    if (this.searchDebounceId === null) {
      return;
    }

    window.clearTimeout(this.searchDebounceId);
    this.searchDebounceId = null;
  }
}
