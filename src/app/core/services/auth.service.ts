import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegistroCredencialRequest,
  RolUsuario,
} from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'pa_access_token';
const REFRESH_TOKEN_KEY = 'pa_refresh_token';
const SESSION_KEY = 'pa_session';

export interface SesionUsuario {
  usuarioId: number;
  login: string;
  nombreCompleto: string;
  rol: RolUsuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /** Señal reactiva con la sesión actual (null si no hay usuario autenticado). */
  private readonly _sesion = signal<SesionUsuario | null>(this.leerSesionGuardada());

  readonly sesion = this._sesion.asReadonly();
  readonly estaAutenticado = computed(() => this._sesion() !== null);
  readonly rolActual = computed(() => this._sesion()?.rol ?? null);

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((res) => this.guardarSesion(res)),
    );
  }

  /** Usado por el módulo de registro para crear credenciales tras crear el usuario/perfil. */
  registrarCredencial(request: RegistroCredencialRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/registro`, request);
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    const body: RefreshTokenRequest = { refreshToken: refreshToken ?? '' };
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, body)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http
        .post<void>(`${this.baseUrl}/logout`, { refreshToken } as RefreshTokenRequest)
        .subscribe({ next: () => {}, error: () => {} });
    }
    this.limpiarSesion();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  tieneRol(...roles: RolUsuario[]): boolean {
    const rol = this.rolActual();
    return rol !== null && roles.includes(rol);
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    const sesion: SesionUsuario = {
      usuarioId: res.usuarioId,
      login: res.login,
      nombreCompleto: res.nombreCompleto,
      rol: res.rol,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    this._sesion.set(sesion);
  }

  private limpiarSesion(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    this._sesion.set(null);
  }

  private leerSesionGuardada(): SesionUsuario | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SesionUsuario;
    } catch {
      return null;
    }
  }
}
