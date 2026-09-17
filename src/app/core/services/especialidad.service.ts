import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly baseUrl = `${environment.apiUrl}/users/especialidades`;

  constructor(private http: HttpClient) {}

  listar(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl);
  }
}
