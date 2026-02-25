import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface NewsletterSubscriptionRequest {
  readonly email: string;
}

export interface NewsletterSubscriptionResponse {
  readonly email: string;
  readonly status: 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED';
  readonly subscribed: boolean;
  readonly confirmationRequired: boolean;
  readonly message: string;
  readonly eventAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private readonly endpoint = 'http://localhost:8080/api/newsletter/subscribe';

  constructor(private readonly httpClient: HttpClient) {}

  subscribe(payload: NewsletterSubscriptionRequest): Observable<NewsletterSubscriptionResponse> {
    return this.httpClient.post<NewsletterSubscriptionResponse>(this.endpoint, payload);
  }
}
