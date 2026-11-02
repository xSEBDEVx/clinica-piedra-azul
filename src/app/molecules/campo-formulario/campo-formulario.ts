import { Component, input } from '@angular/core';

/**
 * Molécula: etiqueta + control de formulario + mensajes de error del campo.
 * El control (input/select) y los mensajes se proyectan desde la página,
 * así que formControlName y los *ngIf de validación siguen viviendo allí.
 *
 *   <app-campo-formulario etiqueta="Correo electrónico" para="email">
 *     <input id="email" formControlName="email" />
 *     <span class="error-campo" *ngIf="...">Correo inválido</span>
 *   </app-campo-formulario>
 */
@Component({
  selector: 'app-campo-formulario',
  standalone: true,
  template: `
    <label [attr.for]="para()">{{ etiqueta() }}</label>
    <ng-content></ng-content>
  `,
  styleUrl: './campo-formulario.css',
})
export class CampoFormulario {
  readonly etiqueta = input.required<string>();
  /** id del control proyectado, para enlazar la etiqueta. */
  readonly para = input<string>();
}
