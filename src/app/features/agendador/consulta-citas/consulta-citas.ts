import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { CitaService } from '../../../core/services/cita.service';
import { ProfesionalDTO } from '../../../core/models/usuario.model';
import { CitaDTO } from '../../../core/models/scheduling.model';

@Component({
  selector: 'app-consulta-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta-citas.html',
  styleUrl: './consulta-citas.css',
})
export class ConsultaCitas implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly citaService = inject(CitaService);

  readonly profesionales = signal<ProfesionalDTO[]>([]);
  readonly citas = signal<CitaDTO[]>([]);
  readonly totalCitas = signal<number | null>(null);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly consultaRealizada = signal(false);

  readonly form = this.fb.group({
    profesionalId: [null as number | null, [Validators.required]],
    fecha: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.profesionalService.listar().subscribe({
      next: (data) => this.profesionales.set(data),
      error: () => this.errorMensaje.set('No fue posible cargar la lista de médicos.'),
    });
  }

  get profesionalSeleccionado(): ProfesionalDTO | undefined {
    const id = this.form.get('profesionalId')?.value;
    return this.profesionales().find((p) => p.id === id);
  }

  consultar(): void {
    // SC-1/SC-2: el médico y la fecha actúan como filtros obligatorios.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { profesionalId, fecha } = this.form.getRawValue();
    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.citaService.listarPorProfesionalYFecha(profesionalId!, fecha!).subscribe({
      next: (response) => {
        this.cargando.set(false);
        this.consultaRealizada.set(true);
        this.citas.set(response.body ?? []);
        const totalHeader = response.headers.get('X-Total-Count');
        this.totalCitas.set(totalHeader ? Number(totalHeader) : (response.body?.length ?? 0));
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorMensaje.set('No fue posible consultar las citas. Intenta nuevamente.');
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
