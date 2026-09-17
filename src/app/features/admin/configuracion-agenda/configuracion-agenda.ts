import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { ConfiguracionAgendamientoService } from '../../../core/services/configuracion-agendamiento.service';
import { ProfesionalDTO } from '../../../core/models/usuario.model';
import { DisponibilidadSemanalDTO } from '../../../core/models/scheduling.model';
import { ApiError } from '../../../core/models/auth.model';

interface DiaSemanaOption {
  valor: number;
  etiqueta: string;
}

@Component({
  selector: 'app-configuracion-agenda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion-agenda.html',
  styleUrl: './configuracion-agenda.css',
})
export class ConfiguracionAgenda implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly disponibilidadService = inject(DisponibilidadService);
  private readonly configuracionService = inject(ConfiguracionAgendamientoService);

  readonly diasSemana: DiaSemanaOption[] = [
    { valor: 1, etiqueta: 'Lunes' },
    { valor: 2, etiqueta: 'Martes' },
    { valor: 3, etiqueta: 'Miércoles' },
    { valor: 4, etiqueta: 'Jueves' },
    { valor: 5, etiqueta: 'Viernes' },
    { valor: 6, etiqueta: 'Sábado' },
    { valor: 0, etiqueta: 'Domingo' },
  ];

  readonly profesionales = signal<ProfesionalDTO[]>([]);
  readonly disponibilidades = signal<DisponibilidadSemanalDTO[]>([]);

  readonly cargandoDisponibilidad = signal(false);
  readonly guardandoDisponibilidad = signal(false);
  readonly errorDisponibilidad = signal<string | null>(null);
  readonly exitoDisponibilidad = signal<string | null>(null);

  readonly configuracionActual = signal<number | null>(null);
  readonly fechaMaximaActual = signal<string | null>(null);
  readonly guardandoVentana = signal(false);
  readonly errorVentana = signal<string | null>(null);
  readonly exitoVentana = signal<string | null>(null);

  readonly formDisponibilidad = this.fb.group({
    profesionalId: [null as number | null, [Validators.required]],
    diaSemana: [null as number | null, [Validators.required]],
    horaInicio: ['08:00', [Validators.required]],
    horaFin: ['12:00', [Validators.required]],
    duracionCitaMinutos: [30, [Validators.required, Validators.min(5), Validators.max(240)]],
  });

  readonly formVentana = this.fb.group({
    semanasHabilitadas: [4, [Validators.required, Validators.min(1), Validators.max(52)]],
  });

  ngOnInit(): void {
    this.profesionalService.listar().subscribe({
      next: (data) => this.profesionales.set(data),
      error: () => this.errorDisponibilidad.set('No fue posible cargar la lista de médicos.'),
    });

    this.cargarConfiguracionVentana();

    this.formDisponibilidad.get('profesionalId')?.valueChanges.subscribe((id) => {
      if (id) this.cargarDisponibilidades(id);
    });
  }

  // ── HU-3.1: días/horarios/intervalo por profesional ─────────────────────

  private cargarDisponibilidades(profesionalId: number): void {
    this.cargandoDisponibilidad.set(true);
    this.disponibilidadService.listarPorProfesional(profesionalId).subscribe({
      next: (data) => {
        this.cargandoDisponibilidad.set(false);
        this.disponibilidades.set(data);
      },
      error: () => {
        this.cargandoDisponibilidad.set(false);
        this.errorDisponibilidad.set('No fue posible cargar la disponibilidad configurada.');
      },
    });
  }

  guardarDisponibilidad(): void {
    // SC-2/SC-3/SC-4: días de atención, hora de inicio/fin son obligatorios.
    if (this.formDisponibilidad.invalid) {
      this.formDisponibilidad.markAllAsTouched();
      return;
    }

    this.guardandoDisponibilidad.set(true);
    this.errorDisponibilidad.set(null);
    this.exitoDisponibilidad.set(null);

    const { profesionalId, diaSemana, horaInicio, horaFin, duracionCitaMinutos } =
      this.formDisponibilidad.getRawValue();

    const dto: DisponibilidadSemanalDTO = {
      profesionalId: profesionalId!,
      diaSemana: diaSemana!,
      horaInicio: horaInicio!,
      horaFin: horaFin!,
      duracionCitaMinutos: duracionCitaMinutos!,
    };

    this.disponibilidadService.crear(dto).subscribe({
      next: () => {
        this.guardandoDisponibilidad.set(false);
        this.exitoDisponibilidad.set('Configuración de agenda guardada correctamente.');
        this.cargarDisponibilidades(profesionalId!);
      },
      error: (err: HttpErrorResponse) => {
        this.guardandoDisponibilidad.set(false);
        const apiError = err.error as ApiError | undefined;
        this.errorDisponibilidad.set(
          apiError?.mensaje ?? 'No fue posible guardar la configuración de agenda.',
        );
      },
    });
  }

  eliminarDisponibilidad(id?: number): void {
    if (!id) return;
    const profesionalId = this.formDisponibilidad.get('profesionalId')?.value;
    this.disponibilidadService.eliminar(id).subscribe({
      next: () => {
        if (profesionalId) this.cargarDisponibilidades(profesionalId);
      },
      error: () => this.errorDisponibilidad.set('No fue posible eliminar el horario.'),
    });
  }

  etiquetaDia(diaSemana: number): string {
    return this.diasSemana.find((d) => d.valor === diaSemana)?.etiqueta ?? '—';
  }

  // ── HU-3.2: ventana de tiempo para agendamiento futuro ───────────────────

  private cargarConfiguracionVentana(): void {
    this.configuracionService.obtener().subscribe({
      next: (data) => {
        this.configuracionActual.set(data.semanasHabilitadas);
        this.formVentana.patchValue({ semanasHabilitadas: data.semanasHabilitadas });
      },
      error: () => {},
    });
    this.configuracionService.obtenerFechaMaxima().subscribe({
      next: (fecha) => this.fechaMaximaActual.set(fecha),
      error: () => {},
    });
  }

  guardarVentana(): void {
    // SC-2: valida que el valor sea numérico y válido (Validators.min/max ya lo cubren).
    if (this.formVentana.invalid) {
      this.formVentana.markAllAsTouched();
      return;
    }

    this.guardandoVentana.set(true);
    this.errorVentana.set(null);
    this.exitoVentana.set(null);

    const { semanasHabilitadas } = this.formVentana.getRawValue();

    this.configuracionService.actualizar({ semanasHabilitadas: semanasHabilitadas! }).subscribe({
      next: (data) => {
        this.guardandoVentana.set(false);
        this.exitoVentana.set('Ventana de agendamiento actualizada correctamente.');
        this.configuracionActual.set(data.semanasHabilitadas);
        this.configuracionService.obtenerFechaMaxima().subscribe({
          next: (fecha) => this.fechaMaximaActual.set(fecha),
          error: () => {},
        });
      },
      error: (err: HttpErrorResponse) => {
        this.guardandoVentana.set(false);
        const apiError = err.error as ApiError | undefined;
        this.errorVentana.set(
          apiError?.mensaje ?? 'No fue posible actualizar la ventana de agendamiento.',
        );
      },
    });
  }
}
