import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagina-estado">
      <div class="estado-icono">🔎</div>
      <h1>Página no encontrada</h1>
      <p>La dirección que escribió no existe en AutoAndes.</p>
      <a routerLink="/ordenes" class="btn btn-primario">Ir al inicio</a>
    </section>
  `,
})
export class NoEncontrado {}
