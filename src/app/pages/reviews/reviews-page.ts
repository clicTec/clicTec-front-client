import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService, ReviewResponse } from '../../shared/services/content-api.service';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reviews-page.html',
  styleUrl: './reviews-page.scss'
})
export class ReviewsPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  protected isLoading = true;
  protected errorMessage = '';
  protected reviews: ReviewResponse | null = null;

  ngOnInit(): void {
    this.contentApiService.getReviewPage().subscribe({
      next: (response) => {
        this.reviews = response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los análisis.';
        this.isLoading = false;
      }
    });
  }
}
