import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';

describe('interceptores HTTP', () => {
  let http: HttpClient;
  let controlador: HttpTestingController;
  let auth: AuthService;
  let cerrarSesion: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    controlador = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    cerrarSesion = vi.spyOn(auth, 'cerrarSesion');
    sessionStorage.setItem(
      'autoandes.sesion',
      JSON.stringify({
        token: 'abc.def.ghi',
        username: 'asesor',
        nombreCompleto: 'Ana',
        roles: ['ASESOR'],
        permisos: ['ORDEN_LEER'],
        expiraEn: Date.now() + 60_000,
      }),
    );
    // La sesion se restaura en el constructor: se vuelve a crear para que lea el almacenamiento
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    controlador = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    cerrarSesion = vi.spyOn(auth, 'cerrarSesion');
  });

  it('agrega Authorization: Bearer solo a las peticiones a la API', () => {
    http.get(`${environment.apiUrl}/servicios`).subscribe();
    const aLaApi = controlador.expectOne(`${environment.apiUrl}/servicios`);
    expect(aLaApi.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    aLaApi.flush([]);

    http.get('https://otro-dominio.com/datos').subscribe();
    const aOtroDominio = controlador.expectOne('https://otro-dominio.com/datos');
    expect(aOtroDominio.request.headers.has('Authorization')).toBe(false);
    aOtroDominio.flush({});
  });

  it('un 401 de la API cierra la sesion', () => {
    http.get(`${environment.apiUrl}/ordenes`).subscribe({ error: () => undefined });

    controlador.expectOne(`${environment.apiUrl}/ordenes`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(cerrarSesion).toHaveBeenCalledWith('no-autorizada', expect.any(String));
  });

  it('el 401 del propio login NO cierra la sesion: es "credenciales incorrectas"', () => {
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: () => undefined });

    controlador.expectOne(`${environment.apiUrl}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(cerrarSesion).not.toHaveBeenCalled();
  });

  it('un 403 NO cierra la sesion', () => {
    http.get(`${environment.apiUrl}/reportes/ingresos-por-servicio`).subscribe({ error: () => undefined });

    controlador
      .expectOne(`${environment.apiUrl}/reportes/ingresos-por-servicio`)
      .flush({}, { status: 403, statusText: 'Forbidden' });

    expect(cerrarSesion).not.toHaveBeenCalled();
    expect(auth.autenticado()).toBe(true);
  });
});
