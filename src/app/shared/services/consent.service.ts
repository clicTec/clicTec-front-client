import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { siteLegalConfig } from '../config/site-legal.config';

type ConsentSource = 'banner' | 'preferences';

export interface ConsentPreferences {
  readonly essential: true;
  readonly analytics: boolean;
  readonly ads: boolean;
  readonly affiliate: boolean;
}

export interface ConsentRecord {
  readonly version: string;
  readonly decidedAt: string;
  readonly source: ConsentSource;
  readonly preferences: ConsentPreferences;
}

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
  private readonly storageKey = 'clictec-cookie-consent';
  private readonly historyKey = 'clictec-cookie-consent-history';
  private readonly analyticsScriptId = 'clictec-gtag-script';
  private readonly adsenseScriptId = 'clictec-adsense-script';
  private readonly cmpScriptId = 'clictec-external-cmp-script';

  private readonly pendingPreferences: ConsentPreferences = {
    essential: true,
    analytics: false,
    ads: false,
    affiliate: false
  };

  private readonly recordSignal = signal<ConsentRecord | null>(null);
  private readonly preferencesOpenSignal = signal(false);

  readonly record = computed(() => this.recordSignal());
  readonly usesExternalCmp = computed(
    () => siteLegalConfig.cmp.mode === 'external-certified' && Boolean(siteLegalConfig.cmp.scriptUrl)
  );
  readonly preferences = computed<ConsentPreferences>(
    () => this.recordSignal()?.preferences ?? this.pendingPreferences
  );
  readonly hasAnswered = computed(() => this.recordSignal() !== null);
  readonly bannerVisible = computed(() => !this.usesExternalCmp() && !this.hasAnswered());
  readonly preferencesOpen = computed(() => this.preferencesOpenSignal());

  constructor() {
    this.ensureGoogleConsentStub();
    this.applyGoogleConsent(this.pendingPreferences, 'default');
    if (this.usesExternalCmp()) {
      this.ensureExternalCmpScript();
    } else {
      this.restoreStoredConsent();
    }
    this.applyConsentSideEffects();
  }

  openPreferences(): void {
    if (this.usesExternalCmp()) {
      this.openExternalCmpPreferences();
      return;
    }
    this.preferencesOpenSignal.set(true);
  }

  closePreferences(): void {
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

  private saveConsent(preferences: ConsentPreferences, source: ConsentSource): void {
    const record: ConsentRecord = {
      version: siteLegalConfig.consentVersion,
      decidedAt: new Date().toISOString(),
      source,
      preferences
    };

    this.recordSignal.set(record);
    this.persistRecord(record);
    this.applyConsentSideEffects();
    this.closePreferences();
  }

  private restoreStoredConsent(): void {
    const record = this.readStoredRecord();
    if (!record || this.isExpired(record)) {
      this.clearStoredConsent();
      this.recordSignal.set(null);
      return;
    }

    this.recordSignal.set(record);
  }

  private applyConsentSideEffects(): void {
    const root = this.document.documentElement;
    root.dataset['cmpMode'] = this.usesExternalCmp() ? 'external-certified' : 'custom-banner';

    if (this.usesExternalCmp()) {
      root.dataset['consentStatus'] = 'external-cmp';
      return;
    }

    const preferences = this.preferences();

    root.dataset['consentAnalytics'] = String(preferences.analytics);
    root.dataset['consentAds'] = String(preferences.ads);
    root.dataset['consentAffiliate'] = String(preferences.affiliate);
    root.dataset['consentStatus'] = this.hasAnswered() ? 'configured' : 'pending';

    this.applyGoogleConsent(preferences, this.hasAnswered() ? 'update' : 'default');

    if (preferences.analytics) {
      this.ensureAnalyticsScript();
    }

    if (preferences.ads) {
      this.ensureAdsenseScript();
    }
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
    if (
      !siteLegalConfig.cmp.scriptUrl
      || this.document.getElementById(this.cmpScriptId)
    ) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = this.cmpScriptId;
    script.async = true;
    script.src = siteLegalConfig.cmp.scriptUrl;
    this.document.head.appendChild(script);
  }

  private ensureAnalyticsScript(): void {
    if (
      !siteLegalConfig.googleAnalyticsId
      || this.document.getElementById(this.analyticsScriptId)
    ) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = this.analyticsScriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${siteLegalConfig.googleAnalyticsId}`;
    this.document.head.appendChild(script);

    if (typeof window.gtag === 'function') {
      window.gtag('js', new Date());
      window.gtag('config', siteLegalConfig.googleAnalyticsId, {
        anonymize_ip: true
      });
    }
  }

  private ensureAdsenseScript(): void {
    if (
      !siteLegalConfig.googleAdsenseClientId
      || this.document.getElementById(this.adsenseScriptId)
    ) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = this.adsenseScriptId;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src =
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteLegalConfig.googleAdsenseClientId}`;
    this.document.head.appendChild(script);
  }

  private openExternalCmpPreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const functionPath = siteLegalConfig.cmp.openPreferencesFunction.trim();
    if (functionPath) {
      const maybeFunction = this.resolveWindowPath(functionPath);
      if (typeof maybeFunction === 'function') {
        maybeFunction();
        return;
      }
    }

    window.dispatchEvent(new CustomEvent('clictec:open-cmp'));
  }

  private persistRecord(record: ConsentRecord): void {
    this.writeJson(this.storageKey, record);

    const history = this.readHistory();
    const filteredHistory = history.filter((entry) => !this.isExpired(entry));
    filteredHistory.unshift(record);
    this.writeJson(this.historyKey, filteredHistory.slice(0, 12));
  }

  private readStoredRecord(): ConsentRecord | null {
    const parsed = this.readJson<ConsentRecord>(this.storageKey);
    if (!parsed) {
      return null;
    }

    if (!this.isValidRecord(parsed)) {
      return null;
    }

    return parsed;
  }

  private readHistory(): ConsentRecord[] {
    const parsed = this.readJson<ConsentRecord[]>(this.historyKey);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry) => this.isValidRecord(entry));
  }

  private clearStoredConsent(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(this.storageKey);
      window.localStorage.removeItem(this.historyKey);
    } catch {
      // Ignore storage failures. The banner will remain visible for the session.
    }
  }

  private isExpired(record: ConsentRecord): boolean {
    const decidedAt = new Date(record.decidedAt);
    if (Number.isNaN(decidedAt.getTime())) {
      return true;
    }

    const expiration = new Date(decidedAt);
    expiration.setMonth(expiration.getMonth() + siteLegalConfig.consentRetentionMonths);
    return expiration.getTime() <= Date.now();
  }

  private isValidRecord(value: unknown): value is ConsentRecord {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<ConsentRecord>;
    const preferences = candidate.preferences as Partial<ConsentPreferences> | undefined;

    return (
      typeof candidate.version === 'string'
      && typeof candidate.decidedAt === 'string'
      && (candidate.source === 'banner' || candidate.source === 'preferences')
      && Boolean(preferences)
      && preferences?.essential === true
      && typeof preferences?.analytics === 'boolean'
      && typeof preferences?.ads === 'boolean'
      && typeof preferences?.affiliate === 'boolean'
    );
  }

  private readJson<T>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private writeJson(key: string, value: unknown): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage failures. Consent still applies during the current session.
    }
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
