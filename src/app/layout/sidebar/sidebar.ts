import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MENU } from '../../core/config/menu';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="menu-lateral" aria-label="Menú principal">
      @for (item of itemsVisibles(); track item.ruta) {
        <a
          [routerLink]="item.ruta"
          routerLinkActive="activo"
          [routerLinkActiveOptions]="{ exact: item.ruta === '/ordenes' }"
          class="menu-item"
          (click)="navegar.emit()"
        >
          <span class="menu-icono">{{ item.icono }}</span>
          <span>{{ item.etiqueta }}</span>
        </a>
      }
    </nav>
  `,
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  readonly navegar = output<void>();

  /** Se recalcula sola cuando cambia la signal de permisos, por ejemplo al entrar con otro usuario. */
  protected readonly itemsVisibles = computed(() => MENU.filter((item) => this.auth.tienePermiso(item.permiso)));
}
