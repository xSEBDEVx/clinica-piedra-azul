import { RolUsuario } from './auth.model';

export interface UsuarioDTO {
  id?: number;
  nombreCompleto: string;
  login: string;
  rol: RolUsuario;
  activo?: boolean;
}

export interface PacienteDTO {
  id?: number;
  nombreCompleto: string;
  cedulaIdentidad: string;
  fechaNacimiento?: string; // ISO date (yyyy-MM-dd)
  telefono: string;
  email?: string;
  direccion?: string;
}

export type TipoProfesional = 'medico' | 'terapeuta';

export interface ProfesionalDTO {
  id?: number;
  nombreCompleto: string;
  tipo: TipoProfesional;
  especialidadNombre: string;
  licenciaProfesional: string;
  activo?: boolean;
  duracionCitaMinutos?: number;
}

export interface RegistroPacienteRequest {
  usuario: UsuarioDTO;
  paciente: PacienteDTO;
}

export interface RegistroProfesionalRequest {
  usuario: UsuarioDTO;
  profesional: ProfesionalDTO;
}
