import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

/**
 * 401 = el token falta, es invalido o vencio: se cierra la sesion y se vuelve al login recordando
 * la ruta (returnUrl). El 401 del propio login se excluye: es "credenciales incorrectas" y se muestra ahi.
 * 403 = el usuario esta autenticado pero no tiene permiso: NO cierra la sesion, el error llega al componente.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const esApiPropia = req.url.startsWith(environment.apiUrl);
  const esLogin = req.url === `${environment.apiUrl}/auth/login`;

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && esApiPropia && !esLogin) {
        auth.cerrarSesion('no-autorizada', router.url);
      }
      return throwError(() => error);
    }),
  );
};
