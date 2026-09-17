import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfesionalDTO } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class ProfesionalService {
  private readonly baseUrl = `${environment.apiUrl}/users/profesionales`;

  constructor(private http: HttpClient) {}

  listar(especialidad?: string): Observable<ProfesionalDTO[]> {
    const options = especialidad ? { params: { especialidad } } : {};
    return this.http.get<ProfesionalDTO[]>(this.baseUrl, options);
  }

  buscarPorId(id: number): Observable<ProfesionalDTO> {
    return this.http.get<ProfesionalDTO>(`${this.baseUrl}/${id}`);
  }
}
