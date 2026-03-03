import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ContentApiService, ReviewDetailResponse } from '../../shared/services/content-api.service';

@Component({
  selector: 'app-review-detail-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './review-detail-page.html',
  styleUrl: './review-detail-page.scss'
})
export class ReviewDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly contentApiService = inject(ContentApiService);

  protected isLoading = true;
  protected errorMessage = '';
  protected review: ReviewDetailResponse | null = null;

  ngOnInit(): void {
    const slug = (this.route.snapshot.paramMap.get('slug') ?? '').trim();
    if (!slug) {
      this.errorMessage = 'Review no encontrada.';
      this.isLoading = false;
      return;
    }

    this.contentApiService.getReviewBySlug(slug).subscribe({
      next: (review) => {
        this.review = review;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la review.';
        this.isLoading = false;
      }
    });
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(date);
  }

  protected hasGalleryImages(): boolean {
    return Boolean(this.review?.images.some((image) => image.type === 'gallery'));
  }
}
