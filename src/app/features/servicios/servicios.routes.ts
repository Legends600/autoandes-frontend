import { Routes } from '@angular/router';
import { Permiso } from '../../core/config/permisos';
import { permisoGuard } from '../../core/guards/permiso.guard';

const escritura = { canActivate: [permisoGuard], data: { permiso: Permiso.SERVICIO_ESCRIBIR } };

export const SERVICIOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./servicio-lista').then((m) => m.ServicioLista) },
  // Un solo formulario sirve para registrar (/nuevo) y para editar (/:id/editar)
  { path: 'nuevo', ...escritura, loadComponent: () => import('./servicio-form').then((m) => m.ServicioForm) },
  { path: ':id/editar', ...escritura, loadComponent: () => import('./servicio-form').then((m) => m.ServicioForm) },
];
