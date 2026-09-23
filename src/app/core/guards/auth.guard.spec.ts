import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function ejecutarGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    ) as boolean | UrlTree;
  }

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['estaAutenticado']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('permite el acceso cuando el usuario está autenticado', () => {
    authServiceSpy.estaAutenticado.and.returnValue(true);

    const resultado = ejecutarGuard();

    expect(resultado).toBeTrue();
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirige a /login cuando el usuario no está autenticado', () => {
    authServiceSpy.estaAutenticado.and.returnValue(false);
    const urlTreeFalso = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(urlTreeFalso);

    const resultado = ejecutarGuard();

    expect(resultado).toBe(urlTreeFalso);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
