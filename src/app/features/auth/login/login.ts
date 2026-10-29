import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { aApiError } from '../../../core/util/errores';
import { CampoError } from '../../../shared/components/campo-error';
import { aplicarErroresServidor } from '../../../shared/forms/errores-servidor';

const AVISOS: Record<string, string> = {
  expirada: 'Su sesión venció. Ingrese nuevamente.',
  'no-autorizada': 'Su sesión ya no es válida. Ingrese nuevamente.',
};

/** Pagina de login: vive fuera del layout (sin menu ni encabezado). */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CampoError],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = AVISOS[this.ruta.snapshot.queryParamMap.get('motivo') ?? ''] ?? null;

  protected readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected entrar(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl(this.destino()),
      error: (e) => {
        const api = aApiError(e);
        const sueltos = aplicarErroresServidor(this.form, api.campos);
        // Un 401 del login siempre muestra el mismo mensaje del backend (no revela si el usuario existe)
        this.error.set(api.campos ? (sueltos.join(' · ') || api.mensaje) : api.mensaje);
        this.enviando.set(false);
      },
    });
  }

  /** Vuelve a la ruta que se queria visitar, aceptando solo rutas internas. */
  private destino(): string {
    const returnUrl = this.ruta.snapshot.queryParamMap.get('returnUrl');
    const interna = !!returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') && !returnUrl.startsWith('/login');
    return interna ? returnUrl : '/';
  }
}
