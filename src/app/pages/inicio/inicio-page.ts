import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService, HomeResponse } from '../../shared/services/content-api.service';

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

  ngOnInit(): void {
    this.contentApiService.getHomePage().subscribe({
      next: (response) => {
        this.home = response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la portada.';
        this.isLoading = false;
      }
    });
  }
}
