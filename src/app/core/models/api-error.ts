/** Formato de error comun del backend (seccion 3.5). "campos" solo viene en los errores de validacion (400). */
export interface ApiError {
  timestamp?: string;
  status: number;
  error?: string;
  mensaje: string;
  ruta?: string;
  campos?: Record<string, string>;
}
