import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CitaService } from '../../../core/services/cita.service';
import { AuthService } from '../../../core/services/auth.service';
import { CitaDTO } from '../../../core/models/scheduling.model';
import { ApiError } from '../../../core/models/auth.model';
import { Alerta } from '../../../atoms/alerta/alerta';
import { Boton } from '../../../atoms/boton/boton';
import { BadgeEstado } from '../../../atoms/badge-estado/badge-estado';
import { CampoFormulario } from '../../../molecules/campo-formulario/campo-formulario';

/** Anticipación mínima (en días) exigida para cancelar; el backend la valida también. */
const DIAS_MINIMOS_CANCELACION = 2;

/**
 * HU-2.3: el paciente consulta sus citas y cancela una cita futura y activa
 * indicando la justificación (mínimo 2 días de anticipación).
 */
@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Alerta, Boton, BadgeEstado, CampoFormulario],
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.css',
})
export class MisCitas implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly citaService = inject(CitaService);
  private readonly authService = inject(AuthService);

  readonly citas = signal<CitaDTO[]>([]);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly exitoMensaje = signal<string | null>(null);

  /** Cita seleccionada para cancelar (SC-2): se muestran sus datos y el campo de justificación. */
  readonly citaACancelar = signal<CitaDTO | null>(null);
  readonly cancelando = signal(false);
  readonly errorCancelacion = signal<string | null>(null);

  readonly form = this.fb.group({
    motivo: ['', [Validators.required, Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.cargarCitas();
  }

  private cargarCitas(): void {
    const sesion = this.authService.sesion();
    if (!sesion) return;

    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.citaService.listarPorPaciente(sesion.usuarioId).subscribe({
      next: (data) => {
        this.cargando.set(false);
        this.citas.set(
          [...data].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()),
        );
      },
      error: () => {
        this.cargando.set(false);
        this.errorMensaje.set('No fue posible cargar tus citas. Intenta nuevamente.');
      },
    });
  }

  /** SC-1: cita futura y activa. */
  esActiva(cita: CitaDTO): boolean {
    return cita.estado === 'programada' && new Date(cita.fechaHora).getTime() > Date.now();
  }

  /** SC-3: cumple la anticipación mínima para poder cancelarse. */
  puedeCancelar(cita: CitaDTO): boolean {
    const limite = new Date(cita.fechaHora).getTime() - DIAS_MINIMOS_CANCELACION * 24 * 3600 * 1000;
    return this.esActiva(cita) && Date.now() <= limite;
  }

  seleccionarParaCancelar(cita: CitaDTO): void {
    this.exitoMensaje.set(null);
    this.errorCancelacion.set(null);
    this.form.reset({ motivo: '' });
    this.citaACancelar.set(cita);
  }

  descartarCancelacion(): void {
    this.citaACancelar.set(null);
    this.errorCancelacion.set(null);
  }

  confirmarCancelacion(): void {
    const cita = this.citaACancelar();
    if (!cita?.id) return;

    const motivo = (this.form.getRawValue().motivo ?? '').trim();
    if (!motivo) {
      // SC-4: no se permite confirmar sin justificación.
      this.form.get('motivo')?.markAsTouched();
      this.form.get('motivo')?.setValue('');
      return;
    }

    this.cancelando.set(true);
    this.errorCancelacion.set(null);
    this.citaService.cancelarComoPaciente(cita.id, motivo).subscribe({
      next: (actualizada) => {
        this.cancelando.set(false);
        this.citaACancelar.set(null);
        // SC-6: el nuevo estado se refleja en el listado.
        this.citas.update((lista) => lista.map((c) => (c.id === actualizada.id ? actualizada : c)));
        // SC-7: confirmación de cancelación exitosa (el horario queda libre).
        this.exitoMensaje.set('La cita fue cancelada correctamente y el horario quedó disponible.');
      },
      error: (err: HttpErrorResponse) => {
        this.cancelando.set(false);
        const apiError = err.error as ApiError | undefined;
        this.errorCancelacion.set(
          apiError?.mensaje ?? 'No fue posible cancelar la cita. Intenta nuevamente.',
        );
        if (err.status === 422) this.cargarCitas();
      },
    });
  }
}
