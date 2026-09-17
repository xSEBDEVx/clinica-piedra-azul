import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioDTO } from '../models/usuario.model';
import { RolUsuario } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}/users/usuarios`;

  constructor(private http: HttpClient) {}

  listar(rol?: RolUsuario): Observable<UsuarioDTO[]> {
    const options = rol ? { params: { rol } } : {};
    return this.http.get<UsuarioDTO[]>(this.baseUrl, options);
  }

  buscarPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.baseUrl}/${id}`);
  }

  obtenerPacienteId(usuarioId: number): Observable<{ pacienteId: number }> {
    return this.http.get<{ pacienteId: number }>(`${this.baseUrl}/${usuarioId}/paciente-id`);
  }

  actualizar(id: number, dto: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.baseUrl}/${id}`, dto);
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/activar`, {});
  }
}
