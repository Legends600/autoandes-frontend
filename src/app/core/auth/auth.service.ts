import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, MotivoCierre, Sesion } from './auth.models';

const CLAVE_SESION = 'autoandes.sesion';

/**
 * Sesion del usuario. El estado vive en signals: cualquier componente, guard o directiva que lea
 * `sesion()` o `tienePermiso()` se actualiza solo cuando cambia el usuario, sin recargar la pagina.
 * Se guarda en sessionStorage (no en localStorage) porque las computadoras del mostrador se comparten:
 * al cerrar la pestana la sesion desaparece.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _sesion = signal<Sesion | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  readonly sesion = this._sesion.asReadonly();
  readonly autenticado = computed(() => this._sesion() !== null);
  readonly permisos = computed(() => new Set(this._sesion()?.permisos ?? []));

  constructor() {
    this.restaurar();
  }

  login(credenciales: LoginRequest): Observable<Sesion> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      map((r) => ({
        token: r.token,
        username: r.username,
        nombreCompleto: r.nombreCompleto,
        roles: r.roles,
        permisos: r.permisos,
        expiraEn: Date.now() + r.expiraEnSegundos * 1000,
      })),
      tap((sesion) => this.iniciar(sesion)),
    );
  }

  /** Borra la sesion y vuelve al login. Un 403 nunca llama a este metodo: solo el cierre manual, el vencimiento y el 401. */
  cerrarSesion(motivo: MotivoCierre = 'manual', returnUrl?: string): void {
    this.limpiar();
    const queryParams: Record<string, string> = {};
    if (motivo !== 'manual') queryParams['motivo'] = motivo;
    if (returnUrl && !returnUrl.startsWith('/login')) queryParams['returnUrl'] = returnUrl;
    void this.router.navigate(['/login'], { queryParams });
  }

  /** True si hay sesion y el token no ha vencido. Si vencio, la cierra. */
  sesionVigente(): boolean {
    const sesion = this._sesion();
    if (!sesion) return false;
    if (sesion.expiraEn <= Date.now()) {
      this.cerrarSesion('expirada', this.router.url);
      return false;
    }
    return true;
  }

  tienePermiso(requerido: string | readonly string[]): boolean {
    const permisos = this.permisos();
    return typeof requerido === 'string' ? permisos.has(requerido) : requerido.some((p) => permisos.has(p));
  }

  get token(): string | null {
    return this._sesion()?.token ?? null;
  }

  private iniciar(sesion: Sesion): void {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    this._sesion.set(sesion);
    this.programarVencimiento(sesion);
  }

  private restaurar(): void {
    try {
      const guardada = sessionStorage.getItem(CLAVE_SESION);
      if (!guardada) return;
      const sesion = JSON.parse(guardada) as Sesion;
      const valida = typeof sesion.token === 'string' && Array.isArray(sesion.permisos) && sesion.expiraEn > Date.now();
      if (!valida) {
        sessionStorage.removeItem(CLAVE_SESION);
        return;
      }
      this._sesion.set(sesion);
      this.programarVencimiento(sesion);
    } catch {
      sessionStorage.removeItem(CLAVE_SESION);
    }
  }

  /** Cierre automatico: cuando llega la hora de vencimiento del token, la sesion se cierra sola. */
  private programarVencimiento(sesion: Sesion): void {
    clearTimeout(this.temporizador);
    const restante = sesion.expiraEn - Date.now();
    this.temporizador = setTimeout(() => this.cerrarSesion('expirada', this.router.url), Math.max(restante, 0));
  }

  private limpiar(): void {
    clearTimeout(this.temporizador);
    sessionStorage.removeItem(CLAVE_SESION);
    this._sesion.set(null);
  }
}
