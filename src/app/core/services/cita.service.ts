import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CitaDTO, EstadoCita } from '../models/scheduling.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly baseUrl = `${environment.apiUrl}/scheduling/citas`;

  constructor(private http: HttpClient) {}

  agendar(dto: CitaDTO): Observable<CitaDTO> {
    return this.http.post<CitaDTO>(this.baseUrl, dto);
  }

  buscarPorId(id: number): Observable<CitaDTO> {
    return this.http.get<CitaDTO>(`${this.baseUrl}/${id}`);
  }

  listarPorPaciente(pacienteId: number): Observable<CitaDTO[]> {
    return this.http.get<CitaDTO[]>(`${this.baseUrl}/paciente/${pacienteId}`);
  }

  listarPorProfesional(profesionalId: number): Observable<CitaDTO[]> {
    return this.http.get<CitaDTO[]>(`${this.baseUrl}/profesional/${profesionalId}`);
  }

  /**
   * HU-1.1: consulta de citas de un médico en una fecha específica.
   * El backend devuelve además el header X-Total-Count con el total de citas.
   */
  listarPorProfesionalYFecha(
    profesionalId: number,
    fecha: string,
  ): Observable<HttpResponse<CitaDTO[]>> {
    return this.http.get<CitaDTO[]>(`${this.baseUrl}/profesional/${profesionalId}/fecha`, {
      params: { fecha },
      observe: 'response',
    });
  }

  /**
   * HU-2.2 SC-2/SC-3: franjas horarias disponibles de un profesional en una fecha.
   */
  obtenerHorariosDisponibles(profesionalId: number, fecha: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}/profesional/${profesionalId}/disponibilidad`,
      { params: { fecha } },
    );
  }

  cancelar(id: number): Observable<CitaDTO> {
    return this.http.patch<CitaDTO>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  completar(id: number): Observable<CitaDTO> {
    return this.http.patch<CitaDTO>(`${this.baseUrl}/${id}/completar`, {});
  }

  actualizar(id: number, dto: CitaDTO): Observable<CitaDTO> {
    return this.http.put<CitaDTO>(`${this.baseUrl}/${id}`, dto);
  }

  contarPorEstado(estado: EstadoCita): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/contar`, { params: { estado } });
  }
}
