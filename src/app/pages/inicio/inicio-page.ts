import { NgStyle } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MOBILE_CARD_IMAGE_OVERRIDES,
  MobileImageStyle
} from '../../shared/config/mobile-card-image.config';
import { ContentApiService, HomeResponse, HomeUpdateItemResponse } from '../../shared/services/content-api.service';
import { BrandLink, mapRecommendedBrands } from '../../shared/utils/brand.utils';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [RouterLink, NgStyle],
  templateUrl: './inicio-page.html',
  styleUrls: ['./inicio-page.scss']
})
export class InicioPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  protected readonly cardImageOverrides = MOBILE_CARD_IMAGE_OVERRIDES;
  protected isLoading = true;
  protected errorMessage = '';
  protected home: HomeResponse | null = null;
  protected recommendedBrands: readonly BrandLink[] = mapRecommendedBrands();

  ngOnInit(): void {
    this.loadHomePage();
  }

  protected getUpdateImageSource(item: HomeUpdateItemResponse): string {
    const slug = this.getUpdateSlug(item);
    const overrideSource = this.cardImageOverrides[slug]?.src?.trim();
    return overrideSource && overrideSource.length > 0 ? overrideSource : item.imageUrl;
  }

  protected getUpdateImageFrameStyle(item: HomeUpdateItemResponse): MobileImageStyle | null {
    const slug = this.getUpdateSlug(item);
    const frameStyle = this.cardImageOverrides[slug]?.frameStyle;
    if (!frameStyle) {
      return null;
    }

    return {
      ...frameStyle,
      borderBottomColor: 'transparent'
    };
  }

  protected getUpdateImageStyle(item: HomeUpdateItemResponse): MobileImageStyle | null {
    const overrideStyle = this.cardImageOverrides[this.getUpdateSlug(item)]?.imageStyle;
    const translateTransform = this.extractTranslateTransform(overrideStyle?.['transform']);

    return {
      objectPosition: overrideStyle?.['objectPosition'] ?? 'center center',
      transform: translateTransform ? `${translateTransform} scale(1.2)` : 'scale(1.2)',
      transformOrigin: overrideStyle?.['transformOrigin'] ?? 'center center'
    };
  }

  private loadHomePage(): void {
    this.contentApiService.getHomePage().subscribe({
      next: (response) => {
        this.home = {
          ...response,
          updates: this.selectUniqueBrandUpdates(response.updates ?? []),
          recommendedBrands: response.recommendedBrands ?? []
        };
        this.recommendedBrands = response.recommendedBrands?.length
          ? response.recommendedBrands
          : mapRecommendedBrands();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la portada.';
        this.isLoading = false;
      }
    });
  }

  private selectUniqueBrandUpdates(updates: readonly HomeUpdateItemResponse[]): HomeUpdateItemResponse[] {
    if (!updates.length) {
      return [];
    }

    const seenBrands = new Set<string>();
    const selected: HomeUpdateItemResponse[] = [];

    for (const update of updates) {
      const brandKey = update.title.split(/\s+/, 1)[0]?.trim().toLowerCase();
      if (!brandKey || seenBrands.has(brandKey)) {
        continue;
      }

      seenBrands.add(brandKey);
      selected.push(update);

      if (selected.length === 4) {
        break;
      }
    }

    return selected;
  }

  private getUpdateSlug(item: HomeUpdateItemResponse): string {
    const route = item.route?.trim() ?? '';
    return route.split('/').filter(Boolean).at(-1) ?? '';
  }

  private extractTranslateTransform(transform: string | undefined): string {
    if (!transform) {
      return '';
    }

    const matches = transform.match(/translate(?:X|Y)?\([^)]+\)|translate\([^)]+\)/g);
    return matches?.join(' ') ?? '';
  }
}
