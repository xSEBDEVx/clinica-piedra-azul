import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DisponibilidadSemanalDTO } from '../models/scheduling.model';

@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly baseUrl = `${environment.apiUrl}/scheduling/disponibilidad`;

  constructor(private http: HttpClient) {}

  crear(dto: DisponibilidadSemanalDTO): Observable<DisponibilidadSemanalDTO> {
    return this.http.post<DisponibilidadSemanalDTO>(this.baseUrl, dto);
  }

  actualizar(id: number, dto: DisponibilidadSemanalDTO): Observable<DisponibilidadSemanalDTO> {
    return this.http.put<DisponibilidadSemanalDTO>(`${this.baseUrl}/${id}`, dto);
  }

  listarPorProfesional(profesionalId: number): Observable<DisponibilidadSemanalDTO[]> {
    return this.http.get<DisponibilidadSemanalDTO[]>(
      `${this.baseUrl}/profesional/${profesionalId}`,
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
