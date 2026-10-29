import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Muestra bajo un control su primer mensaje de error: el de las validaciones locales o el que
 * devolvio el backend (error "servidor"). Escucha los eventos del control, asi se actualiza solo.
 */
@Component({
  selector: 'app-campo-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mensaje(); as texto) {
      <small class="campo-error" role="alert">{{ texto }}</small>
    }
  `,
})
export class CampoError {
  readonly control = input.required<AbstractControl>();
  /** Mensajes propios por tipo de error, por ejemplo { pattern: 'El formato es ABC-123' }. */
  readonly mensajes = input<Record<string, string>>({});

  private readonly cambios = signal(0);

  readonly mensaje = computed(() => {
    this.cambios();
    const control = this.control();
    const errores = control.errors;
    if (!errores) return null;
    if (!control.touched && !control.dirty && !errores['servidor']) return null;
    const personalizados = this.mensajes();
    const clave = Object.keys(errores)[0];
    if (personalizados[clave]) return personalizados[clave];
    const detalle = errores[clave];
    switch (clave) {
      case 'servidor':
      case 'duplicado':
        return typeof detalle === 'string' ? detalle : 'Valor repetido';
      case 'required':
        return 'Este campo es obligatorio';
      case 'minlength':
        return `Debe tener al menos ${detalle.requiredLength} caracteres`;
      case 'maxlength':
        return `No puede superar ${detalle.requiredLength} caracteres`;
      case 'min':
        return `El valor mínimo es ${detalle.min}`;
      case 'max':
        return `El valor máximo es ${detalle.max}`;
      case 'pattern':
        return 'El formato no es válido';
      default:
        return 'El valor no es válido';
    }
  });

  constructor() {
    effect((alLimpiar) => {
      const suscripcion = this.control().events.subscribe(() => this.cambios.update((n) => n + 1));
      alLimpiar(() => suscripcion.unsubscribe());
    });
  }
}
