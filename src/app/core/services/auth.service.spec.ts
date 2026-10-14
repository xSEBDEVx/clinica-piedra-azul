import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, KEYCLOAK } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService (Keycloak)', () => {
  let keycloakFake: {
    authenticated: boolean;
    token?: string;
    init: jasmine.Spy;
    login: jasmine.Spy;
    logout: jasmine.Spy;
    updateToken: jasmine.Spy;
  };
  let httpMock: HttpTestingController;
  let service: AuthService;

  const urlPerfil = `${environment.apiUrl}/users/usuarios/me`;
  const esperar = () => new Promise<void>((resolve) => setTimeout(resolve));

  beforeEach(() => {
    keycloakFake = {
      authenticated: false,
      token: undefined,
      init: jasmine.createSpy('init').and.resolveTo(false),
      login: jasmine.createSpy('login').and.resolveTo(undefined),
      logout: jasmine.createSpy('logout').and.resolveTo(undefined),
      updateToken: jasmine.createSpy('updateToken').and.resolveTo(true),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: KEYCLOAK, useValue: keycloakFake },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('inicializar', () => {
    it('inicializa keycloak-js con PKCE y deja la sesión vacía si no hay usuario', async () => {
      await service.inicializar();

      expect(keycloakFake.init).toHaveBeenCalledWith(
        jasmine.objectContaining({ onLoad: 'check-sso', pkceMethod: 'S256' }),
      );
      expect(service.estaAutenticado()).toBeFalse();
      expect(service.sesion()).toBeNull();
    });

    it('con sesión de Keycloak, carga el perfil (id y rol) desde la API', async () => {
      keycloakFake.init.and.resolveTo(true);

      const promesa = service.inicializar();
      await esperar();
      httpMock.expectOne(urlPerfil).flush({
        id: 7,
        login: 'ana',
        nombreCompleto: 'Ana Pérez',
        rol: 'agendador',
        activo: true,
      });
      await promesa;

      expect(service.estaAutenticado()).toBeTrue();
      expect(service.sesion()).toEqual({
        usuarioId: 7,
        login: 'ana',
        nombreCompleto: 'Ana Pérez',
        rol: 'agendador',
      });
      expect(service.rolActual()).toBe('agendador');
      expect(service.tieneRol('agendador', 'administrador')).toBeTrue();
      expect(service.tieneRol('paciente')).toBeFalse();
    });

    it('si la API responde 401 (sin perfil activo en Piedrazul), cierra la sesión de Keycloak', async () => {
      keycloakFake.init.and.resolveTo(true);

      const promesa = service.inicializar();
      await esperar();
      httpMock.expectOne(urlPerfil).flush({}, { status: 401, statusText: 'Unauthorized' });
      await promesa;

      expect(keycloakFake.logout).toHaveBeenCalledWith({ redirectUri: window.location.origin });
      expect(service.estaAutenticado()).toBeFalse();
    });

    it('si Keycloak no responde, no lanza error y la app arranca como visitante', async () => {
      spyOn(console, 'error');
      keycloakFake.init.and.rejectWith(new Error('sin conexión'));

      await expectAsync(service.inicializar()).toBeResolved();

      expect(service.estaAutenticado()).toBeFalse();
    });
  });

  describe('tokenVigente', () => {
    it('devuelve null y no renueva nada si no hay sesión', async () => {
      expect(await service.tokenVigente()).toBeNull();
      expect(keycloakFake.updateToken).not.toHaveBeenCalled();
    });

    it('renueva el token si está por vencer y lo devuelve', async () => {
      keycloakFake.authenticated = true;
      keycloakFake.token = 'access-123';

      expect(await service.tokenVigente()).toBe('access-123');
      expect(keycloakFake.updateToken).toHaveBeenCalledWith(30);
    });

    it('si no puede renovar (sesión expirada), envía al usuario a iniciar sesión', async () => {
      keycloakFake.authenticated = true;
      keycloakFake.updateToken.and.rejectWith(new Error('expirada'));

      expect(await service.tokenVigente()).toBeNull();
      expect(keycloakFake.login).toHaveBeenCalled();
    });
  });

  it('login redirige a Keycloak y vuelve a /inicio', async () => {
    await service.login();

    expect(keycloakFake.login).toHaveBeenCalledWith({
      redirectUri: `${window.location.origin}/inicio`,
    });
  });

  it('logout limpia la sesión y cierra la sesión en Keycloak', async () => {
    keycloakFake.init.and.resolveTo(true);
    const promesa = service.inicializar();
    await esperar();
    httpMock.expectOne(urlPerfil).flush({ id: 1, login: 'x', nombreCompleto: 'X', rol: 'paciente' });
    await promesa;
    expect(service.estaAutenticado()).toBeTrue();

    await service.logout();

    expect(service.estaAutenticado()).toBeFalse();
    expect(keycloakFake.logout).toHaveBeenCalledWith({ redirectUri: window.location.origin });
  });
});
