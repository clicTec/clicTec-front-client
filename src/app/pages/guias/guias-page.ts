import { Component, OnInit, inject } from '@angular/core';
import { ContentApiService, GuideResponse } from '../../shared/services/content-api.service';

interface GuideArticle {
  readonly title: string;
  readonly summary: string;
  readonly checks: readonly string[];
}

@Component({
  selector: 'app-guias-page',
  standalone: true,
  templateUrl: './guias-page.html',
  styleUrl: './guias-page.scss'
})
export class GuiasPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  protected isLoading = true;
  protected errorMessage = '';
  protected guide: GuideResponse | null = null;

  protected get guideArticles(): readonly GuideArticle[] {
    return (this.guide?.items ?? []).map((item) => this.toGuideArticle(item));
  }

  ngOnInit(): void {
    this.contentApiService.getGuidePage().subscribe({
      next: (response) => {
        this.guide = response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el contenido de guías.';
        this.isLoading = false;
      }
    });
  }

  private toGuideArticle(item: string): GuideArticle {
    const normalized = this.normalize(item);

    if (normalized.includes('300')) {
      return {
        title: item,
        summary:
          'Para presupuestos ajustados conviene priorizar batería, pantalla legible y soporte antes que megapíxeles o carga extrema.',
        checks: [
          'Busca al menos 128 GB de almacenamiento y 6 GB de RAM.',
          'Evita pantallas con brillo bajo si usas mucho el móvil en exterior.',
          'Comprueba que el fabricante prometa varios años de parches.'
        ]
      };
    }

    if (normalized.includes('camara')) {
      return {
        title: item,
        summary:
          'Una buena cámara no depende solo del sensor principal: consistencia, vídeo, procesado y ultra gran angular pesan mucho.',
        checks: [
          'Valora estabilización óptica y resultados nocturnos reales.',
          'Revisa si el color se mantiene entre cámara principal y ultra gran angular.',
          'Para vídeo, prioriza estabilización, rango dinámico y enfoque.'
        ]
      };
    }

    if (normalized.includes('bateria')) {
      return {
        title: item,
        summary:
          'Los mAh orientan, pero la autonomía real depende de pantalla, procesador, cobertura, software y temperatura.',
        checks: [
          'Compara horas de pantalla, no solo capacidad nominal.',
          'Mira si la carga rápida necesita cargador propietario.',
          'Comprueba el desgaste esperado si cargas todos los días al 100%.'
        ]
      };
    }

    if (normalized.includes('gaming')) {
      return {
        title: item,
        summary:
          'Para jugar importan la estabilidad térmica, el panel táctil, el audio y que el rendimiento no caiga tras diez minutos.',
        checks: [
          'Prioriza chip potente con buena disipación, no solo puntuación máxima.',
          'Busca pantalla de 120 Hz y respuesta táctil estable.',
          'Valora batería grande y carga rápida si juegas fuera de casa.'
        ]
      };
    }

    if (normalized.includes('compacto')) {
      return {
        title: item,
        summary:
          'Un móvil compacto debe ser cómodo sin sacrificar pantalla útil, batería suficiente ni soporte de software.',
        checks: [
          'Comprueba peso, anchura y uso real con una mano.',
          'Evita modelos compactos con batería demasiado justa.',
          'Revisa si la cámara mantiene el nivel de la versión grande.'
        ]
      };
    }

    return {
      title: item,
      summary:
        'Guía editorial para comparar especificaciones con necesidades reales antes de decidir la compra.',
      checks: [
        'Define presupuesto y prioridad principal.',
        'Compara frente a dos rivales directos.',
        'Revisa soporte, batería y precio real en tienda.'
      ]
    };
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
