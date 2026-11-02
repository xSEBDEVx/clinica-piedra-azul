import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/** Organismo: barra superior con la marca y la navegación según el estado de sesión/rol. */
@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './barra-superior.html',
  styleUrl: './barra-superior.css',
})
export class BarraSuperior {
  constructor(public authService: AuthService) {}

  get inicioSegunRol(): string {
    switch (this.authService.rolActual()) {
      case 'paciente':
        return '/agendar-cita';
      case 'profesional':
      case 'agendador':
        return '/consulta-citas';
      case 'administrador':
        return '/admin/configuracion-agenda';
      default:
        return '/';
    }
  }

  cerrarSesion(): void {
    // Keycloak cierra la sesión y devuelve al usuario a la página de inicio.
    void this.authService.logout();
  }
}
