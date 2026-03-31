import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService, HomeResponse } from '../../shared/services/content-api.service';
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
  protected recommendedBrands: readonly BrandLink[] = [];

  ngOnInit(): void {
    this.loadHomePage();
    this.loadRecommendedBrands();
  }

  private loadHomePage(): void {
    this.contentApiService.getHomePage().subscribe({
      next: (response) => {
        this.home = {
          ...response,
          updates: response.updates ?? []
        };
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la portada.';
        this.isLoading = false;
      }
    });
  }

  private loadRecommendedBrands(): void {
    this.contentApiService
      .getMobilePage({
        brand: '',
        tier: '',
        priceRange: '',
        os: '',
        search: '',
        page: 1,
        size: 1
      })
      .subscribe({
        next: (response) => {
          const brandOptions = response.filterGroups.find((group) => group.key === 'brand')?.options ?? [];
          this.recommendedBrands = mapRecommendedBrands(brandOptions);
        },
        error: () => {
          this.recommendedBrands = [];
        }
      });
  }
}
