import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import {
  ConsentPreferences,
  ConsentRecord,
  ConsentSource,
  EMPTY_LEGAL_SITE_CONFIG,
  LegalConsentResponse,
  LegalSiteConfig
} from '../config/site-legal.config';
import { LegalApiService } from './legal-api.service';

declare global {
  interface Window {
    [key: string]: unknown;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private readonly document = inject(DOCUMENT);
  private readonly legalApiService = inject(LegalApiService);
  private readonly analyticsScriptId = 'clictec-gtag-script';
  private readonly adsenseScriptId = 'clictec-adsense-script';
  private readonly cmpScriptId = 'clictec-external-cmp-script';

  private readonly pendingPreferences: ConsentPreferences = {
    essential: true,
    analytics: false,
    ads: false,
    affiliate: false
  };

  private readonly configSignal = signal<LegalSiteConfig>(EMPTY_LEGAL_SITE_CONFIG);
  private readonly recordSignal = signal<ConsentRecord | null>(null);
  private readonly preferencesOpenSignal = signal(false);
  private readonly initializedSignal = signal(false);
  private readonly submittingSignal = signal(false);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal('');

  readonly siteConfig = computed(() => this.configSignal());
  readonly record = computed(() => this.recordSignal());
  readonly usesExternalCmp = computed(() => {
    const cmp = this.siteConfig().cmp;
    return cmp.mode === 'external-certified' && Boolean(cmp.scriptUrl);
  });
  readonly preferences = computed<ConsentPreferences>(
    () => this.recordSignal()?.preferences ?? this.pendingPreferences
  );
  readonly hasAnswered = computed(() => this.recordSignal() !== null);
  readonly bannerVisible = computed(
    () => this.initializedSignal() && !this.usesExternalCmp() && !this.hasAnswered()
  );
  readonly preferencesOpen = computed(() => this.preferencesOpenSignal());
  readonly ready = computed(() => this.initializedSignal());
  readonly isSubmitting = computed(() => this.submittingSignal());
  readonly errorMessage = computed(() => this.errorSignal());

  constructor() {
    this.ensureGoogleConsentStub();
    this.applyGoogleConsent(this.pendingPreferences, 'default');
    this.applyConsentSideEffects();
    this.loadLegalState(false);
  }

  openPreferences(): void {
    this.refreshLegalState(true);
    if (this.usesExternalCmp()) {
      this.openExternalCmpPreferences();
      return;
    }
    this.preferencesOpenSignal.set(true);
  }

  closePreferences(): void {
    if (this.submittingSignal()) {
      return;
    }
    this.preferencesOpenSignal.set(false);
  }

  acceptAll(source: ConsentSource = 'banner'): void {
    this.saveConsent(
      {
        essential: true,
        analytics: true,
        ads: true,
        affiliate: true
      },
      source
    );
  }

  rejectAll(source: ConsentSource = 'banner'): void {
    this.saveConsent(
      {
        essential: true,
        analytics: false,
        ads: false,
        affiliate: false
      },
      source
    );
  }

  savePreferences(preferences: Omit<ConsentPreferences, 'essential'>): void {
    this.saveConsent(
      {
        essential: true,
        analytics: preferences.analytics,
        ads: preferences.ads,
        affiliate: preferences.affiliate
      },
      'preferences'
    );
  }

  refreshLegalState(forceRefresh = false): void {
    this.loadLegalState(forceRefresh);
  }

  private loadLegalState(forceRefresh: boolean): void {
    if (this.submittingSignal() || this.loadingSignal()) {
      return;
    }

    if (!this.initializedSignal()) {
      this.initializedSignal.set(false);
    }

    this.errorSignal.set('');
    this.loadingSignal.set(true);

    this.legalApiService
      .getLegalConfig(!forceRefresh)
      .pipe(
        take(1),
        switchMap((config) => {
          this.configSignal.set(config);

          if (this.isExternalCmpConfig(config)) {
            return of<LegalConsentResponse | null>(null);
          }

          return this.legalApiService.getConsent();
        }),
        catchError(() => {
          this.errorSignal.set(
            'No se pudo cargar la configuración de privacidad. Las categorías no esenciales siguen bloqueadas por defecto.'
          );
          return of<LegalConsentResponse | null>(null);
        })
      )
      .subscribe((response) => {
        this.errorSignal.set('');
        this.recordSignal.set(this.toRecord(response));

        if (this.usesExternalCmp()) {
          this.ensureExternalCmpScript();
        }

        this.initializedSignal.set(true);
        this.loadingSignal.set(false);
        this.applyConsentSideEffects();
      });
  }

  private saveConsent(preferences: ConsentPreferences, source: ConsentSource): void {
    if (!this.ready() || this.usesExternalCmp() || this.submittingSignal()) {
      return;
    }

    this.submittingSignal.set(true);
    this.errorSignal.set('');

    this.legalApiService
      .saveConsent({
        source,
        analytics: preferences.analytics,
        ads: preferences.ads,
        affiliate: preferences.affiliate
      })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          const record = this.toRecord(response);
          if (!record) {
            this.errorSignal.set('No se pudo confirmar la elección de cookies. Inténtalo de nuevo.');
            this.submittingSignal.set(false);
            this.applyConsentSideEffects();
            return;
          }

          this.recordSignal.set(record);
          this.submittingSignal.set(false);
          this.preferencesOpenSignal.set(false);
          this.applyConsentSideEffects();
        },
        error: () => {
          this.submittingSignal.set(false);
          this.errorSignal.set('No se pudo guardar tu elección. Inténtalo de nuevo.');
          this.applyConsentSideEffects();
        }
      });
  }

  private applyConsentSideEffects(): void {
    const root = this.document.documentElement;
    root.dataset['cmpMode'] = this.usesExternalCmp() ? 'external-certified' : 'custom-banner';
    root.dataset['consentVersion'] = this.siteConfig().consentVersion || '';

    if (this.usesExternalCmp()) {
      root.dataset['consentStatus'] = 'external-cmp';
      this.dispatchConsentChange();
      return;
    }

    const preferences = this.preferences();

    root.dataset['consentAnalytics'] = String(preferences.analytics);
    root.dataset['consentAds'] = String(preferences.ads);
    root.dataset['consentAffiliate'] = String(preferences.affiliate);
    root.dataset['consentStatus'] = this.hasAnswered()
      ? 'configured'
      : this.ready()
        ? 'pending'
        : 'loading';

    this.applyGoogleConsent(preferences, this.hasAnswered() ? 'update' : 'default');

    if (preferences.analytics) {
      this.ensureAnalyticsScript();
    } else {
      this.removeScript(this.analyticsScriptId);
    }

    if (preferences.ads) {
      this.ensureAdsenseScript();
    } else {
      this.removeScript(this.adsenseScriptId);
    }

    this.dispatchConsentChange();
  }

  private ensureGoogleConsentStub(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));
  }

  private applyGoogleConsent(
    preferences: ConsentPreferences,
    mode: 'default' | 'update'
  ): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('consent', mode, {
      ad_storage: preferences.ads ? 'granted' : 'denied',
      ad_user_data: preferences.ads ? 'granted' : 'denied',
      ad_personalization: preferences.ads ? 'granted' : 'denied',
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
      wait_for_update: 500
    });
  }

  private ensureExternalCmpScript(): void {
    const { scriptUrl } = this.siteConfig().cmp;
    if (!scriptUrl || this.document.getElementById(this.cmpScriptId)) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = this.cmpScriptId;
    script.async = true;
    script.src = scriptUrl;
    this.document.head.appendChild(script);
  }

  private ensureAnalyticsScript(): void {
    const analyticsId = this.siteConfig().googleAnalyticsId;
    if (!analyticsId || this.document.getElementById(this.analyticsScriptId)) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = this.analyticsScriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    this.document.head.appendChild(script);

    if (typeof window.gtag === 'function') {
      window.gtag('js', new Date());
      window.gtag('config', analyticsId, {
        anonymize_ip: true
      });
    }
  }

  private ensureAdsenseScript(): void {
    const adsenseClientId = this.siteConfig().googleAdsenseClientId;
    if (!adsenseClientId || this.document.getElementById(this.adsenseScriptId)) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = this.adsenseScriptId;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src =
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`;
    this.document.head.appendChild(script);
  }

  private removeScript(id: string): void {
    const script = this.document.getElementById(id);
    if (script) {
      script.remove();
    }
  }

  private openExternalCmpPreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const functionPath = this.siteConfig().cmp.openPreferencesFunction.trim();
    if (functionPath) {
      const maybeFunction = this.resolveWindowPath(functionPath);
      if (typeof maybeFunction === 'function') {
        maybeFunction();
        return;
      }
    }

    window.dispatchEvent(new CustomEvent('clictec:open-cmp'));
  }

  private dispatchConsentChange(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('clictec:consent-changed', {
        detail: {
          configured: this.hasAnswered(),
          version: this.recordSignal()?.version ?? this.siteConfig().consentVersion,
          preferences: this.preferences()
        }
      })
    );
  }

  private toRecord(response: LegalConsentResponse | null): ConsentRecord | null {
    if (
      !response?.configured
      || !response.version
      || !response.source
      || !response.decidedAt
      || !response.expiresAt
      || !this.isValidPreferences(response.preferences)
    ) {
      return null;
    }

    return {
      version: response.version,
      source: response.source,
      decidedAt: response.decidedAt,
      expiresAt: response.expiresAt,
      preferences: response.preferences
    };
  }

  private isValidPreferences(preferences: ConsentPreferences | null): preferences is ConsentPreferences {
    return Boolean(preferences)
      && preferences?.essential === true
      && typeof preferences?.analytics === 'boolean'
      && typeof preferences?.ads === 'boolean'
      && typeof preferences?.affiliate === 'boolean';
  }

  private isExternalCmpConfig(config: LegalSiteConfig): boolean {
    return config.cmp.mode === 'external-certified' && Boolean(config.cmp.scriptUrl);
  }

  private resolveWindowPath(path: string): unknown {
    return path
      .split('.')
      .filter(Boolean)
      .reduce<unknown>((current, segment) => {
        if (!current || typeof current !== 'object') {
          return undefined;
        }
        return (current as Record<string, unknown>)[segment];
      }, window);
  }
}
