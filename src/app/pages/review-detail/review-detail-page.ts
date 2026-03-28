import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ConsentAwareHtmlPipe } from '../../shared/pipes/consent-aware-html.pipe';
import { ContentApiService, ReviewDetailResponse } from '../../shared/services/content-api.service';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-review-detail-page',
  standalone: true,
  imports: [RouterLink, ConsentAwareHtmlPipe],
  templateUrl: './review-detail-page.html',
  styleUrl: './review-detail-page.scss'
})
export class ReviewDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly contentApiService = inject(ContentApiService);
  private readonly seoService = inject(SeoService);

  protected isLoading = true;
  protected errorMessage = '';
  protected review: ReviewDetailResponse | null = null;

  ngOnInit(): void {
    const slug = (this.route.snapshot.paramMap.get('slug') ?? '').trim();
    if (!slug) {
      this.errorMessage = 'Review no encontrada.';
      this.isLoading = false;
      this.seoService.applyNotFound('/moviles');
      return;
    }

    this.contentApiService.getMobileReviewBySlug(slug).subscribe({
      next: (review) => {
        this.review = review;
        this.isLoading = false;
        this.seoService.applyPage({
          title: review.title,
          description: review.excerpt,
          path: `/moviles/${review.slug}`,
          image: review.coverImage,
          type: 'article',
          structuredData: this.seoService.buildArticleSchema({
            headline: review.title,
            description: review.excerpt,
            path: `/moviles/${review.slug}`,
            image: review.coverImage,
            publishedAt: review.publishedAt,
            updatedAt: review.publishedAt
          })
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la review.';
        this.isLoading = false;
        this.seoService.applyNotFound(`/moviles/${slug}`);
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

  protected hasScore(): boolean {
    return Boolean(this.review && this.review.score > 0);
  }

  protected hasReviewMeta(): boolean {
    return this.hasScore() || Boolean(this.formatDate(this.review?.publishedAt ?? null));
  }
}
