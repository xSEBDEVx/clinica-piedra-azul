import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const urlCitas = `${environment.apiUrl}/scheduling/citas/paciente/5`;
  const esperar = () => new Promise<void>((resolve) => setTimeout(resolve));

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'tokenVigente',
      'estaAutenticado',
      'logout',
    ]);
    authServiceSpy.logout.and.resolveTo(undefined);

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

  afterEach(() => httpMock.verify());

  it('adjunta el access token de Keycloak a una llamada a la API', async () => {
    authServiceSpy.tokenVigente.and.resolveTo('access-123');

    httpClient.get(urlCitas).subscribe();
    await esperar();

    const req = httpMock.expectOne(urlCitas);
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-123');
    req.flush({});
  });

  it('no adjunta Authorization cuando no hay sesión', async () => {
    authServiceSpy.tokenVigente.and.resolveTo(null);

    httpClient.get(urlCitas).subscribe();
    await esperar();

    const req = httpMock.expectOne(urlCitas);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('no adjunta token ni consulta a Keycloak en el autorregistro de pacientes', () => {
    httpClient.post(`${environment.apiUrl}/users/registro/paciente`, {}).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/registro/paciente`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(authServiceSpy.tokenVigente).not.toHaveBeenCalled();
    req.flush({});
  });

  it('no envía el token a URLs que no son de la API', () => {
    httpClient.get('https://otro-sitio.example.com/datos').subscribe();

    const req = httpMock.expectOne('https://otro-sitio.example.com/datos');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(authServiceSpy.tokenVigente).not.toHaveBeenCalled();
    req.flush({});
  });

  it('ante un 401 con sesión abierta, cierra la sesión en Keycloak y propaga el error', async () => {
    authServiceSpy.tokenVigente.and.resolveTo('access-123');
    authServiceSpy.estaAutenticado.and.returnValue(true);
    let estado: number | undefined;

    httpClient.get(urlCitas).subscribe({ error: (e) => (estado = e.status) });
    await esperar();
    httpMock.expectOne(urlCitas).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(estado).toBe(401);
    expect(authServiceSpy.logout).toHaveBeenCalledTimes(1);
  });

  it('un 403 (sin permisos) no cierra la sesión', async () => {
    authServiceSpy.tokenVigente.and.resolveTo('access-123');
    authServiceSpy.estaAutenticado.and.returnValue(true);

    httpClient.get(urlCitas).subscribe({ error: () => {} });
    await esperar();
    httpMock.expectOne(urlCitas).flush({}, { status: 403, statusText: 'Forbidden' });

    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });
});
