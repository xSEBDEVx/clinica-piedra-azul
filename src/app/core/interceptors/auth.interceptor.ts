import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const RUTAS_PUBLICAS = ['/auth/login', '/auth/refresh', '/auth/registro', '/users/registro'];

function esRutaPublica(url: string): boolean {
  return RUTAS_PUBLICAS.some((ruta) => url.includes(ruta));
}

/**
 * Adjunta el access token a cada petición saliente hacia la API y, si el
 * backend responde 401 (token expirado), intenta renovarlo una vez con el
 * refresh token antes de reintentar la petición original.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const esPublica = esRutaPublica(req.url);
  const reqConToken =
    token && !esPublica
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !esPublica && authService.getRefreshToken()) {
        return authService.refresh().pipe(
          switchMap(() => {
            const nuevoToken = authService.getAccessToken();
            const reintento = req.clone({
              setHeaders: { Authorization: `Bearer ${nuevoToken}` },
            });
            return next(reintento);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
