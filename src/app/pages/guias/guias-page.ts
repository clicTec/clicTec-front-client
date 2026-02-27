import { Component, OnInit, inject } from '@angular/core';
import { ContentApiService, GuideResponse } from '../../shared/services/content-api.service';

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

  ngOnInit(): void {
    this.contentApiService.getGuidePage().subscribe({
      next: (response) => {
        this.guide = response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el contenido de guias.';
        this.isLoading = false;
      }
    });
  }
}
