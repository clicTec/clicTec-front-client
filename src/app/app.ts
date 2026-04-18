import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent';
import { FooterComponent } from './shared/components/footer/footer';
import { HeaderComponent } from './shared/components/header/header';
import { MonetizationDisclosureComponent } from './shared/components/monetization-disclosure/monetization-disclosure';
import { ConsentService } from './shared/services/consent.service';
import { SeoService } from './shared/services/seo.service';

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
  private readonly seoService = inject(SeoService);
  protected showMonetizationDisclosure = false;
  protected isFullBleedMain = false;

  ngOnInit(): void {
    this.applyCurrentRouteSeo(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.applyCurrentRouteSeo(event.urlAfterRedirects);
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

  private applyCurrentRouteSeo(url: string): void {
    const activeRoute = this.findDeepestRoute(this.router.routerState.snapshot.root);
    const title = String(activeRoute.data['seoTitle'] ?? '');
    const description = String(activeRoute.data['seoDescription'] ?? '');
    const robotsValue = activeRoute.data['seoRobots'];
    const schema = String(activeRoute.data['seoSchema'] ?? '');
    const canonicalPath = String(activeRoute.data['seoCanonicalPath'] ?? url);
    this.showMonetizationDisclosure = activeRoute.data['showMonetizationDisclosure'] === true;
    this.isFullBleedMain = activeRoute.data['fullBleedMain'] === true;

    this.seoService.applyPage({
      title,
      description,
      path: canonicalPath,
      robots: typeof robotsValue === 'string' ? robotsValue : undefined,
      structuredData: schema === 'website' ? this.seoService.buildWebsiteSchema() : undefined
    });
  }

  private findDeepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let currentRoute = route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    return currentRoute;
  }
}
