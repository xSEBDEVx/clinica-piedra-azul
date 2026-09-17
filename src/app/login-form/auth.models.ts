export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tipo: string; // "Bearer"
  expiresIn: number; // ms hasta expirar el access token
  usuarioId: number;
  login: string;
  nombreCompleto: string;
  rol: 'profesional' | 'agendador' | 'administrador' | 'paciente';
}

export interface ApiError {
  status: number;
  error: string;
  mensaje: string;
  timestamp: string;
}
