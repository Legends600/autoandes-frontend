import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="encabezado">
      <button type="button" class="btn-menu" aria-label="Abrir o cerrar el menú" (click)="alternarMenu.emit()">☰</button>
      <div class="marca">
        <span class="marca-icono">🔧</span>
        <span class="marca-nombre">AutoAndes</span>
      </div>
      <div class="encabezado-usuario">
        @if (auth.sesion(); as sesion) {
          <div class="usuario-datos">
            <strong>{{ sesion.nombreCompleto }}</strong>
            <span class="usuario-roles">
              @for (rol of sesion.roles; track rol) {
                <span class="etiqueta">{{ rol }}</span>
              }
            </span>
          </div>
        }
        <button type="button" class="btn btn-secundario btn-chico" (click)="auth.cerrarSesion()">Cerrar sesión</button>
      </div>
    </header>
  `,
})
export class Header {
  protected readonly auth = inject(AuthService);
  readonly alternarMenu = output<void>();
}
