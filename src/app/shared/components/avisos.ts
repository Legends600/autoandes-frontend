import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificacionService } from '../../core/services/notificacion.service';

/** Muestra los avisos breves de NotificacionService en la esquina de la pantalla. */
@Component({
  selector: 'app-avisos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avisos" aria-live="polite">
      @for (aviso of notificaciones.avisos(); track aviso.id) {
        <div class="aviso" [class.aviso-error]="aviso.tipo === 'error'" role="status">
          <span>{{ aviso.texto }}</span>
          <button type="button" class="aviso-cerrar" aria-label="Cerrar aviso" (click)="notificaciones.cerrar(aviso.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class Avisos {
  protected readonly notificaciones = inject(NotificacionService);
}
