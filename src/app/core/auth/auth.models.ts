export interface LoginRequest {
  username: string;
  password: string;
}

/** Respuesta de POST /auth/login. */
export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

/** Lo que se guarda en sessionStorage: la respuesta del login mas el instante exacto en que vence. */
export interface Sesion {
  token: string;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
  /** Milisegundos desde 1970 en que vence el token. */
  expiraEn: number;
}

export type MotivoCierre = 'manual' | 'expirada' | 'no-autorizada';
