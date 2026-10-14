export type RolUsuario = 'profesional' | 'agendador' | 'administrador' | 'paciente';

export interface ApiError {
  status: number;
  error: string;
  mensaje: string;
  timestamp: string;
}
