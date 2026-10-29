import { Routes } from '@angular/router';
import { Permiso } from '../../core/config/permisos';
import { permisoGuard } from '../../core/guards/permiso.guard';

const escritura = { canActivate: [permisoGuard], data: { permiso: Permiso.VEHICULO_ESCRIBIR } };

export const VEHICULOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./vehiculo-lista').then((m) => m.VehiculoLista) },
  { path: 'nuevo', ...escritura, loadComponent: () => import('./vehiculo-form').then((m) => m.VehiculoForm) },
  { path: ':id/editar', ...escritura, loadComponent: () => import('./vehiculo-form').then((m) => m.VehiculoForm) },
];
