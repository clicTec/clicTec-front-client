import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent';
import { FooterComponent } from './shared/components/footer/footer';
import { HeaderComponent } from './shared/components/header/header';
import { MonetizationDisclosureComponent } from './shared/components/monetization-disclosure/monetization-disclosure';
import { ConsentService } from './shared/services/consent.service';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    CookieConsentComponent,
    MonetizationDisclosureComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly consentService = inject(ConsentService);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.consentService.refreshLegalState(true);
      });
  }

  @HostListener('window:focus')
  protected onWindowFocus(): void {
    this.consentService.refreshLegalState(true);
  }

  @HostListener('document:visibilitychange')
  protected onVisibilityChange(): void {
    if (this.document.visibilityState === 'visible') {
      this.consentService.refreshLegalState(true);
    }
  }
}
