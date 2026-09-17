import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PacienteDTO,
  ProfesionalDTO,
  RegistroPacienteRequest,
  RegistroProfesionalRequest,
  UsuarioDTO,
} from '../models/usuario.model';
import { AuthService } from './auth.service';

/**
 * El backend separa la identidad (Usuario + perfil) de las credenciales de
 * acceso (login/AuthService): crear un usuario NO genera credenciales.
 * Este servicio encadena ambos pasos para que el frontend los trate como
 * una sola operación de "registro".
 */
@Injectable({ providedIn: 'root' })
export class RegistroService {
  private readonly baseUrl = `${environment.apiUrl}/users/registro`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  registrarPaciente(
    usuario: UsuarioDTO,
    paciente: PacienteDTO,
    password: string,
  ): Observable<UsuarioDTO> {
    const request: RegistroPacienteRequest = { usuario, paciente };
    return this.http.post<UsuarioDTO>(`${this.baseUrl}/paciente`, request).pipe(
      switchMap((usuarioCreado) =>
        this.authService
          .registrarCredencial({
            usuarioId: usuarioCreado.id!,
            login: usuario.login,
            password,
          })
          .pipe(switchMap(() => [usuarioCreado])),
      ),
    );
  }

  registrarProfesional(
    usuario: UsuarioDTO,
    profesional: ProfesionalDTO,
    password: string,
  ): Observable<UsuarioDTO> {
    const request: RegistroProfesionalRequest = { usuario, profesional };
    return this.http.post<UsuarioDTO>(`${this.baseUrl}/profesional`, request).pipe(
      switchMap((usuarioCreado) =>
        this.authService
          .registrarCredencial({
            usuarioId: usuarioCreado.id!,
            login: usuario.login,
            password,
          })
          .pipe(switchMap(() => [usuarioCreado])),
      ),
    );
  }

  registrarUsuario(usuario: UsuarioDTO, password: string): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.baseUrl}/usuario`, usuario).pipe(
      switchMap((usuarioCreado) =>
        this.authService
          .registrarCredencial({
            usuarioId: usuarioCreado.id!,
            login: usuario.login,
            password,
          })
          .pipe(switchMap(() => [usuarioCreado])),
      ),
    );
  }
}
