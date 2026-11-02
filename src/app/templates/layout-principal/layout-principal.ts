import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraSuperior } from '../../organisms/barra-superior/barra-superior';
import { Footer } from '../../organisms/footer/footer';

/** Template: estructura base de todas las páginas (barra superior, contenido y pie). */
@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [RouterOutlet, BarraSuperior, Footer],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.css',
})
export class LayoutPrincipal {}
