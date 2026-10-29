import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Ventana de confirmacion reutilizable: se muestra antes de dar de baja o eliminar. */
@Component({
  selector: 'app-confirmar-dialogo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-fondo" (click)="cancelado.emit()">
      <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <h2>{{ titulo() }}</h2>
        <p>{{ mensaje() }}</p>
        <div class="modal-acciones">
          <button type="button" class="btn btn-secundario" (click)="cancelado.emit()">Cancelar</button>
          <button type="button" class="btn btn-peligro" (click)="confirmado.emit()">{{ textoConfirmar() }}</button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmarDialogo {
  readonly titulo = input('Confirmar acción');
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Confirmar');
  readonly confirmado = output<void>();
  readonly cancelado = output<void>();
}
