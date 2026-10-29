import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const RESPUESTA_LOGIN = {
  token: 'jwt-de-prueba',
  tipo: 'Bearer',
  expiraEnSegundos: 3600,
  username: 'asesor',
  nombreCompleto: 'Ana Torres Rojas',
  roles: ['ASESOR'],
  permisos: ['ORDEN_LEER', 'ORDEN_REGISTRAR'],
};

function crearServicio() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  return {
    auth: TestBed.inject(AuthService),
    http: TestBed.inject(HttpTestingController),
    router: TestBed.inject(Router),
  };
}

describe('AuthService', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('el login guarda la sesion en sessionStorage con su vencimiento y expone los permisos', () => {
    const { auth, http } = crearServicio();
    const antes = Date.now();

    auth.login({ username: 'asesor', password: 'x' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(RESPUESTA_LOGIN);

    const guardada = JSON.parse(sessionStorage.getItem('autoandes.sesion') as string);
    expect(guardada.token).toBe('jwt-de-prueba');
    expect(guardada.expiraEn).toBeGreaterThanOrEqual(antes + 3600 * 1000);
    expect(auth.autenticado()).toBe(true);
    expect(auth.tienePermiso('ORDEN_REGISTRAR')).toBe(true);
    expect(auth.tienePermiso('ORDEN_ANULAR')).toBe(false);
    expect(auth.tienePermiso(['ORDEN_ANULAR', 'ORDEN_LEER'])).toBe(true);
  });

  it('no restaura una sesion cuyo token ya vencio', () => {
    sessionStorage.setItem(
      'autoandes.sesion',
      JSON.stringify({ ...RESPUESTA_LOGIN, expiraEn: Date.now() - 1000 }),
    );

    const { auth } = crearServicio();

    expect(auth.autenticado()).toBe(false);
    expect(sessionStorage.getItem('autoandes.sesion')).toBeNull();
  });

  it('restaura una sesion vigente al recargar la pagina', () => {
    sessionStorage.setItem(
      'autoandes.sesion',
      JSON.stringify({ ...RESPUESTA_LOGIN, expiraEn: Date.now() + 60_000 }),
    );

    const { auth } = crearServicio();

    expect(auth.autenticado()).toBe(true);
    expect(auth.token).toBe('jwt-de-prueba');
  });

  it('cierra la sesion sola cuando llega el vencimiento del token', () => {
    vi.useFakeTimers();
    const { auth, http, router } = crearServicio();
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    auth.login({ username: 'asesor', password: 'x' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ ...RESPUESTA_LOGIN, expiraEnSegundos: 10 });
    expect(auth.autenticado()).toBe(true);

    vi.advanceTimersByTime(10_000);

    expect(auth.autenticado()).toBe(false);
    expect(sessionStorage.getItem('autoandes.sesion')).toBeNull();
    // Vuelve al login con el motivo y recordando la ruta donde estaba el usuario
    expect(navegar).toHaveBeenCalledWith(['/login'], { queryParams: { motivo: 'expirada', returnUrl: '/' } });
  });

  it('cerrar sesion borra el almacenamiento y los permisos', () => {
    const { auth, http, router } = crearServicio();
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    auth.login({ username: 'asesor', password: 'x' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(RESPUESTA_LOGIN);

    auth.cerrarSesion();

    expect(auth.autenticado()).toBe(false);
    expect(auth.permisos().size).toBe(0);
    expect(sessionStorage.getItem('autoandes.sesion')).toBeNull();
  });
});
