export type EstadoCita = 'programada' | 'cancelada' | 'completada';

export interface CitaDTO {
  id?: number;
  pacienteId: number;
  pacienteNombre?: string;
  profesionalId: number;
  profesionalNombre?: string;
  fechaHora: string; // ISO ZonedDateTime, ej. 2026-09-20T09:00:00-05:00
  estado?: EstadoCita;
}

export interface DisponibilidadSemanalDTO {
  id?: number;
  profesionalId: number;
  /** 0 = Domingo ... 6 = Sábado */
  diaSemana: number;
  horaInicio: string; // HH:mm:ss ó HH:mm
  horaFin: string;
  duracionCitaMinutos: number;
}

export type TipoDiaNoDisponible = 'FESTIVO' | 'BLOQUEO_MANUAL';

export interface DiaNoDisponibleDTO {
  id?: number;
  fecha: string; // yyyy-MM-dd
  motivo?: string;
  tipo: TipoDiaNoDisponible;
}

export interface ConfiguracionAgendamientoDTO {
  id?: number;
  semanasHabilitadas: number;
}
