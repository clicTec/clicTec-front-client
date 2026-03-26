import { Routes } from '@angular/router';
import { ComparativasPageComponent } from './pages/comparativas/comparativas-page';
import { GuiasPageComponent } from './pages/guias/guias-page';
import { InicioPageComponent } from './pages/inicio/inicio-page';
import { LegalDocumentPageComponent } from './pages/legal-document/legal-document-page';
import { MovilesPageComponent } from './pages/moviles/moviles-page';
import { ReviewDetailPageComponent } from './pages/review-detail/review-detail-page';
import { RankingPageComponent } from './pages/ranking/ranking-page';
import { ReviewsPageComponent } from './pages/reviews/reviews-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inicio'
  },
  {
    path: 'inicio',
    component: InicioPageComponent
  },
  {
    path: 'moviles',
    component: MovilesPageComponent
  },
  {
    path: 'moviles/:slug',
    component: ReviewDetailPageComponent
  },
  {
    path: 'comparativas',
    component: ComparativasPageComponent
  },
  {
    path: 'reviews',
    component: ReviewsPageComponent
  },
  {
    path: 'guias',
    component: GuiasPageComponent
  },
  {
    path: 'ranking',
    component: RankingPageComponent
  },
  {
    path: 'privacidad',
    component: LegalDocumentPageComponent,
    data: {
      documentKey: 'privacy'
    }
  },
  {
    path: 'cookies',
    component: LegalDocumentPageComponent,
    data: {
      documentKey: 'cookies'
    }
  },
  {
    path: 'aviso-legal',
    component: LegalDocumentPageComponent,
    data: {
      documentKey: 'legal-notice'
    }
  },
  {
    path: 'publicidad-afiliacion',
    component: LegalDocumentPageComponent,
    data: {
      documentKey: 'advertising'
    }
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
