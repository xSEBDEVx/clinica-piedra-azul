import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Destino tras iniciar sesión en Keycloak: lleva a cada usuario a su pantalla
 * principal según el rol (el rol se conoce una vez cargado el perfil).
 */
export const inicioGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  switch (authService.rolActual()) {
    case 'paciente':
      return router.createUrlTree(['/agendar-cita']);
    case 'profesional':
    case 'agendador':
      return router.createUrlTree(['/consulta-citas']);
    case 'administrador':
      return router.createUrlTree(['/admin/configuracion-agenda']);
    default:
      return router.createUrlTree(['/']);
  }
};
