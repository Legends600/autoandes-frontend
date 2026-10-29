import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagina-estado">
      <div class="estado-icono">🚫</div>
      <h1>Acceso denegado</h1>
      <p>Su usuario no tiene permiso para ver esta página. Su sesión continúa activa.</p>
      <a routerLink="/ordenes" class="btn btn-primario">Volver a las órdenes</a>
    </section>
  `,
})
export class AccesoDenegado {}
