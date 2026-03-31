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
  private readonly defaultWhatsappPhone = '+34 614556353';

  readonly currentYear = new Date().getFullYear();
  protected readonly siteLegalConfig = this.consentService.siteConfig;
  protected readonly utilityLinks = computed(() => this.siteLegalConfig().documents);
  protected readonly whatsappHref = computed(() => {
    const rawPhone = (this.siteLegalConfig().contactPhone ?? '').trim() || this.defaultWhatsappPhone;
    const digitsOnlyPhone = rawPhone.replace(/\D+/g, '');
    return digitsOnlyPhone ? `https://wa.me/${digitsOnlyPhone}` : '';
  });

  protected openCookiePreferences(): void {
    this.consentService.openPreferences();
  }
}
