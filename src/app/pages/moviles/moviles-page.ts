import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface MobileFilterGroup {
  readonly key: FilterKey;
  readonly title: string;
  readonly options: readonly string[];
}

interface MobileSpec {
  readonly label: string;
  readonly value: string;
}

interface MobileCard {
  readonly slug: string;
  readonly model: string;
  readonly brand: string;
  readonly segment: string;
  readonly price: string;
  readonly score: string;
  readonly summary: string;
  readonly chips: readonly string[];
  readonly specs: readonly MobileSpec[];
  readonly route: string;
  readonly routeLabel: string;
  readonly tier: MobileTier;
  readonly priceRange: PriceRange;
  readonly os: MobileSystem;
}

interface LaunchEntry {
  readonly month: string;
  readonly device: string;
  readonly target: string;
  readonly notes: string;
}

type FilterKey = 'brand' | 'tier' | 'priceRange' | 'os';
type MobileTier = 'Entrada' | 'Calidad-precio' | 'Alta' | 'Premium';
type PriceRange = 'Menos de 300' | '300 - 400' | '400 - 700 EUR' | '700+';
type MobileSystem = 'Android 15' | 'Android 14' | 'iOS 19';

@Component({
  selector: 'app-moviles-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './moviles-page.html',
  styleUrl: './moviles-page.scss'
})
export class MovilesPageComponent {
  private readonly pageSize = 3;

  protected selectedFilters: Record<FilterKey, string> = {
    brand: 'Samsung',
    tier: 'Calidad-precio',
    priceRange: '400 - 700 EUR',
    os: 'Android 15'
  };

  protected currentPage = 1;

  protected readonly filterGroups: readonly MobileFilterGroup[] = [
    {
      key: 'brand',
      title: 'Marca',
      options: ['Samsung', 'Apple', 'Xiaomi', 'Google', 'OnePlus']
    },
    {
      key: 'tier',
      title: 'Gama',
      options: ['Entrada', 'Calidad-precio', 'Alta', 'Premium']
    },
    {
      key: 'priceRange',
      title: 'Precio',
      options: ['Menos de 300', '300 - 400', '400 - 700 EUR', '700+']
    },
    {
      key: 'os',
      title: 'Sistema',
      options: ['Android 15', 'Android 14', 'iOS 19']
    }
  ];

  protected readonly mobileCatalog: readonly MobileCard[] = [
    {
      slug: 'samsung-galaxy-a56',
      model: 'Galaxy A56',
      brand: 'Samsung',
      segment: 'Gama media',
      price: 'Desde 499 EUR',
      score: '8.8',
      summary: 'Panel muy equilibrado, buena bateria y camara estable para uso diario.',
      chips: ['Pantalla AMOLED', 'IP67', '6 anos de updates'],
      specs: [
        { label: 'Procesador', value: 'Exynos 1580' },
        { label: 'Bateria', value: '5000 mAh + 45W' },
        { label: 'Camara principal', value: '50 MP OIS' }
      ],
      route: '/reviews',
      routeLabel: 'Ver review',
      tier: 'Calidad-precio',
      priceRange: '400 - 700 EUR',
      os: 'Android 15'
    },
    {
      slug: 'iphone-16e',
      model: 'iPhone 16e',
      brand: 'Apple',
      segment: 'Compacto premium',
      price: 'Desde 729 EUR',
      score: '8.6',
      summary: 'Rendimiento top en formato compacto y gran grabacion de video.',
      chips: ['Chip A18', 'Video 4K', 'Face ID'],
      specs: [
        { label: 'Procesador', value: 'Apple A18' },
        { label: 'Bateria', value: 'Hasta 22 h de video' },
        { label: 'Camara principal', value: '48 MP' }
      ],
      route: '/comparativas',
      routeLabel: 'Comparar',
      tier: 'Premium',
      priceRange: '700+',
      os: 'iOS 19'
    },
    {
      slug: 'xiaomi-14t',
      model: 'Xiaomi 14T',
      brand: 'Xiaomi',
      segment: 'Calidad-precio',
      price: 'Desde 579 EUR',
      score: '8.7',
      summary: 'Muy buen rendimiento sostenido y carga rapida para usuarios intensivos.',
      chips: ['Carga 120W', '144 Hz', 'Leica tuned'],
      specs: [
        { label: 'Procesador', value: 'Dimensity 9300+' },
        { label: 'Bateria', value: '5000 mAh + 120W' },
        { label: 'Camara principal', value: '50 MP OIS' }
      ],
      route: '/ranking',
      routeLabel: 'Ver ranking',
      tier: 'Calidad-precio',
      priceRange: '400 - 700 EUR',
      os: 'Android 15'
    },
    {
      slug: 'pixel-9',
      model: 'Pixel 9',
      brand: 'Google',
      segment: 'Foto y software',
      price: 'Desde 799 EUR',
      score: '8.9',
      summary: 'Experiencia Android limpia y fotografia computacional muy consistente.',
      chips: ['Android puro', '7 anos de parches', 'Gemini AI'],
      specs: [
        { label: 'Procesador', value: 'Tensor G4' },
        { label: 'Bateria', value: '4700 mAh + 45W' },
        { label: 'Camara principal', value: '50 MP + ultra wide' }
      ],
      route: '/reviews',
      routeLabel: 'Ver review',
      tier: 'Premium',
      priceRange: '700+',
      os: 'Android 15'
    },
    {
      slug: 'oneplus-13r',
      model: 'OnePlus 13R',
      brand: 'OnePlus',
      segment: 'Rendimiento',
      price: 'Desde 649 EUR',
      score: '8.5',
      summary: 'Excelente fluidez en juegos, buena refrigeracion y autonomia alta.',
      chips: ['LTPO 120 Hz', 'Gaming estable', 'Aqua touch'],
      specs: [
        { label: 'Procesador', value: 'Snapdragon 8 Gen 3' },
        { label: 'Bateria', value: '5500 mAh + 100W' },
        { label: 'Camara principal', value: '50 MP Sony LYT' }
      ],
      route: '/comparativas',
      routeLabel: 'Comparar',
      tier: 'Alta',
      priceRange: '400 - 700 EUR',
      os: 'Android 15'
    },
    {
      slug: 'nothing-phone-3a-pro',
      model: 'Nothing Phone 3a Pro',
      brand: 'Nothing',
      segment: 'Diseno diferencial',
      price: 'Desde 469 EUR',
      score: '8.3',
      summary: 'Interfaz ligera, diseno unico y buen equilibrio para uso general.',
      chips: ['Glyph UI', 'Interfaz limpia', 'Buen audio'],
      specs: [
        { label: 'Procesador', value: 'Snapdragon 7s Gen 3' },
        { label: 'Bateria', value: '5000 mAh + 50W' },
        { label: 'Camara principal', value: '50 MP OIS' }
      ],
      route: '/guias',
      routeLabel: 'Ver guia',
      tier: 'Calidad-precio',
      priceRange: '400 - 700 EUR',
      os: 'Android 14'
    }
  ];

