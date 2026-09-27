import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { CitaService } from '../../../core/services/cita.service';
import { ConfiguracionAgendamientoService } from '../../../core/services/configuracion-agendamiento.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProfesionalDTO } from '../../../core/models/usuario.model';
import { ApiError } from '../../../core/models/auth.model';
import { CitaDTO } from '../../../core/models/scheduling.model';

interface FranjaHoraria {
  valor: string; // ISO ZonedDateTime devuelto por el backend
  etiqueta: string; // hh:mm para mostrar
}

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendar-cita.html',
  styleUrl: './agendar-cita.css',
})
export class AgendarCita implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly citaService = inject(CitaService);
  private readonly configuracionService = inject(ConfiguracionAgendamientoService);
  private readonly authService = inject(AuthService);

  readonly profesionales = signal<ProfesionalDTO[]>([]);
  readonly franjas = signal<FranjaHoraria[]>([]);
  readonly franjaSeleccionada = signal<FranjaHoraria | null>(null);

  readonly fechaMinima = this.hoyISO();
  readonly fechaMaxima = signal<string | null>(null);

  readonly cargandoFranjas = signal(false);
  readonly cargandoConfirmacion = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly citaConfirmada = signal<CitaDTO | null>(null);

  readonly form = this.fb.group({
    profesionalId: [null as number | null, [Validators.required]],
    fecha: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.profesionalService.listar().subscribe({
      next: (data) => this.profesionales.set(data),
      error: () => this.errorMensaje.set('No fue posible cargar la lista de médicos.'),
    });

    // HU-3.2 SC-4: el paciente solo puede seleccionar fechas dentro de la ventana configurada.
    this.configuracionService.obtenerFechaMaxima().subscribe({
      next: (fecha) => this.fechaMaxima.set(fecha),
      error: () => {},
    });

    this.form.get('profesionalId')?.valueChanges.subscribe(() => this.actualizarFranjas());
    this.form.get('fecha')?.valueChanges.subscribe(() => this.actualizarFranjas());
  }

  get profesionalSeleccionado(): ProfesionalDTO | undefined {
    const id = this.form.get('profesionalId')?.value;
    return this.profesionales().find((p) => p.id === id);
  }

  private actualizarFranjas(): void {
    this.franjaSeleccionada.set(null);
    this.franjas.set([]);
    this.errorMensaje.set(null);

    const profesionalId = this.form.get('profesionalId')?.value;
    const fecha = this.form.get('fecha')?.value;
    if (!profesionalId || !fecha) return;

    this.cargandoFranjas.set(true);
    this.citaService.obtenerHorariosDisponibles(profesionalId, fecha).subscribe({
      next: (horarios) => {
        this.cargandoFranjas.set(false);
        const franjas = horarios.map((h) => ({
          valor: h,
          etiqueta: new Date(h).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Bogota',
          }),
        }));
        this.franjas.set(franjas);
      },
      error: () => {
        this.cargandoFranjas.set(false);
        this.errorMensaje.set('No fue posible cargar los horarios disponibles.');
      },
    });
  }

  seleccionarFranja(franja: FranjaHoraria): void {
    this.franjaSeleccionada.set(franja);
  }

  confirmarCita(): void {
    const franja = this.franjaSeleccionada();
    const profesional = this.profesionalSeleccionado;
    const sesion = this.authService.sesion();

    if (!franja || !profesional || !sesion) return;

    this.cargandoConfirmacion.set(true);
    this.errorMensaje.set(null);

    const dto: CitaDTO = {
      pacienteId: sesion.usuarioId,
      profesionalId: profesional.id!,
      fechaHora: franja.valor,
    };

    this.citaService.agendar(dto).subscribe({
      next: (cita) => {
        this.cargandoConfirmacion.set(false);
        this.citaConfirmada.set(cita);
      },
      error: (err: HttpErrorResponse) => {
        this.cargandoConfirmacion.set(false);
        const apiError = err.error as ApiError | undefined;
        this.errorMensaje.set(
          apiError?.mensaje ??
            'No fue posible confirmar la cita. Es posible que el horario ya no esté disponible.',
        );
        // El horario pudo haber sido tomado por otro paciente; refrescamos la lista.
        this.actualizarFranjas();
      },
    });
  }

  nuevaCita(): void {
    this.citaConfirmada.set(null);
    this.franjaSeleccionada.set(null);
    this.form.reset();
  }

  private hoyISO(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
