import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Cada ruta declara el permiso que exige en data: { permiso: 'ORDEN_REGISTRAR' } (o una lista:
 * basta con uno). Escribir la URL a mano no evita el guard. Es una mejora de experiencia: la
 * proteccion real es el 403 del backend.
 */
export const permisoGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const requerido = route.data['permiso'] as string | string[] | undefined;
  if (!requerido || auth.tienePermiso(requerido)) return true;
  return inject(Router).createUrlTree(['/acceso-denegado']);
};
