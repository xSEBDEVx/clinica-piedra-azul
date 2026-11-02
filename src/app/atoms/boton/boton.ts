import { Component, input } from '@angular/core';

export type VarianteBoton = 'primario' | 'pildora' | 'pildora-claro';

/**
 * Átomo: botón. Se usa sobre un <button> nativo para conservar type, disabled y (click):
 *
 *   <button app-boton type="submit" [disabled]="cargando()">Guardar</button>
 *   <button app-boton variante="pildora" (click)="confirmar()">Confirmar</button>
 *
 * Variantes:
 *  - primario:      botón rectangular de formularios de consulta/configuración.
 *  - pildora:       botón redondeado azul oscuro (agendar cita).
 *  - pildora-claro: botón redondeado azul claro (registro).
 */
@Component({
  selector: 'button[app-boton]',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './boton.css',
  host: { '[attr.data-variante]': 'variante()' },
})
export class Boton {
  readonly variante = input<VarianteBoton>('primario');
}
