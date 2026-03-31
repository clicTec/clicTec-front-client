import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ConsentAwareHtmlPipe } from '../../shared/pipes/consent-aware-html.pipe';
import { ContentApiService, ReviewDetailResponse } from '../../shared/services/content-api.service';
import { SeoService } from '../../shared/services/seo.service';

interface ReviewContentBlock {
  title: string;
  paragraphs: string[];
}

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
  protected isMobileReview = false;
  protected reviewBlocks: readonly ReviewContentBlock[] = [];
  protected positiveSummaryItems: readonly string[] = [];
  protected considerationSummaryItems: readonly string[] = [];

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
        this.applyReview(review, 'mobile');
      },
      error: () => {
        this.contentApiService.getReviewBySlug(slug).subscribe({
          next: (review) => {
            this.applyReview(review, 'review');
          },
          error: () => {
            this.errorMessage = 'No se pudo cargar la review.';
            this.isLoading = false;
            this.seoService.applyNotFound(`/moviles/${slug}`);
          }
        });
      }
    });
  }

  protected getBackLink(): string {
    return '/moviles';
  }

  protected getBackLabel(): string {
    return 'Volver a móviles';
  }

  protected get headlineTitle(): string {
    if (!this.review) {
      return '';
    }

    if (this.review.slug === 'samsung-s26') {
      return 'Samsung s26';
    }

    return this.review.title;
  }

  protected hasGalleryImages(): boolean {
    return Boolean(this.review?.images.some((image) => image.type === 'gallery'));
  }

  protected hasScore(): boolean {
    return Boolean(this.review && this.review.score > 0);
  }

  protected hasSummaryCards(): boolean {
    return this.positiveSummaryItems.length > 0 || this.considerationSummaryItems.length > 0;
  }

  private applyReview(review: ReviewDetailResponse, source: 'mobile' | 'review'): void {
    this.review = review;
    this.isMobileReview = source === 'mobile';
    this.reviewBlocks = this.isMobileReview ? this.buildReviewBlocks(review.contentHtml) : [];
    this.positiveSummaryItems = this.isMobileReview ? this.buildPositiveSummaryItems(this.reviewBlocks) : [];
    this.considerationSummaryItems = this.isMobileReview
      ? this.buildConsiderationSummaryItems(this.reviewBlocks)
      : [];
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
  }

  private buildReviewBlocks(contentHtml: string): ReviewContentBlock[] {
    if (!contentHtml.trim()) {
      return [];
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(`<div>${contentHtml}</div>`, 'text/html');
    const container = document.body.firstElementChild;
    if (!container) {
      return [];
    }

    const sectionElements = Array.from(container.children).filter((element) => element.tagName.toLowerCase() === 'section');
    if (sectionElements.length > 0) {
      return sectionElements
        .map((section) => {
          const heading = section.querySelector('h2, h3');
          const title = heading?.textContent?.trim() ?? '';
          const paragraphs = Array.from(section.querySelectorAll('p'))
            .map((paragraph) => paragraph.textContent?.trim() ?? '')
            .filter((paragraph) => paragraph.length > 0);

          return { title, paragraphs };
        })
        .filter((block) => block.title.length > 0 && block.paragraphs.length > 0);
    }

    const blocks: ReviewContentBlock[] = [];
    let currentBlock: ReviewContentBlock | null = null;
    for (const element of Array.from(container.children)) {
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'h2' || tagName === 'h3') {
        if (currentBlock && currentBlock.paragraphs.length > 0) {
          blocks.push(currentBlock);
        }

        currentBlock = {
          title: element.textContent?.trim() ?? '',
          paragraphs: []
        };
        continue;
      }

      if (tagName === 'p') {
        const paragraph = element.textContent?.trim() ?? '';
        if (!paragraph) {
          continue;
        }

        if (!currentBlock) {
          currentBlock = {
            title: 'Introducción',
            paragraphs: []
          };
        }

        currentBlock.paragraphs.push(paragraph);
      }
    }

    if (currentBlock && currentBlock.paragraphs.length > 0) {
      blocks.push(currentBlock);
    }

    return blocks;
  }

  private buildPositiveSummaryItems(blocks: readonly ReviewContentBlock[]): string[] {
    const ignoredTitles = ['introduccion', 'conclusion'];
    const cautionKeywords = ['memoria', 'equilibrio', 'precio', 'coste', 'compromiso', 'ajuste'];

    return blocks
      .filter((block) => {
        const normalized = this.normalizeText(block.title);
        return (
          !ignoredTitles.includes(normalized) && !cautionKeywords.some((keyword) => normalized.includes(keyword))
        );
      })
      .slice(0, 3)
      .map((block) => block.title);
  }

  private buildConsiderationSummaryItems(blocks: readonly ReviewContentBlock[]): string[] {
    const cautionKeywords = ['memoria', 'equilibrio', 'precio', 'coste', 'compromiso', 'ajuste'];
    const matchingBlocks = blocks.filter((block) =>
      cautionKeywords.some((keyword) => this.normalizeText(block.title).includes(keyword))
    );

    if (matchingBlocks.length > 0) {
      return matchingBlocks.slice(0, 2).map((block) => block.title);
    }

    return [];
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }
}
