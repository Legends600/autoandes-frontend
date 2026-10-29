import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { authGuard } from './auth.guard';
import { invitadoGuard } from './invitado.guard';
import { permisoGuard } from './permiso.guard';

function guardarSesion(permisos: string[], vencida = false): void {
  sessionStorage.setItem(
    'autoandes.sesion',
    JSON.stringify({
      token: 't',
      username: 'u',
      nombreCompleto: 'U',
      roles: [],
      permisos,
      expiraEn: Date.now() + (vencida ? -1000 : 60_000),
    }),
  );
}

const rutaCon = (permiso?: string | string[]) => ({ data: { permiso } }) as unknown as ActivatedRouteSnapshot;
const estado = (url: string) => ({ url }) as RouterStateSnapshot;

function ejecutar<T>(fn: () => T): T {
  return TestBed.runInInjectionContext(fn);
}

describe('guards', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  const configurar = () =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

  it('authGuard envia al login con la ruta pedida como returnUrl cuando no hay sesion', () => {
    configurar();

    const resultado = ejecutar(() => authGuard(rutaCon(), estado('/ordenes/nueva'))) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/login?returnUrl=%2Fordenes%2Fnueva');
  });

  it('authGuard deja pasar con una sesion vigente', () => {
    guardarSesion(['ORDEN_LEER']);
    configurar();

    expect(ejecutar(() => authGuard(rutaCon(), estado('/ordenes')))).toBe(true);
  });

  it('invitadoGuard no deja ver el login a quien ya tiene sesion', () => {
    guardarSesion(['ORDEN_LEER']);
    configurar();

    const resultado = ejecutar(() => invitadoGuard(rutaCon(), estado('/login'))) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/');
  });

  it('permisoGuard deja pasar si el usuario tiene el permiso de la ruta', () => {
    guardarSesion(['ORDEN_REGISTRAR']);
    configurar();

    expect(ejecutar(() => permisoGuard(rutaCon('ORDEN_REGISTRAR'), estado('/ordenes/nueva')))).toBe(true);
  });

  it('permisoGuard envia a "acceso denegado" si falta el permiso, sin cerrar la sesion', () => {
    guardarSesion(['ORDEN_LEER', 'ORDEN_ANULAR']);
    configurar();

    const resultado = ejecutar(() => permisoGuard(rutaCon('ORDEN_REGISTRAR'), estado('/ordenes/nueva'))) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/acceso-denegado');
    expect(sessionStorage.getItem('autoandes.sesion')).not.toBeNull();
  });
});
