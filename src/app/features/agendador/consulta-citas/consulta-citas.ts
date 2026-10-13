import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { CitaService } from '../../../core/services/cita.service';
import { AuthService } from '../../../core/services/auth.service';
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
  private readonly authService = inject(AuthService);

  readonly profesionales = signal<ProfesionalDTO[]>([]);
  readonly citas = signal<CitaDTO[]>([]);
  readonly totalCitas = signal<number | null>(null);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly consultaRealizada = signal(false);

  // HU-1.2: exportación. Se exportan los mismos criterios que se consultaron
  // (no los que estén escritos en el formulario en este momento).
  readonly exportando = signal(false);
  readonly archivoExportado = signal<{ blob: Blob; nombre: string } | null>(null);
  private criteriosConsulta: { profesionalId: number; fecha: string } | null = null;

  readonly form = this.fb.group({
    profesionalId: [null as number | null, [Validators.required]],
    fecha: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.profesionalService.listar().subscribe({
      next: (data) => {
        this.profesionales.set(data);
        this.fijarProfesionalSiEsProfesional();
      },
      error: () => this.errorMensaje.set('No fue posible cargar la lista de médicos o terapistas.'),
    });
  }

  /**
   * Un médico/terapista solo puede consultar/exportar su propia agenda
   * (el backend lo exige), así que se preselecciona y se bloquea el selector.
   */
  private fijarProfesionalSiEsProfesional(): void {
    const sesion = this.authService.sesion();
    if (sesion?.rol === 'profesional') {
      const control = this.form.get('profesionalId');
      control?.setValue(sesion.usuarioId);
      control?.disable();
    }
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
    this.archivoExportado.set(null);

    this.citaService.listarPorProfesionalYFecha(profesionalId!, fecha!).subscribe({
      next: (response) => {
        this.cargando.set(false);
        this.consultaRealizada.set(true);
        this.criteriosConsulta = { profesionalId: profesionalId!, fecha: fecha! };
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

  /** HU-1.2 (paso 4): genera el archivo CSV de las citas consultadas. */
  exportar(): void {
    if (!this.criteriosConsulta || this.exportando()) return;
    const { profesionalId, fecha } = this.criteriosConsulta;

    this.exportando.set(true);
    this.errorMensaje.set(null);

    this.citaService.exportarCsv(profesionalId, fecha).subscribe({
      next: (blob) => {
        this.exportando.set(false);
        this.archivoExportado.set({ blob, nombre: this.nombreArchivo(fecha) });
      },
      error: () => {
        this.exportando.set(false);
        this.errorMensaje.set('No fue posible exportar las citas. Intenta nuevamente.');
      },
    });
  }

  /** HU-1.2 (paso 5): descarga el archivo ya generado. */
  descargar(): void {
    const archivo = this.archivoExportado();
    if (!archivo) return;

    const url = URL.createObjectURL(archivo.blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = archivo.nombre;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  tamanoArchivo(): string {
    const bytes = this.archivoExportado()?.blob.size ?? 0;
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  }

  private nombreArchivo(fecha: string): string {
    const nombre = (this.profesionalSeleccionado?.nombreCompleto ?? 'profesional')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
    return `citas_${fecha}_${nombre}.csv`;
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
