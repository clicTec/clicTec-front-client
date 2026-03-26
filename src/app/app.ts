import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent';
import { FooterComponent } from './shared/components/footer/footer';
import { HeaderComponent } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet, FooterComponent, CookieConsentComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
