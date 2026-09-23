import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/auth.model';

describe('roleGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function ejecutarGuard(roles?: RolUsuario[]): boolean | UrlTree {
    const route = { data: { roles } } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() =>
      roleGuard(route, {} as any),
    ) as boolean | UrlTree;
  }

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['tieneRol']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('permite el acceso cuando la ruta no declara roles', () => {
    const resultado = ejecutarGuard(undefined);

    expect(resultado).toBeTrue();
    expect(authServiceSpy.tieneRol).not.toHaveBeenCalled();
  });

  it('permite el acceso cuando el usuario tiene uno de los roles requeridos', () => {
    authServiceSpy.tieneRol.and.returnValue(true);

    const resultado = ejecutarGuard(['administrador']);

    expect(resultado).toBeTrue();
    expect(authServiceSpy.tieneRol).toHaveBeenCalledWith('administrador');
  });

  it('redirige a /no-autorizado cuando el usuario no tiene ninguno de los roles requeridos', () => {
    authServiceSpy.tieneRol.and.returnValue(false);
    const urlTreeFalso = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(urlTreeFalso);

    const resultado = ejecutarGuard(['administrador']);

    expect(resultado).toBe(urlTreeFalso);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/no-autorizado']);
  });

  it('pasa varios roles permitidos a tieneRol', () => {
    authServiceSpy.tieneRol.and.returnValue(true);

    ejecutarGuard(['agendador', 'administrador']);

    expect(authServiceSpy.tieneRol).toHaveBeenCalledWith('agendador', 'administrador');
  });
});
