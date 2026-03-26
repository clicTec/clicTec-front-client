import { Component, HostListener, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConsentService } from '../../services/consent.service';

interface ConsentDraft {
  analytics: boolean;
  ads: boolean;
  affiliate: boolean;
}

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.scss'
})
export class CookieConsentComponent {
  protected readonly consentService = inject(ConsentService);

  protected draft: ConsentDraft = {
    analytics: false,
    ads: false,
    affiliate: false
  };

  constructor() {
    effect(() => {
      if (!this.consentService.preferencesOpen()) {
        return;
      }

      const preferences = this.consentService.preferences();
      this.draft = {
        analytics: preferences.analytics,
        ads: preferences.ads,
        affiliate: preferences.affiliate
      };
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscapePressed(): void {
    if (this.consentService.preferencesOpen()) {
      this.closePreferences();
    }
  }

  protected acceptAll(): void {
    this.consentService.acceptAll(this.consentService.preferencesOpen() ? 'preferences' : 'banner');
  }

  protected rejectAll(): void {
    this.consentService.rejectAll(this.consentService.preferencesOpen() ? 'preferences' : 'banner');
  }

  protected openPreferences(): void {
    this.consentService.openPreferences();
  }

  protected closePreferences(): void {
    this.consentService.closePreferences();
  }

  protected updateDraft(key: keyof ConsentDraft, value: boolean): void {
    this.draft = {
      ...this.draft,
      [key]: value
    };
  }

  protected savePreferences(): void {
    this.consentService.savePreferences(this.draft);
  }

  protected formatDecisionDate(): string {
    const record = this.consentService.record();
    if (!record) {
      return 'Sin registro previo';
    }

    const date = new Date(record.decidedAt);
    if (Number.isNaN(date.getTime())) {
      return 'Sin registro previo';
    }

    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(date);
  }
}
