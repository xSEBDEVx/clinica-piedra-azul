import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PacienteDTO,
  ProfesionalDTO,
  RegistroPacienteRequest,
  RegistroProfesionalRequest,
  UsuarioDTO,
} from '../models/usuario.model';

/**
 * El backend crea el perfil (Usuario + Paciente/Profesional) y, en la misma operación,
 * la cuenta de acceso en Keycloak con la contraseña recibida. Por eso el registro es
 * una sola llamada: ya no hay que registrar credenciales aparte.
 */
@Injectable({ providedIn: 'root' })
export class RegistroService {
  private readonly baseUrl = `${environment.apiUrl}/users/registro`;

  constructor(private http: HttpClient) {}

  /** Público: cualquier visitante puede registrarse como paciente. */
  registrarPaciente(
    usuario: UsuarioDTO,
    paciente: PacienteDTO,
    password: string,
  ): Observable<void> {
    const request: RegistroPacienteRequest = { usuario: { ...usuario, password }, paciente };
    return this.http.post<UsuarioDTO>(`${this.baseUrl}/paciente`, request).pipe(map(() => void 0));
  }

  /** Solo administradores. */
  registrarProfesional(
    usuario: UsuarioDTO,
    profesional: ProfesionalDTO,
    password: string,
  ): Observable<UsuarioDTO> {
    const request: RegistroProfesionalRequest = { usuario: { ...usuario, password }, profesional };
    return this.http.post<UsuarioDTO>(`${this.baseUrl}/profesional`, request);
  }

  /** Solo administradores (agendadores y otros administradores). */
  registrarUsuario(usuario: UsuarioDTO, password: string): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.baseUrl}/usuario`, { ...usuario, password });
  }
}
