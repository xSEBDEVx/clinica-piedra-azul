import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { RolUsuario } from '../models/auth.model';
import { UsuarioDTO } from '../models/usuario.model';

/** Instancia de keycloak-js; se inyecta por token para poder sustituirla en las pruebas. */
export const KEYCLOAK = new InjectionToken<Keycloak>('KEYCLOAK', {
  providedIn: 'root',
  factory: () => new Keycloak(environment.keycloak),
});

export interface SesionUsuario {
  usuarioId: number;
  login: string;
  nombreCompleto: string;
  rol: RolUsuario;
}

/** Segundos de vigencia mínima con los que se pide el token antes de cada llamada. */
const VIGENCIA_MINIMA_SEGUNDOS = 30;

/**
 * Autenticación delegada en Keycloak (Authorization Code + PKCE).
 *
 * Keycloak se encarga de las contraseñas, la pantalla de login, las sesiones y la
 * renovación de tokens. Esta clase solo:
 *  - inicializa keycloak-js al arrancar la app (restaura la sesión si existe),
 *  - consulta a la API el perfil del usuario (id y rol, que viven en la base de datos
 *    de Piedrazul y no en el token) y lo expone como {@link sesion},
 *  - entrega un token vigente para el interceptor HTTP.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(KEYCLOAK);
  private readonly http = inject(HttpClient);

  private readonly _sesion = signal<SesionUsuario | null>(null);

  /** Sesión actual (null si no hay usuario autenticado). */
  readonly sesion = this._sesion.asReadonly();
  readonly estaAutenticado = computed(() => this._sesion() !== null);
  readonly rolActual = computed(() => this._sesion()?.rol ?? null);

  /**
   * Se ejecuta una vez al arrancar (APP_INITIALIZER). Si hay sesión de Keycloak,
   * carga el perfil del usuario antes de renderizar la app para que los guards
   * ya conozcan el rol.
   */
  async inicializar(): Promise<void> {
    try {
      const autenticado = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        checkLoginIframe: false,
      });
      if (autenticado) {
        await this.cargarPerfil();
      }
    } catch (error) {
      // Keycloak inaccesible: la app arranca como visitante en lugar de quedar en blanco.
      console.error('No fue posible inicializar la autenticación con Keycloak', error);
    }
  }

  /** Redirige a la pantalla de inicio de sesión de Keycloak. */
  login(): Promise<void> {
    return this.keycloak.login({ redirectUri: `${window.location.origin}/inicio` });
  }

  /** Cierra la sesión en Keycloak y vuelve a la página de inicio. */
  logout(): Promise<void> {
    this._sesion.set(null);
    return this.keycloak.logout({ redirectUri: window.location.origin });
  }

  /**
   * Devuelve un access token con vigencia suficiente (lo renueva con Keycloak si está
   * por vencer), o null si no hay sesión. Si la sesión de Keycloak ya expiró, envía al
   * usuario a iniciar sesión de nuevo.
   */
  async tokenVigente(): Promise<string | null> {
    if (!this.keycloak.authenticated) {
      return null;
    }
    try {
      await this.keycloak.updateToken(VIGENCIA_MINIMA_SEGUNDOS);
    } catch {
      this._sesion.set(null);
      await this.login();
      return null;
    }
    return this.keycloak.token ?? null;
  }

  tieneRol(...roles: RolUsuario[]): boolean {
    const rol = this.rolActual();
    return rol !== null && roles.includes(rol);
  }

  private async cargarPerfil(): Promise<void> {
    try {
      const perfil = await firstValueFrom(
        this.http.get<UsuarioDTO>(`${environment.apiUrl}/users/usuarios/me`),
      );
      this._sesion.set({
        usuarioId: perfil.id!,
        login: perfil.login,
        nombreCompleto: perfil.nombreCompleto,
        rol: perfil.rol,
      });
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        // Autenticó en Keycloak pero no tiene perfil activo en Piedrazul: se cierra la sesión.
        await this.logout();
        return;
      }
      console.error('No fue posible cargar el perfil del usuario', error);
    }
  }
}
