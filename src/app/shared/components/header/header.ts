import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  protected isMenuOpen = false;

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
}
