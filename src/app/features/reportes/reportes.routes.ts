import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./reporte-ingresos').then((m) => m.ReporteIngresos) },
];
