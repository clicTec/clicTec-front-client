import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LegalDocument,
  LegalDocumentKey,
  getLegalDocument,
  siteLegalConfig
} from '../../shared/config/site-legal.config';
import { ConsentService } from '../../shared/services/consent.service';

@Component({
  selector: 'app-legal-document-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal-document-page.html',
  styleUrl: './legal-document-page.scss'
})
export class LegalDocumentPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly consentService = inject(ConsentService);

  protected readonly siteLegalConfig = siteLegalConfig;
  protected readonly legalPages: ReadonlyArray<{ key: LegalDocumentKey; label: string; route: string }> = [
    { key: 'privacy', label: 'Privacidad', route: '/privacidad' },
    { key: 'cookies', label: 'Cookies', route: '/cookies' },
    { key: 'legal-notice', label: 'Aviso legal', route: '/aviso-legal' },
    { key: 'advertising', label: 'Publicidad y afiliación', route: '/publicidad-afiliacion' }
  ];
  protected documentKey: LegalDocumentKey = 'privacy';
  protected documentContent: LegalDocument = getLegalDocument('privacy');

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const documentKey = (data['documentKey'] as LegalDocumentKey | undefined) ?? 'privacy';
      this.documentKey = documentKey;
      this.documentContent = getLegalDocument(documentKey);
    });
  }

  protected openCookiePreferences(): void {
    this.consentService.openPreferences();
  }

  protected isExternalLink(href: string): boolean {
    return href.startsWith('http');
  }

  protected isCurrentPage(key: LegalDocumentKey): boolean {
    return this.documentKey === key;
  }
}
