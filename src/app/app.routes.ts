import { Routes } from '@angular/router';
import { ComparativasPageComponent } from './pages/comparativas/comparativas-page';
import { GuiasPageComponent } from './pages/guias/guias-page';
import { InicioPageComponent } from './pages/inicio/inicio-page';
import { LegalDocumentPageComponent } from './pages/legal-document/legal-document-page';
import { MarcaPageComponent } from './pages/marca/marca-page';
import { MovilesPageComponent } from './pages/moviles/moviles-page';
import { NotFoundPageComponent } from './pages/not-found/not-found-page';
import { ReviewDetailPageComponent } from './pages/review-detail/review-detail-page';
import { RankingPageComponent } from './pages/ranking/ranking-page';
import { ReviewsPageComponent } from './pages/reviews/reviews-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: InicioPageComponent,
    data: {
      seoTitle: 'clicTec | Comparativas, móviles, guías y actualidad tecnológica',
      seoDescription:
        'Descubre los mejores móviles del mercado con análisis completos, comparativas reales y guías de compra actualizadas. Comparamos iPhone, Samsung, Xiaomi y más para ayudarte a elegir el smartphone perfecto según tu presupuesto.',
      seoCanonicalPath: '/',
      seoSchema: 'website'
    }
  },
  {
    path: 'inicio',
    pathMatch: 'full',
    redirectTo: ''
  },
  {
    path: 'moviles',
    component: MovilesPageComponent,
    data: {
      seoTitle: 'Reviews de móviles',
      seoDescription:
        'Reviews de móviles con foco en diseño, cámara, batería, software y relación calidad-precio.',
      seoCanonicalPath: '/moviles'
    }
  },
  {
    path: 'marcas/:brandSlug',
    component: MarcaPageComponent,
    data: {
      seoTitle: 'Marca de móviles',
      seoDescription: 'Página de marca con los móviles y reviews publicados en clicTec.'
    }
  },
  {
    path: 'moviles/:slug',
    component: ReviewDetailPageComponent,
    data: {
      seoTitle: 'Review de móvil',
      seoDescription:
        'Análisis técnico de móviles con pros, contras, puntuación y contenido editorial transparente.'
    }
  },
  {
    path: 'comparativas',
    component: ComparativasPageComponent,
    data: {
      seoTitle: 'Comparador de móviles',
      seoDescription:
        'Comparador técnico de móviles por cámara, rendimiento, batería y relación calidad-precio.',
      seoCanonicalPath: '/comparativas'
    }
  },
  {
    path: 'reviews',
    component: ReviewsPageComponent,
    data: {
      seoTitle: 'Actualidad tecnológica',
      seoDescription:
        'Noticias tecnológicas y actualidad editorial publicadas desde el panel de administración.',
      seoCanonicalPath: '/reviews',
      fullBleedMain: true,
      immersiveNewsBackground: true
    }
  },
  {
    path: 'guias',
    component: GuiasPageComponent,
    data: {
      seoTitle: 'Guías de compra y uso',
      seoDescription:
        'Guías prácticas para elegir móvil, entender especificaciones y comprar con más criterio.',
      seoCanonicalPath: '/guias'
    }
  },
  {
    path: 'ranking',
    component: RankingPageComponent,
    data: {
      seoTitle: 'Ranking de móviles',
      seoDescription:
        'Ranking editorial de móviles destacados por gama, cámaras, valor y rendimiento.',
      seoCanonicalPath: '/ranking'
    }
  },
  {
    path: 'privacidad',
    component: LegalDocumentPageComponent,
    data: {
      documentKey: 'privacy',
      seoTitle: 'Política de privacidad',
      seoDescription:
        'Información sobre tratamiento de datos, bases jurídicas, conservación y ejercicio de derechos en clicTec.',
      seoCanonicalPath: '/privacidad'
    }
  },
  {
    path: 'cookies',
    component: LegalDocumentPageComponent,
    data: {
      documentKey: 'cookies',
      seoTitle: 'Política de cookies',
      seoDescription:
        'Detalle de categorías de cookies, bloqueo previo, registro del consentimiento y configuración por categorías.',
      seoCanonicalPath: '/cookies'
    }
  },
  {
    path: 'aviso-legal',
    component: LegalDocumentPageComponent,
    data: {
      documentKey: 'legal-notice',
      seoTitle: 'Aviso legal',
      seoDescription:
        'Titularidad del sitio, condiciones de uso, propiedad intelectual y legislación aplicable.',
      seoCanonicalPath: '/aviso-legal'
    }
  },
  {
    path: 'publicidad-afiliacion',
    component: LegalDocumentPageComponent,
    data: {
      documentKey: 'advertising',
      seoTitle: 'Publicidad y afiliación',
      seoDescription:
        'Política de transparencia comercial de clicTec para publicidad, patrocinios y enlaces de afiliación.',
      seoCanonicalPath: '/publicidad-afiliacion'
    }
  },
  {
    path: '**',
    component: NotFoundPageComponent,
    data: {
      seoTitle: 'Página no encontrada',
      seoDescription: 'La URL solicitada no existe o ya no está disponible en clicTec.',
      seoRobots: 'noindex,follow,noarchive'
    }
  }
];
