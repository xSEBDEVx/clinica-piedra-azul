import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { inicioGuard } from './inicio.guard';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/auth.model';

describe('inicioGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function ejecutar(rol: RolUsuario | null): UrlTree | boolean {
    authServiceSpy.rolActual.and.returnValue(rol);
    return TestBed.runInInjectionContext(() => inicioGuard({} as any, {} as any)) as UrlTree | boolean;
  }

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['rolActual']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.callFake((commands) => ({ commands }) as unknown as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  const casos: Array<[RolUsuario | null, string]> = [
    ['paciente', '/agendar-cita'],
    ['profesional', '/consulta-citas'],
    ['agendador', '/consulta-citas'],
    ['administrador', '/admin/configuracion-agenda'],
    [null, '/'],
  ];

  casos.forEach(([rol, destino]) => {
    it(`lleva al rol ${rol ?? 'sin sesión'} a ${destino}`, () => {
      ejecutar(rol);
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith([destino]);
    });
  });
});
