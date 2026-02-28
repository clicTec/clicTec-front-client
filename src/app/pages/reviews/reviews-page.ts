import { Component, OnInit, inject } from '@angular/core';
import { ContentApiService, ReviewResponse } from '../../shared/services/content-api.service';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  templateUrl: './reviews-page.html',
  styleUrl: './reviews-page.scss'
})
export class ReviewsPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  protected isLoading = true;
  protected errorMessage = '';
  protected review: ReviewResponse | null = null;

  ngOnInit(): void {
    this.contentApiService.getReviewPage().subscribe({
      next: (response) => {
        this.review = response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar Noticias Tec.';
        this.isLoading = false;
      }
    });
  }
}
