import { Component, computed, input } from '@angular/core';
import { EstadoCita } from '../../core/models/scheduling.model';

/**
 * Átomo: etiqueta de color con el estado de una cita.
 *
 *   <app-badge-estado [estado]="cita.estado" />
 */
@Component({
  selector: 'app-badge-estado',
  standalone: true,
  template: `<span [class]="clase()">{{ etiqueta() }}</span>`,
  styleUrl: './badge-estado.css',
})
export class BadgeEstado {
  readonly estado = input<EstadoCita | undefined>();

  readonly clase = computed(() => {
    switch (this.estado()) {
      case 'programada':
        return 'badge badge-programada';
      case 'cancelada':
        return 'badge badge-cancelada';
      case 'completada':
        return 'badge badge-completada';
      default:
        return 'badge';
    }
  });

  readonly etiqueta = computed(() => {
    switch (this.estado()) {
      case 'programada':
        return 'Programada';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      default:
        return this.estado() ?? '—';
    }
  });
}
