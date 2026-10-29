import { Permiso, PermisoNombre } from './permisos';

export interface ItemMenu {
  etiqueta: string;
  ruta: string;
  icono: string;
  /** Permiso que hace visible el item. Ocultarlo es solo comodidad: el backend decide con 403. */
  permiso: PermisoNombre;
}

export const MENU: readonly ItemMenu[] = [
  { etiqueta: 'Órdenes', ruta: '/ordenes', icono: '📋', permiso: Permiso.ORDEN_LEER },
  { etiqueta: 'Nueva orden', ruta: '/ordenes/nueva', icono: '➕', permiso: Permiso.ORDEN_REGISTRAR },
  { etiqueta: 'Vehículos', ruta: '/vehiculos', icono: '🚗', permiso: Permiso.VEHICULO_LEER },
  { etiqueta: 'Servicios', ruta: '/servicios', icono: '🔧', permiso: Permiso.SERVICIO_LEER },
  { etiqueta: 'Reportes', ruta: '/reportes', icono: '📊', permiso: Permiso.REPORTE_VER },
];
