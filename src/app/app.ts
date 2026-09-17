import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  get inicioSegunRol(): string {
    switch (this.authService.rolActual()) {
      case 'paciente':
        return '/agendar-cita';
      case 'agendador':
        return '/consulta-citas';
      case 'administrador':
        return '/admin/configuracion-agenda';
      default:
        return '/';
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
