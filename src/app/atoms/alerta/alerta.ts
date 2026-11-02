import { Component, input } from '@angular/core';

export type TipoAlerta = 'error' | 'exito';

/**
 * Átomo: mensaje de error o de éxito.
 *
 *   <app-alerta *ngIf="errorMensaje()">{{ errorMensaje() }}</app-alerta>
 *   <app-alerta tipo="exito" *ngIf="exito()">{{ exito() }}</app-alerta>
 */
@Component({
  selector: 'app-alerta',
  standalone: true,
  template: `<p [class]="'alerta alerta-' + tipo()"><ng-content></ng-content></p>`,
  styleUrl: './alerta.css',
})
export class Alerta {
  readonly tipo = input<TipoAlerta>('error');
}
