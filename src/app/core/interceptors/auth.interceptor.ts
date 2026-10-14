import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Único endpoint de la API que se llama sin sesión: el autorregistro de pacientes. */
function esLlamadaPublica(method: string, url: string): boolean {
  return method === 'POST' && url.includes('/users/registro/paciente');
}

/**
 * Adjunta a cada llamada a la API el access token de Keycloak (renovándolo antes si está
 * por vencer). Si la API responde 401 con una sesión abierta, el usuario ya no es válido
 * (p. ej. fue desactivado), así que se cierra la sesión en Keycloak.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl) || esLlamadaPublica(req.method, req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);

  return from(authService.tokenVigente()).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
    ),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.estaAutenticado()) {
        void authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
