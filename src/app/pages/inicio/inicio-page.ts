import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService, HomeResponse, HomeUpdateItemResponse } from '../../shared/services/content-api.service';
import { BrandLink, mapRecommendedBrands } from '../../shared/utils/brand.utils';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-page.html',
  styleUrls: ['./inicio-page.scss']
})
export class InicioPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  protected isLoading = true;
  protected errorMessage = '';
  protected home: HomeResponse | null = null;
  protected recommendedBrands: readonly BrandLink[] = mapRecommendedBrands();

  ngOnInit(): void {
    this.loadHomePage();
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
}
