import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import {
  LegalConsentResponse,
  LegalDocument,
  LegalDocumentKey,
  LegalSiteConfig,
  SaveLegalConsentRequest
} from '../config/site-legal.config';
import { API_BASE_URL, resolveApiUrl } from '../config/api-base.token';

@Injectable({
  providedIn: 'root'
})
export class LegalApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private resolveUrl(path: string): string {
    return resolveApiUrl(this.apiBaseUrl, `/api/legal${path}`);
  }

  private readonly cachedLegalConfigRequest$ = defer(() =>
    this.httpClient.get<LegalSiteConfig>(this.resolveUrl('/config'))
  ).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getLegalConfig(useCached = true): Observable<LegalSiteConfig> {
    return useCached
      ? this.cachedLegalConfigRequest$
      : this.httpClient.get<LegalSiteConfig>(this.resolveUrl('/config'));
  }

  getLegalDocument(documentKey: LegalDocumentKey): Observable<LegalDocument> {
    return this.httpClient.get<LegalDocument>(this.resolveUrl(`/documents/${documentKey}`));
  }

  getConsent(): Observable<LegalConsentResponse> {
    return this.httpClient.get<LegalConsentResponse>(this.resolveUrl('/consent'));
  }

  saveConsent(request: SaveLegalConsentRequest): Observable<LegalConsentResponse> {
    return this.httpClient.post<LegalConsentResponse>(this.resolveUrl('/consent'), request);
  }
}
