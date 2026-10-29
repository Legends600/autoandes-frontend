import { Routes } from '@angular/router';
import { Permiso } from './core/config/permisos';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { permisoGuard } from './core/guards/permiso.guard';
import { MainLayout } from './layout/main-layout/main-layout';
import { AccesoDenegado } from './shared/pages/acceso-denegado/acceso-denegado';
import { NoEncontrado } from './shared/pages/no-encontrado/no-encontrado';

export const routes: Routes = [
  // El login esta fuera del layout; quien ya tiene sesion no lo ve (invitadoGuard)
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  // Todo lo demas vive dentro del layout, protegido por authGuard
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'ordenes' },
      {
        path: 'ordenes',
        canActivate: [permisoGuard],
        data: { permiso: Permiso.ORDEN_LEER },
        loadChildren: () => import('./features/ordenes/ordenes.routes').then((m) => m.ORDENES_ROUTES),
      },
      {
        path: 'vehiculos',
        canActivate: [permisoGuard],
        data: { permiso: Permiso.VEHICULO_LEER },
        loadChildren: () => import('./features/vehiculos/vehiculos.routes').then((m) => m.VEHICULOS_ROUTES),
      },
      {
        path: 'servicios',
        canActivate: [permisoGuard],
        data: { permiso: Permiso.SERVICIO_LEER },
        loadChildren: () => import('./features/servicios/servicios.routes').then((m) => m.SERVICIOS_ROUTES),
      },
      {
        path: 'reportes',
        canActivate: [permisoGuard],
        data: { permiso: Permiso.REPORTE_VER },
        loadChildren: () => import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },
      { path: 'acceso-denegado', component: AccesoDenegado },
      { path: '**', component: NoEncontrado },
    ],
  },
];