  protected readonly launchCalendar: readonly LaunchEntry[] = [
    {
      month: 'Marzo',
      device: 'Galaxy S26 FE',
      target: 'Gama alta accesible',
      notes: 'Esperado con zoom optico mejorado y bateria de mayor densidad.'
    },
    {
      month: 'Abril',
      device: 'Pixel 9a',
      target: 'Gama media compacta',
      notes: 'Apuesta por fotografia y soporte de software largo.'
    },
    {
      month: 'Mayo',
      device: 'Xiaomi 15 Lite',
      target: 'Calidad-precio',
      notes: 'Enfoque en carga rapida y panel brillante para exterior.'
    }
  ];

  protected readonly buyingChecklist: readonly string[] = [
    'Define tu presupuesto maximo antes de comparar camaras.',
    'Busca al menos 256 GB si grabas mucho video.',
    'Confirma la politica de actualizaciones de software.',
    'Valora bateria real en horas de pantalla, no solo mAh.',
    'Si juegas, revisa estabilidad termica y caida de fps.'
  ];

  protected get filteredCatalog(): readonly MobileCard[] {
    return this.mobileCatalog.filter(
      (phone) =>
        phone.brand === this.selectedFilters.brand &&
        phone.tier === this.selectedFilters.tier &&
        phone.priceRange === this.selectedFilters.priceRange &&
        phone.os === this.selectedFilters.os
    );
  }

  protected get totalPages(): number {
    const pages = Math.ceil(this.filteredCatalog.length / this.pageSize);
    return Math.max(1, pages);
  }

  protected get paginatedCatalog(): readonly MobileCard[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCatalog.slice(start, start + this.pageSize);
  }

  protected get pageNumbers(): readonly number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  protected get visibleStart(): number {
    if (this.filteredCatalog.length === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  protected get visibleEnd(): number {
    const tentativeEnd = this.currentPage * this.pageSize;
    return Math.min(tentativeEnd, this.filteredCatalog.length);
  }

  protected setFilter(key: FilterKey, value: string): void {
    this.selectedFilters = {
      ...this.selectedFilters,
      [key]: value
    };
    this.currentPage = 1;
  }

  protected isSelectedFilter(key: FilterKey, value: string): boolean {
    return this.selectedFilters[key] === value;
  }

  protected previousPage(): void {
    if (this.currentPage === 1) {
      return;
    }
    this.currentPage -= 1;
  }

  protected nextPage(): void {
    if (this.currentPage === this.totalPages) {
      return;
    }
    this.currentPage += 1;
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }
}
