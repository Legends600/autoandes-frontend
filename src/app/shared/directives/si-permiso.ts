import { Directive, effect, EmbeddedViewRef, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Muestra el elemento solo si el usuario tiene el permiso: <button *siPermiso="'ORDEN_ANULAR'">.
 * El effect lee la signal de permisos, asi que al cambiar de usuario el elemento aparece o
 * desaparece solo. Es comodidad visual: el backend rechaza la operacion con 403 igualmente.
 */
@Directive({ selector: '[siPermiso]' })
export class SiPermiso {
  private readonly auth = inject(AuthService);
  private readonly plantilla = inject(TemplateRef<unknown>);
  private readonly contenedor = inject(ViewContainerRef);
  private vista?: EmbeddedViewRef<unknown>;

  readonly siPermiso = input.required<string | readonly string[]>();

  constructor() {
    effect(() => {
      const permitido = this.auth.tienePermiso(this.siPermiso());
      if (permitido && !this.vista) {
        this.vista = this.contenedor.createEmbeddedView(this.plantilla);
      } else if (!permitido && this.vista) {
        this.contenedor.clear();
        this.vista = undefined;
      }
    });
  }
}
