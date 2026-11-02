import { Component, input } from '@angular/core';

/**
 * Molécula: línea de resumen de una consulta (texto a la izquierda, total en una píldora a la derecha).
 *
 *   <app-resumen-total [total]="'3 cita(s)'">Paciente: <strong>Ana</strong></app-resumen-total>
 */
@Component({
  selector: 'app-resumen-total',
  standalone: true,
  template: `
    <span><ng-content></ng-content></span>
    <span class="totalBadge">{{ total() }}</span>
  `,
  styleUrl: './resumen-total.css',
})
export class ResumenTotal {
  readonly total = input.required<string>();
}
