import { Component, OnInit, inject } from '@angular/core';
import { ContentApiService, RankingResponse } from '../../shared/services/content-api.service';

@Component({
  selector: 'app-ranking-page',
  standalone: true,
  templateUrl: './ranking-page.html',
  styleUrl: './ranking-page.scss'
})
export class RankingPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  protected isLoading = true;
  protected errorMessage = '';
  protected ranking: RankingResponse | null = null;

  ngOnInit(): void {
    this.contentApiService.getRankingPage().subscribe({
      next: (response) => {
        this.ranking = response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el ranking.';
        this.isLoading = false;
      }
    });
  }
}
