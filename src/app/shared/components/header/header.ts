import { DOCUMENT } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'clictec-client-theme';

  protected themeMode: ThemeMode = 'light';
  protected isMenuOpen = false;

  ngOnInit(): void {
    const storedTheme = this.readStoredTheme();
    const preferredTheme = storedTheme ?? (this.prefersDarkColorScheme() ? 'dark' : 'light');
    this.applyTheme(preferredTheme, false);
  }

  protected toggleTheme(): void {
    this.applyTheme(this.themeMode === 'dark' ? 'light' : 'dark', true);
  }

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  protected closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('window:keydown.escape')
  protected handleEscapeKey(): void {
    this.closeMenu();
  }

  @HostListener('window:resize')
  protected handleWindowResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth > 760) {
      this.closeMenu();
    }
  }

  protected get themeToggleLabel(): string {
    return this.themeMode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro';
  }

  protected get themeToggleIcon(): string {
    return this.themeMode === 'dark' ? '/icons/theme-light.svg' : '/icons/theme-dark.svg';
  }

  private applyTheme(theme: ThemeMode, persist: boolean): void {
    this.themeMode = theme;
    this.document.body.dataset['theme'] = theme;
    if (persist) {
      this.writeStoredTheme(theme);
    }
  }

  private readStoredTheme(): ThemeMode | null {
    try {
      const value = localStorage.getItem(this.storageKey);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  }

  private writeStoredTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // Ignore storage failures; the theme still applies for this session.
    }
  }

  private prefersDarkColorScheme(): boolean {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
