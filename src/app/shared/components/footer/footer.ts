import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConsentService } from '../../services/consent.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  protected readonly consentService = inject(ConsentService);

  readonly currentYear = new Date().getFullYear();
  protected readonly siteLegalConfig = this.consentService.siteConfig;
  protected readonly utilityLinks = computed(() => this.siteLegalConfig().documents);

  protected openCookiePreferences(): void {
    this.consentService.openPreferences();
  }
}
