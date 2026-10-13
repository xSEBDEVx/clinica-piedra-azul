import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CitaService } from '../../../core/services/cita.service';
import { HistorialCitasPacienteDTO } from '../../../core/models/scheduling.model';

/**
 * HU-4.1: consulta del historial de citas de un paciente a partir de su cédula.
 * Pasos: ingresar cédula -> buscar paciente -> consultar citas -> visualizar historial.
 */
@Component({
  selector: 'app-historial-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './historial-citas.html',
  styleUrl: './historial-citas.css',
})
export class HistorialCitas {
  private readonly fb = inject(FormBuilder);
  private readonly citaService = inject(CitaService);

  readonly historial = signal<HistorialCitasPacienteDTO | null>(null);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly consultaRealizada = signal(false);

  readonly form = this.fb.group({
    cedula: [
      '',
      [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9A-Za-z.\-]+$/)],
    ],
  });

  buscar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const cedula = (this.form.getRawValue().cedula ?? '').trim();
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.historial.set(null);
    this.consultaRealizada.set(false);

    this.citaService.consultarHistorialPorCedula(cedula).subscribe({
      next: (data) => {
        this.cargando.set(false);
        this.historial.set(data);
        this.consultaRealizada.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        if (err.status === 404) {
          this.errorMensaje.set('No se encontró un paciente con la cédula ingresada.');
        } else if (err.status === 403) {
          this.errorMensaje.set('No tienes permisos para consultar el historial de citas.');
        } else if (err.status === 400) {
          this.errorMensaje.set(err.error?.mensaje ?? 'La cédula ingresada no es válida.');
        } else {
          this.errorMensaje.set('No fue posible consultar el historial. Intenta nuevamente.');
        }
      },
    });
  }

  claseEstado(estado?: string): string {
    switch (estado) {
      case 'programada':
        return 'badge badge-programada';
      case 'cancelada':
        return 'badge badge-cancelada';
      case 'completada':
        return 'badge badge-completada';
      default:
        return 'badge';
    }
  }

  etiquetaEstado(estado?: string): string {
    switch (estado) {
      case 'programada':
        return 'Programada';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      default:
        return estado ?? '—';
    }
  }
}
