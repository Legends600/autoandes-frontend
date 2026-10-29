import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/** Para el login: quien ya tiene sesion no vuelve a ver el formulario. */
export const invitadoGuard: CanActivateFn = () => {
  if (!inject(AuthService).sesionVigente()) return true;
  return inject(Router).createUrlTree(['/']);
};
