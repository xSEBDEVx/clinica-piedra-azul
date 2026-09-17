import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/auth.model';

/**
 * Restringe el acceso a una ruta según el rol del usuario autenticado.
 * Uso en app.routes.ts:
 *   { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['administrador'] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = (route.data['roles'] as RolUsuario[] | undefined) ?? [];

  if (rolesPermitidos.length === 0 || authService.tieneRol(...rolesPermitidos)) {
    return true;
  }

  return router.createUrlTree(['/no-autorizado']);
};
