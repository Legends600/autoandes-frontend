import { AbstractControl } from '@angular/forms';

/**
 * Coloca los mensajes de "campos" de un 400 del backend bajo cada control del formulario.
 * La clave puede ser un campo simple ("placa") o una ruta de lista ("detalles[0].cantidad").
 * Devuelve los mensajes que no corresponden a ningun control, para mostrarlos en la pagina.
 */
export function aplicarErroresServidor(form: AbstractControl, campos?: Record<string, string>): string[] {
  const sinControl: string[] = [];
  for (const [clave, mensaje] of Object.entries(campos ?? {})) {
    const ruta = clave.replace(/\[(\d+)\]/g, '.$1');
    const control = form.get(ruta);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), servidor: mensaje });
      control.markAsTouched();
    } else {
      sinControl.push(mensaje);
    }
  }
  return sinControl;
}
