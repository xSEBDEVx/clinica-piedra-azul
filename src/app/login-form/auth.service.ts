import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, ApiError } from './auth.models';

// TODO: mover esto a environment.ts / environment.prod.ts
const API_URL = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credenciales: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, credenciales).pipe(
      tap((respuesta) => this.guardarSesion(respuesta)),
      catchError((error: HttpErrorResponse) => this.manejarErrorLogin(error)),
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombreCompleto');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  private guardarSesion(respuesta: AuthResponse): void {
    localStorage.setItem('accessToken', respuesta.accessToken);
    localStorage.setItem('refreshToken', respuesta.refreshToken);
    localStorage.setItem('usuarioId', String(respuesta.usuarioId));
    localStorage.setItem('rol', respuesta.rol);
    localStorage.setItem('nombreCompleto', respuesta.nombreCompleto);
  }

  private manejarErrorLogin(error: HttpErrorResponse): Observable<never> {
    let mensaje = 'No se pudo iniciar sesión. Verificá tu usuario y contraseña.';

    const apiError = error.error as ApiError | undefined;
    if (error.status !== 500 && apiError?.mensaje) {
      mensaje = apiError.mensaje;
    }
    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Intentá nuevamente.';
    }

    return throwError(() => new Error(mensaje));
  }
}
