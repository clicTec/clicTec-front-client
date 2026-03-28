export type LegalDocumentKey = 'privacy' | 'cookies' | 'legal-notice' | 'advertising';
export type ConsentSource = 'banner' | 'preferences';
export type CmpMode = 'custom-banner' | 'external-certified';

export interface LegalDocumentLink {
  readonly label: string;
  readonly href: string;
}

export interface LegalDocumentSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly items: readonly string[];
  readonly links: readonly LegalDocumentLink[];
  readonly note: string | null;
}

export interface LegalDocumentNav {
  readonly key: string;
  readonly label: string;
  readonly route: string;
}

export interface LegalDocument {
  readonly key: string;
  readonly label: string;
  readonly route: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly lastUpdated: string;
  readonly sections: readonly LegalDocumentSection[];
}

export interface LegalSocialProfiles {
  readonly facebook: string;
  readonly x: string;
  readonly instagram: string;
  readonly tiktok: string;
}

export interface ExternalCmpConfig {
  readonly mode: CmpMode;
  readonly providerName: string;
  readonly scriptUrl: string;
  readonly openPreferencesFunction: string;
}

export interface LegalSiteConfig {
  readonly brandName: string;
  readonly domain: string;
  readonly ownerName: string;
  readonly contactEmail: string;
  readonly socialProfiles: LegalSocialProfiles;
  readonly consentVersion: string;
  readonly consentRetentionMonths: number;
  readonly lastUpdated: string;
  readonly googleAnalyticsId: string;
  readonly googleAdsenseClientId: string;
  readonly cmp: ExternalCmpConfig;
  readonly documents: readonly LegalDocumentNav[];
}

export interface ConsentPreferences {
  readonly essential: true;
  readonly analytics: boolean;
  readonly ads: boolean;
  readonly affiliate: boolean;
}

export interface ConsentRecord {
  readonly version: string;
  readonly decidedAt: string;
  readonly expiresAt: string;
  readonly source: ConsentSource;
  readonly preferences: ConsentPreferences;
}

export interface LegalConsentResponse {
  readonly configured: boolean;
  readonly version: string | null;
  readonly source: ConsentSource | null;
  readonly decidedAt: string | null;
  readonly expiresAt: string | null;
  readonly preferences: ConsentPreferences | null;
}

export interface SaveLegalConsentRequest {
  readonly source: ConsentSource;
  readonly analytics: boolean;
  readonly ads: boolean;
  readonly affiliate: boolean;
}

export const EMPTY_LEGAL_SITE_CONFIG: LegalSiteConfig = {
  brandName: 'clicTec',
  domain: '',
  ownerName: '',
  contactEmail: '',
  socialProfiles: {
    facebook: '',
    x: '',
    instagram: '',
    tiktok: ''
  },
  consentVersion: '',
  consentRetentionMonths: 24,
  lastUpdated: '',
  googleAnalyticsId: '',
  googleAdsenseClientId: '',
  cmp: {
    mode: 'custom-banner',
    providerName: '',
    scriptUrl: '',
    openPreferencesFunction: ''
  },
  documents: []
};

export const EMPTY_LEGAL_DOCUMENT: LegalDocument = {
  key: 'privacy',
  label: 'Privacidad',
  route: '/privacidad',
  eyebrow: '',
  title: '',
  summary: '',
  lastUpdated: '',
  sections: []
};

export function isLegalDocumentKey(value: string): value is LegalDocumentKey {
  return value === 'privacy'
    || value === 'cookies'
    || value === 'legal-notice'
    || value === 'advertising';
}
