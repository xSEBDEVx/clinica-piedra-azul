import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const ACCESS_TOKEN_KEY = 'pa_access_token';
const REFRESH_TOKEN_KEY = 'pa_refresh_token';
const SESSION_KEY = 'pa_session';

describe('AuthService', () => {
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/auth`;

  const authResponse: AuthResponse = {
    accessToken: 'access-123',
    refreshToken: 'refresh-456',
    tipo: 'Bearer',
    expiresIn: 900000,
    usuarioId: 7,
    login: 'paciente@correo.com',
    nombreCompleto: 'Paciente Uno',
    rol: 'paciente',
  };

  function configurarTestBed(): void {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
  });

  it('se crea sin sesión cuando localStorage está vacío', () => {
    configurarTestBed();
    const service = TestBed.inject(AuthService);

    expect(service.estaAutenticado()).toBeFalse();
    expect(service.sesion()).toBeNull();
    expect(service.rolActual()).toBeNull();
  });

  it('recupera la sesión guardada en localStorage al construirse', () => {
    // _sesion se inicializa leyendo localStorage en la declaración del
    // campo, así que hay que poblarlo ANTES de inyectar el servicio.
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        usuarioId: 7,
        login: 'paciente@correo.com',
        nombreCompleto: 'Paciente Uno',
        rol: 'paciente',
      }),
    );

    configurarTestBed();
    const service = TestBed.inject(AuthService);

    expect(service.estaAutenticado()).toBeTrue();
    expect(service.sesion()?.usuarioId).toBe(7);
    expect(service.rolActual()).toBe('paciente');
  });

  it('ignora una sesión guardada corrupta y arranca sin sesión', () => {
    localStorage.setItem(SESSION_KEY, '{json-invalido');

    configurarTestBed();
    const service = TestBed.inject(AuthService);

    expect(service.sesion()).toBeNull();
  });

  it('login: guarda tokens y sesión, y expone estaAutenticado() true', () => {
    configurarTestBed();
    const service = TestBed.inject(AuthService);

    service.login({ login: 'paciente@correo.com', password: 'secreta123' }).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(authResponse);

    expect(service.estaAutenticado()).toBeTrue();
    expect(service.getAccessToken()).toBe('access-123');
    expect(service.getRefreshToken()).toBe('refresh-456');
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('access-123');
    expect(JSON.parse(localStorage.getItem(SESSION_KEY)!).usuarioId).toBe(7);
  });

  it('refresh: envía el refreshToken guardado y actualiza la sesión', () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-viejo');
    configurarTestBed();
    const service = TestBed.inject(AuthService);

    service.refresh().subscribe();

    const req = httpMock.expectOne(`${baseUrl}/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-viejo' });
    req.flush(authResponse);

    expect(service.getAccessToken()).toBe('access-123');
  });

  it('logout: revoca el refresh token en el backend y limpia la sesión local', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'access-123');
    localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-456');
    localStorage.setItem(SESSION_KEY, JSON.stringify({ usuarioId: 7 }));
    configurarTestBed();
    const service = TestBed.inject(AuthService);

    service.logout();

    const req = httpMock.expectOne(`${baseUrl}/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-456' });
    req.flush(null);

    expect(service.estaAutenticado()).toBeFalse();
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('logout: limpia la sesión local incluso si la petición al backend falla', () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-456');
    configurarTestBed();
    const service = TestBed.inject(AuthService);

    service.logout();

    const req = httpMock.expectOne(`${baseUrl}/logout`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(service.estaAutenticado()).toBeFalse();
  });

  it('logout: no llama al backend si no hay refresh token guardado', () => {
    configurarTestBed();
    const service = TestBed.inject(AuthService);

    service.logout();

    httpMock.expectNone(`${baseUrl}/logout`);
    expect(service.estaAutenticado()).toBeFalse();
  });

  it('tieneRol: verdadero solo si el rol actual está en la lista dada', () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        usuarioId: 7,
        login: 'agendador@correo.com',
        nombreCompleto: 'Agendador Uno',
        rol: 'agendador',
      }),
    );
    configurarTestBed();
    const service = TestBed.inject(AuthService);

    expect(service.tieneRol('agendador', 'administrador')).toBeTrue();
    expect(service.tieneRol('paciente')).toBeFalse();
  });

  it('tieneRol: siempre falso sin sesión activa', () => {
    configurarTestBed();
    const service = TestBed.inject(AuthService);

    expect(service.tieneRol('paciente', 'administrador')).toBeFalse();
  });
});
