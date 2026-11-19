export type EstadoCita = 'programada' | 'cancelada' | 'completada';

export interface CitaDTO {
  id?: number;
  pacienteId: number;
  pacienteNombre?: string;
  profesionalId: number;
  profesionalNombre?: string;
  fechaHora: string; // ISO ZonedDateTime, ej. 2026-09-20T09:00:00-05:00
  estado?: EstadoCita;
  /** HU-2.3: justificación de la cancelación. */
  motivoCancelacion?: string;
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

/** HU-4.1: historial de citas de un paciente consultado por cédula. */
export interface HistorialCitasPacienteDTO {
  pacienteId: number;
  pacienteNombre: string;
  cedulaIdentidad: string;
  citas: CitaDTO[];
}

/** HU-5.1: citas por mes (12 valores, enero..diciembre) de un médico. */
export interface SerieMedicoDTO {
  profesionalId: number;
  profesionalNombre: string;
  citasPorMes: number[];
  total: number;
}

/** HU-5.1: reporte anual de citas por mes y por médico. */
export interface ReporteCitasMensualDTO {
  anio: number;
  totalCitas: number;
  series: SerieMedicoDTO[];
}
