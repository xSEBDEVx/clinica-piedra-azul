import { Component, computed, input, output, signal } from '@angular/core';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

interface Celda {
  fecha: string; // yyyy-MM-dd
  dia: number;
  delMes: boolean;
  habilitada: boolean;
}

/** yyyy-MM-dd en hora local (toISOString usaría UTC y desfasa el día por la noche en Colombia). */
export function aISOLocal(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Molécula: calendario mensual (selector de mes/año, flechas y cuadrícula de días).
 * Las fechas fuera de [min, max] se muestran atenuadas y no son seleccionables.
 *
 *   <app-calendario [valor]="fecha" [min]="hoy" [max]="limite" (seleccionada)="fecha = $event" />
 */
@Component({
  selector: 'app-calendario',
  standalone: true,
  templateUrl: './calendario.html',
  styleUrl: './calendario.css',
})
export class Calendario {
  readonly valor = input<string | null>(null);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly seleccionada = output<string>();

  readonly meses = MESES;
  readonly dias = DIAS;

  private readonly hoy = new Date();
  readonly mes = signal(this.hoy.getMonth());
  readonly anio = signal(this.hoy.getFullYear());

  readonly anios = computed(() => {
    const base = this.hoy.getFullYear();
    const desde = Math.min(base, this.anio());
    const hasta = Math.max(base + 2, this.anio(), this.max() ? Number(this.max()!.slice(0, 4)) : 0);
    return Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
  });

  readonly celdas = computed<Celda[]>(() => {
    const mes = this.mes();
    const anio = this.anio();
    const primero = new Date(anio, mes, 1);
    const inicio = new Date(anio, mes, 1 - primero.getDay());
    const min = this.min();
    const max = this.max();

    // Semanas necesarias para cubrir el mes (5 o 6 filas).
    const diasMes = new Date(anio, mes + 1, 0).getDate();
    const filas = Math.ceil((primero.getDay() + diasMes) / 7);

    return Array.from({ length: filas * 7 }, (_, i) => {
      const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
      const fecha = aISOLocal(d);
      const delMes = d.getMonth() === mes;
      return {
        fecha,
        dia: d.getDate(),
        delMes,
        habilitada: delMes && (!min || fecha >= min) && (!max || fecha <= max),
      };
    });
  });

  cambiarMes(delta: number): void {
    const d = new Date(this.anio(), this.mes() + delta, 1);
    this.mes.set(d.getMonth());
    this.anio.set(d.getFullYear());
  }

  elegirMes(valor: string): void {
    this.mes.set(Number(valor));
  }

  elegirAnio(valor: string): void {
    this.anio.set(Number(valor));
  }

  elegir(celda: Celda): void {
    if (celda.habilitada) this.seleccionada.emit(celda.fecha);
  }
}
