import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraSuperior } from '../../organisms/barra-superior/barra-superior';
import { Footer } from '../../organisms/footer/footer';
import { AuthService } from '../../core/services/auth.service';

/**
 * Template: estructura base de todas las páginas.
 * Sin sesión: barra superior + contenido + pie. Con sesión: barra lateral a la izquierda.
 */
@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [RouterOutlet, BarraSuperior, Footer],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.css',
})
export class LayoutPrincipal {
  readonly authService = inject(AuthService);
}
