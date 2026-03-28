import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  EMPTY_LEGAL_DOCUMENT,
  LegalDocument,
  LegalDocumentKey,
  isLegalDocumentKey
} from '../../shared/config/site-legal.config';
import { ConsentService } from '../../shared/services/consent.service';
import { LegalApiService } from '../../shared/services/legal-api.service';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-legal-document-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal-document-page.html',
  styleUrl: './legal-document-page.scss'
})
export class LegalDocumentPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  protected readonly consentService = inject(ConsentService);
  private readonly legalApiService = inject(LegalApiService);
  private readonly seoService = inject(SeoService);

  protected readonly siteLegalConfig = this.consentService.siteConfig;
  protected readonly legalPages = computed(() => this.siteLegalConfig().documents);
  protected readonly documentContent = signal<LegalDocument>(EMPTY_LEGAL_DOCUMENT);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected documentKey: LegalDocumentKey = 'privacy';

  ngOnInit(): void {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const candidateKey = String(data['documentKey'] ?? 'privacy');
        const documentKey = isLegalDocumentKey(candidateKey) ? candidateKey : 'privacy';
        this.documentKey = documentKey;
        this.loadDocument(documentKey);
      });
  }

  protected openCookiePreferences(): void {
    this.consentService.openPreferences();
  }

  protected isExternalLink(href: string): boolean {
    return href.startsWith('http');
  }

  protected isCurrentPage(key: string): boolean {
    return this.documentKey === key;
  }

  private loadDocument(documentKey: LegalDocumentKey): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.legalApiService.getLegalDocument(documentKey).subscribe({
      next: (document) => {
        this.documentContent.set(document);
        this.isLoading.set(false);
        this.seoService.applyPage({
          title: document.title,
          description: document.summary,
          path: document.route
        });
      },
      error: () => {
        this.documentContent.set({
          ...EMPTY_LEGAL_DOCUMENT,
          key: documentKey
        });
        this.errorMessage.set(
          'No se pudo cargar este documento legal desde el servidor. Inténtalo de nuevo en unos segundos.'
        );
        this.isLoading.set(false);
      }
    });
  }
}
