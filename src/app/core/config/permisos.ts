/** Permisos de la matriz de la seccion 3.2 (los mismos nombres que devuelve el backend). */
export const Permiso = {
  SERVICIO_LEER: 'SERVICIO_LEER',
  SERVICIO_ESCRIBIR: 'SERVICIO_ESCRIBIR',
  VEHICULO_LEER: 'VEHICULO_LEER',
  VEHICULO_ESCRIBIR: 'VEHICULO_ESCRIBIR',
  ORDEN_LEER: 'ORDEN_LEER',
  ORDEN_REGISTRAR: 'ORDEN_REGISTRAR',
  ORDEN_ANULAR: 'ORDEN_ANULAR',
  REPORTE_VER: 'REPORTE_VER',
} as const;

export type PermisoNombre = (typeof Permiso)[keyof typeof Permiso];
