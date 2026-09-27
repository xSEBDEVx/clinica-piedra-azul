import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Registro } from './registro';
import { RegistroService } from '../../../core/services/registro.service';
import { ApiError } from '../../../core/models/auth.model';

describe('Registro', () => {
  let registroServiceSpy: jasmine.SpyObj<RegistroService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function crearComponente(): Registro {
    TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        { provide: RegistroService, useValue: registroServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
    const fixture = TestBed.createComponent(Registro);
    return fixture.componentInstance;
  }

  function llenarFormularioValido(componente: Registro): void {
    componente.form.setValue({
      nombreCompleto: 'Paciente de Prueba',
      cedulaIdentidad: '1234567890',
      email: 'paciente@correo.com',
      telefono: '3001234567',
      login: 'paciente123',
      password: 'secreta123',
    });
  }

  beforeEach(() => {
    registroServiceSpy = jasmine.createSpyObj('RegistroService', ['registrarPaciente']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  });

  it('no llama al servicio y marca los campos como touched si el formulario es inválido', () => {
    const componente = crearComponente();

    componente.submit();

    expect(registroServiceSpy.registrarPaciente).not.toHaveBeenCalled();
    expect(componente.form.get('email')?.touched).toBeTrue();
  });

  it('en caso de éxito, marca registroExitoso y programa la navegación a /login', () => {
    jasmine.clock().install();
    try {
      registroServiceSpy.registrarPaciente.and.returnValue(of(undefined));
      const componente = crearComponente();
      llenarFormularioValido(componente);

      componente.submit();

      expect(componente.cargando()).toBeFalse();
      expect(componente.registroExitoso()).toBeTrue();
      expect(componente.errorMensaje()).toBeNull();
      expect(routerSpy.navigate).not.toHaveBeenCalled();

      jasmine.clock().tick(2001);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('envía al servicio los datos de usuario y paciente correctamente mapeados', () => {
    registroServiceSpy.registrarPaciente.and.returnValue(of(undefined));
    const componente = crearComponente();
    llenarFormularioValido(componente);

    componente.submit();

    expect(registroServiceSpy.registrarPaciente).toHaveBeenCalledWith(
      { nombreCompleto: 'Paciente de Prueba', login: 'paciente123', rol: 'paciente' },
      {
        nombreCompleto: 'Paciente de Prueba',
        cedulaIdentidad: '1234567890',
        telefono: '3001234567',
        email: 'paciente@correo.com',
      },
      'secreta123',
    );
  });

  it('con error 409, muestra el mensaje de nombre de usuario ya registrado (fix backend #5)', () => {
    // Antes del fix #5, LoginDuplicadoException/CredencialDuplicadaException
    // devolvían 500 en vez de 409, así que este mensaje nunca se mostraba.
    const error = new HttpErrorResponse({ status: 409, statusText: 'Conflict' });
    registroServiceSpy.registrarPaciente.and.returnValue(throwError(() => error));
    const componente = crearComponente();
    llenarFormularioValido(componente);

    componente.submit();

    expect(componente.cargando()).toBeFalse();
    expect(componente.registroExitoso()).toBeFalse();
    expect(componente.errorMensaje()).toBe('Este nombre de usuario ya está en uso. Elige otro o inicia sesión.');
  });

  it('con otro error, muestra el mensaje del backend si viene presente', () => {
    const apiError: ApiError = {
      status: 400,
      error: 'Bad Request',
      mensaje: 'La cédula ya está registrada',
      timestamp: new Date().toISOString(),
    };
    const error = new HttpErrorResponse({ status: 400, error: apiError });
    registroServiceSpy.registrarPaciente.and.returnValue(throwError(() => error));
    const componente = crearComponente();
    llenarFormularioValido(componente);

    componente.submit();

    expect(componente.errorMensaje()).toBe('La cédula ya está registrada');
  });

  it('con un error sin body reconocible, muestra el mensaje genérico', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    registroServiceSpy.registrarPaciente.and.returnValue(throwError(() => error));
    const componente = crearComponente();
    llenarFormularioValido(componente);

    componente.submit();

    expect(componente.errorMensaje()).toBe('No fue posible completar el registro. Intenta nuevamente.');
  });
});
