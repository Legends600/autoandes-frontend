import { Routes } from '@angular/router';
import { Permiso } from '../../core/config/permisos';
import { permisoGuard } from '../../core/guards/permiso.guard';

export const ORDENES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./orden-lista').then((m) => m.OrdenLista) },
  // "nueva" va antes de ":id" para que no se interprete como un identificador
  {
    path: 'nueva',
    canActivate: [permisoGuard],
    data: { permiso: Permiso.ORDEN_REGISTRAR },
    loadComponent: () => import('./orden-form').then((m) => m.OrdenForm),
  },
  { path: ':id', loadComponent: () => import('./orden-detalle').then((m) => m.OrdenDetalle) },
];
