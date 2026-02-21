import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-page.html',
  styleUrls: ['./inicio-page.scss']
})
export class InicioPageComponent {}
