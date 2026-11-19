import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Icono = 'home' | 'calendario' | 'usuarios' | 'grafico' | 'ajustes';

interface ItemMenu {
  etiqueta: string;
  ruta: string;
  icono: Icono;
  visible: boolean;
}

/**
 * Organismo de navegación.
 *  - Sin sesión: barra superior con logo y menú desplegable (hamburguesa).
 *  - Con sesión: barra lateral con usuario, buscador de opciones y menú por rol.
 */
@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './barra-superior.html',
  styleUrl: './barra-superior.css',
})
export class BarraSuperior {
  readonly authService = inject(AuthService);

  readonly menuAbierto = signal(false);
  readonly filtro = signal('');

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

  /** Opciones del menú lateral según el rol (mismas rutas que antes). */
  readonly items = computed<ItemMenu[]>(() => {
    const a = this.authService;
    const todos: ItemMenu[] = [
      { etiqueta: 'Menú', ruta: this.inicioSegunRol, icono: 'home', visible: true },
      { etiqueta: 'Agendar cita', ruta: '/agendar-cita', icono: 'calendario', visible: a.tieneRol('paciente') },
      { etiqueta: 'Mis citas', ruta: '/mis-citas', icono: 'calendario', visible: a.tieneRol('paciente') },
      { etiqueta: 'Consultar citas', ruta: '/consulta-citas', icono: 'calendario', visible: a.tieneRol('profesional', 'agendador', 'administrador') },
      { etiqueta: 'Historial de paciente', ruta: '/historial-citas', icono: 'usuarios', visible: a.tieneRol('profesional', 'agendador', 'administrador') },
      { etiqueta: 'Reportes', ruta: '/reportes', icono: 'grafico', visible: a.tieneRol('profesional', 'administrador') },
      { etiqueta: 'Configurar agenda', ruta: '/admin/configuracion-agenda', icono: 'ajustes', visible: a.tieneRol('administrador') },
    ];
    const texto = this.filtro().trim().toLowerCase();
    return todos.filter((i) => i.visible && (!texto || i.etiqueta.toLowerCase().includes(texto)));
  });

  alternarMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  cerrarSesion(): void {
    // Keycloak cierra la sesión y devuelve al usuario a la página de inicio.
    void this.authService.logout();
  }
}
