import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { siteLegalConfig } from '../../config/site-legal.config';
import { ConsentService } from '../../services/consent.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  private readonly consentService = inject(ConsentService);

  readonly currentYear = new Date().getFullYear();
  protected readonly siteLegalConfig = siteLegalConfig;
  protected readonly utilityLinks = [
    {
      label: 'Política de privacidad',
      route: '/privacidad'
    },
    {
      label: 'Política de cookies',
      route: '/cookies'
    },
    {
      label: 'Aviso legal',
      route: '/aviso-legal'
    },
    {
      label: 'Publicidad y afiliación',
      route: '/publicidad-afiliacion'
    }
  ] as const;

  protected openCookiePreferences(): void {
    this.consentService.openPreferences();
  }
}
