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
  protected recommendedBrands: readonly BrandLink[] = mapRecommendedBrands();

  ngOnInit(): void {
    this.loadHomePage();
  }

  private loadHomePage(): void {
    this.contentApiService.getHomePage().subscribe({
      next: (response) => {
        this.home = {
          ...response,
          updates: response.updates ?? [],
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
}
