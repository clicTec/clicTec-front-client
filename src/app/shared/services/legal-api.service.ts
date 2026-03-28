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

@Injectable({
  providedIn: 'root'
})
export class LegalApiService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBase = '/api/legal';

  private readonly cachedLegalConfigRequest$ = defer(() =>
    this.httpClient.get<LegalSiteConfig>(`${this.apiBase}/config`)
  ).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getLegalConfig(useCached = true): Observable<LegalSiteConfig> {
    return useCached
      ? this.cachedLegalConfigRequest$
      : this.httpClient.get<LegalSiteConfig>(`${this.apiBase}/config`);
  }

  getLegalDocument(documentKey: LegalDocumentKey): Observable<LegalDocument> {
    return this.httpClient.get<LegalDocument>(`${this.apiBase}/documents/${documentKey}`);
  }

  getConsent(): Observable<LegalConsentResponse> {
    return this.httpClient.get<LegalConsentResponse>(`${this.apiBase}/consent`);
  }

  saveConsent(request: SaveLegalConsentRequest): Observable<LegalConsentResponse> {
    return this.httpClient.post<LegalConsentResponse>(`${this.apiBase}/consent`, request);
  }
}
