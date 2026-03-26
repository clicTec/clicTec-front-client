import { Component, OnInit, inject } from '@angular/core';
import { ContentApiService, TechNewsResponse } from '../../shared/services/content-api.service';

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
  protected techNews: readonly TechNewsResponse[] = [];

  ngOnInit(): void {
    this.contentApiService.getTechNews().subscribe({
      next: (response) => {
        this.techNews = response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar Noticias Tec.';
        this.isLoading = false;
      }
    });
  }

  protected formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
}
