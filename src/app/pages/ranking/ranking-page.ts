import { Component, OnInit, inject } from '@angular/core';
import { ContentApiService, RankingResponse } from '../../shared/services/content-api.service';

interface RankingArticle {
  readonly title: string;
  readonly summary: string;
  readonly criteria: readonly string[];
}

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

  protected get rankingArticles(): readonly RankingArticle[] {
    return (this.ranking?.items ?? []).map((item) => this.toRankingArticle(item));
  }

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

  private toRankingArticle(item: string): RankingArticle {
    const normalized = this.normalize(item);

    if (normalized.includes('calidad') || normalized.includes('precio')) {
      return {
        title: item,
        summary:
          'Ordenamos por equilibrio entre precio real, soporte, batería, pantalla y cámara. No gana siempre el más barato.',
        criteria: [
          'Precio frente a rivales directos',
          'Años de actualizaciones',
          'Autonomía y rendimiento diario'
        ]
      };
    }

    if (normalized.includes('camara')) {
      return {
        title: item,
        summary:
          'El ranking de cámara da más peso a consistencia, vídeo, enfoque y noche que a la cifra de megapíxeles.',
        criteria: [
          'Foto principal y ultra gran angular',
          'Vídeo estabilizado',
          'Procesado de piel, color y noche'
        ]
      };
    }

    if (normalized.includes('premium')) {
      return {
        title: item,
        summary:
          'En gama premium miramos rendimiento sostenido, pantalla, ecosistema, materiales y vida útil del software.',
        criteria: [
          'Potencia y eficiencia',
          'Pantalla y construcción',
          'Soporte y valor de reventa'
        ]
      };
    }

    if (normalized.includes('media')) {
      return {
        title: item,
        summary:
          'La gama media se decide por pequeños compromisos: cámara secundaria, carga, brillo y soporte de parches.',
        criteria: [
          'Pantalla legible en exterior',
          'Cámara fiable de día y noche',
          'Batería y actualizaciones'
        ]
      };
    }

    return {
      title: item,
      summary:
        'Ranking editorial basado en especificaciones, experiencia de uso y comparación con alternativas directas.',
      criteria: ['Precio real', 'Uso diario', 'Soporte de software']
    };
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
