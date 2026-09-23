import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth.model';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const authResponse: AuthResponse = {
    accessToken: 'access-nuevo',
    refreshToken: 'refresh-nuevo',
    tipo: 'Bearer',
    expiresIn: 900000,
    usuarioId: 7,
    login: 'paciente@correo.com',
    nombreCompleto: 'Paciente Uno',
    rol: 'paciente',
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getAccessToken',
      'getRefreshToken',
      'refresh',
      'logout',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adjunta el access token a una petición hacia una ruta protegida', () => {
    authServiceSpy.getAccessToken.and.returnValue('access-123');

    httpClient.get('/api/scheduling/citas/paciente/5').subscribe();

    const req = httpMock.expectOne('/api/scheduling/citas/paciente/5');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-123');
    req.flush({});
  });

  it('no adjunta Authorization cuando no hay access token', () => {
    authServiceSpy.getAccessToken.and.returnValue(null);

    httpClient.get('/api/scheduling/citas/paciente/5').subscribe();

    const req = httpMock.expectOne('/api/scheduling/citas/paciente/5');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('no adjunta Authorization en rutas públicas aunque haya token guardado', () => {
    authServiceSpy.getAccessToken.and.returnValue('access-123');

    httpClient.post('/api/auth/login', { login: 'x', password: 'y' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('ante un 401 en ruta protegida, refresca el token y reintenta la petición original', () => {
    authServiceSpy.getAccessToken.and.returnValues('access-viejo', 'access-nuevo');
    authServiceSpy.getRefreshToken.and.returnValue('refresh-viejo');
    authServiceSpy.refresh.and.returnValue(
      new Observable<AuthResponse>((subscriber) => {
        subscriber.next(authResponse);
        subscriber.complete();
      }),
    );

    let resultado: unknown;
    httpClient.get('/api/scheduling/citas/paciente/5').subscribe((res) => (resultado = res));

    const primeraPeticion = httpMock.expectOne('/api/scheduling/citas/paciente/5');
    expect(primeraPeticion.request.headers.get('Authorization')).toBe('Bearer access-viejo');
    primeraPeticion.flush('no autorizado', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.refresh).toHaveBeenCalled();

    const reintento = httpMock.expectOne('/api/scheduling/citas/paciente/5');
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer access-nuevo');
    reintento.flush({ ok: true });

    expect(resultado).toEqual({ ok: true });
    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });

  it('si el refresh también falla, cierra la sesión y propaga el error', () => {
    authServiceSpy.getAccessToken.and.returnValue('access-viejo');
    authServiceSpy.getRefreshToken.and.returnValue('refresh-viejo');
    authServiceSpy.refresh.and.returnValue(
      new Observable<AuthResponse>((subscriber) => {
        subscriber.error({ status: 401 });
      }),
    );

    let errorRecibido: unknown;
    httpClient.get('/api/scheduling/citas/paciente/5').subscribe({
      next: () => fail('no debería completar con éxito'),
      error: (err) => (errorRecibido = err),
    });

    const primeraPeticion = httpMock.expectOne('/api/scheduling/citas/paciente/5');
    primeraPeticion.flush('no autorizado', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(errorRecibido).toBeTruthy();
  });

  it('un 401 sin refresh token guardado no intenta refrescar', () => {
    authServiceSpy.getAccessToken.and.returnValue('access-viejo');
    authServiceSpy.getRefreshToken.and.returnValue(null);

    httpClient.get('/api/scheduling/citas/paciente/5').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/api/scheduling/citas/paciente/5');
    req.flush('no autorizado', { status: 401, statusText: 'Unauthorized' });

    // httpMock.verify() en afterEach confirma además que no quedó ninguna
    // petición de reintento pendiente.
    expect(authServiceSpy.refresh).not.toHaveBeenCalled();
  });

  it('un 401 en una ruta pública no intenta refrescar', () => {
    authServiceSpy.getAccessToken.and.returnValue(null);

    httpClient.post('/api/auth/login', { login: 'x', password: 'y' }).subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush('credenciales inválidas', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.refresh).not.toHaveBeenCalled();
  });
});
