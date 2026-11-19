import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CitaService } from '../../../core/services/cita.service';
import { ReporteCitasMensualDTO } from '../../../core/models/scheduling.model';
import { ApiError } from '../../../core/models/auth.model';
import { Alerta } from '../../../atoms/alerta/alerta';
import { CampoFormulario } from '../../../molecules/campo-formulario/campo-formulario';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const COLORES = ['#005092', '#E07A00', '#2E8B57', '#B3261E', '#7B4FB5', '#0081C6', '#8A6D00', '#C2185B'];

// Geometría del gráfico (viewBox fija; el SVG escala al ancho disponible).
const ANCHO = 760;
const ALTO = 360;
const MARGEN = { arriba: 20, derecha: 20, abajo: 40, izquierda: 48 };

interface SerieGrafico {
  nombre: string;
  color: string;
  total: number;
  puntos: { x: number; y: number; valor: number; mes: string }[];
  linea: string;
}

/**
 * HU-5.1: reporte gráfico de la cantidad de citas por mes y por médico para un año.
 * Eje X: meses; eje Y: cantidad de citas; una serie (con leyenda) por médico.
 */
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Alerta, CampoFormulario],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly citaService = inject(CitaService);

  readonly meses = MESES;
  readonly ancho = ANCHO;
  readonly alto = ALTO;
  readonly margen = MARGEN;

  readonly anioActual = new Date().getFullYear();
  readonly anios = Array.from({ length: 11 }, (_, i) => this.anioActual - 8 + i).reverse();

  readonly form = this.fb.group({
    anio: [this.anioActual, [Validators.required, Validators.min(2000), Validators.max(2100)]],
  });

  readonly reporte = signal<ReporteCitasMensualDTO | null>(null);
  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  /** Escala vertical: máximo redondeado hacia arriba para que las marcas queden en enteros. */
  readonly maximoY = computed(() => {
    const max = Math.max(0, ...(this.reporte()?.series ?? []).flatMap((s) => s.citasPorMes));
    return Math.max(4, Math.ceil(max / 4) * 4);
  });

  readonly marcasY = computed(() => {
    const max = this.maximoY();
    return [0, 1, 2, 3, 4].map((i) => ({ valor: (max / 4) * i, y: this.yDe((max / 4) * i) }));
  });

  readonly marcasX = MESES.map((mes, i) => ({ mes, x: this.xDe(i) }));

  readonly series = computed<SerieGrafico[]>(() =>
    (this.reporte()?.series ?? []).map((s, i) => {
      const puntos = s.citasPorMes.map((valor, mes) => ({
        x: this.xDe(mes),
        y: this.yDe(valor),
        valor,
        mes: MESES[mes],
      }));
      return {
        nombre: s.profesionalNombre,
        color: COLORES[i % COLORES.length],
        total: s.total,
        puntos,
        linea: puntos.map((p) => `${p.x},${p.y}`).join(' '),
      };
    }),
  );

  ngOnInit(): void {
    this.generar();
  }

  /** SC-1/SC-2/SC-5: cada vez que cambia el año se vuelve a consultar y se actualiza el gráfico. */
  generar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const anio = Number(this.form.getRawValue().anio);

    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.citaService.reporteMensual(anio).subscribe({
      next: (data) => {
        this.cargando.set(false);
        this.reporte.set(data);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.reporte.set(null);
        const apiError = err.error as ApiError | undefined;
        this.errorMensaje.set(
          err.status === 403
            ? 'No tienes permisos para consultar los reportes.'
            : (apiError?.mensaje ?? 'No fue posible generar el reporte. Intenta nuevamente.'),
        );
      },
    });
  }

  private xDe(mes: number): number {
    const util = ANCHO - MARGEN.izquierda - MARGEN.derecha;
    return MARGEN.izquierda + (util * (mes + 0.5)) / 12;
  }

  private yDe(valor: number): number {
    const util = ALTO - MARGEN.arriba - MARGEN.abajo;
    const max = this.maximoY?.() ?? 4;
    return MARGEN.arriba + util - (util * valor) / max;
  }
}
