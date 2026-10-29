import { HttpParams } from '@angular/common/http';

/** Arma los parametros de consulta omitiendo los vacios, para que los filtros sean opcionales. */
export function aParametros(filtros: Record<string, string | number | null | undefined>): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
      params = params.set(clave, String(valor).trim());
    }
  }
  return params;
}
