import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfiguracionAgendamientoDTO } from '../models/scheduling.model';

/** HU-3.2: ventana de tiempo (en semanas) para habilitar citas futuras. */
@Injectable({ providedIn: 'root' })
export class ConfiguracionAgendamientoService {
  private readonly baseUrl = `${environment.apiUrl}/scheduling/configuracion`;

  constructor(private http: HttpClient) {}

  obtener(): Observable<ConfiguracionAgendamientoDTO> {
    return this.http.get<ConfiguracionAgendamientoDTO>(this.baseUrl);
  }

  actualizar(dto: ConfiguracionAgendamientoDTO): Observable<ConfiguracionAgendamientoDTO> {
    return this.http.put<ConfiguracionAgendamientoDTO>(this.baseUrl, dto);
  }

  obtenerFechaMaxima(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/fecha-maxima`);
  }
}
