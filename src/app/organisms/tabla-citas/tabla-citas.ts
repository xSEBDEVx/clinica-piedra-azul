import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CitaDTO } from '../../core/models/scheduling.model';
import { BadgeEstado } from '../../atoms/badge-estado/badge-estado';

export type ColumnaCita = 'fecha' | 'hora' | 'paciente' | 'profesional' | 'estado';

const ETIQUETAS: Record<ColumnaCita, string> = {
  fecha: 'Fecha',
  hora: 'Hora',
  paciente: 'Paciente',
  profesional: 'Médico/Terapista',
  estado: 'Estado',
};

/**
 * Organismo: tabla de citas con las columnas que indique la página.
 *
 *   <app-tabla-citas [citas]="citas()" [columnas]="['hora', 'paciente', 'estado']" />
 */
@Component({
  selector: 'app-tabla-citas',
  standalone: true,
  imports: [DatePipe, BadgeEstado],
  templateUrl: './tabla-citas.html',
  styleUrl: './tabla-citas.css',
})
export class TablaCitas {
  readonly citas = input.required<CitaDTO[]>();
  readonly columnas = input<ColumnaCita[]>(['fecha', 'hora', 'paciente', 'profesional', 'estado']);

  etiqueta(columna: ColumnaCita): string {
    return ETIQUETAS[columna];
  }
}
