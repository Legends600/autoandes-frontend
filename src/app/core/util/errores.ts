import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error';

/** Convierte cualquier error de HttpClient en el formato comun del backend, para mostrarlo tal cual. */
export function aApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return { status: 0, mensaje: 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.' };
    }
    const cuerpo = error.error as Partial<ApiError> | null;
    if (cuerpo && typeof cuerpo === 'object' && typeof cuerpo.mensaje === 'string') {
      return { ...cuerpo, status: error.status, mensaje: cuerpo.mensaje };
    }
    return { status: error.status, mensaje: `Ocurrió un error inesperado (código ${error.status}).` };
  }
  return { status: -1, mensaje: 'Ocurrió un error inesperado.' };
}
