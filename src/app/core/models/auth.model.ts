export type RolUsuario = 'profesional' | 'agendador' | 'administrador' | 'paciente';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tipo: string;
  expiresIn: number;
  usuarioId: number;
  login: string;
  nombreCompleto: string;
  rol: RolUsuario;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegistroCredencialRequest {
  usuarioId: number;
  login: string;
  password: string;
}

export interface ApiError {
  status: number;
  error: string;
  mensaje: string;
  timestamp: string;
}
