import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avisos } from '../../shared/components/avisos';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

/** Encabezado + menu lateral + router-outlet. Todas las rutas protegidas se muestran dentro de este layout. */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar, Avisos],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout" [class.menu-abierto]="menuAbierto()">
      <app-header (alternarMenu)="menuAbierto.set(!menuAbierto())" />
      <app-sidebar (navegar)="menuAbierto.set(false)" />
      <main class="contenido">
        <router-outlet />
      </main>
      <app-avisos />
    </div>
  `,
})
export class MainLayout {
  protected readonly menuAbierto = signal(false);
}
