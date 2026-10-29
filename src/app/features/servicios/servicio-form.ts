import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ServiciosApi } from '../../core/services/servicios-api';
import { aApiError } from '../../core/util/errores';
import { CampoError } from '../../shared/components/campo-error';
import { aplicarErroresServidor } from '../../shared/forms/errores-servidor';

/** Un solo formulario para registrar (/servicios/nuevo) y editar (/servicios/:id/editar). */
@Component({
  selector: 'app-servicio-form',
  imports: [ReactiveFormsModule, RouterLink, CampoError],
  templateUrl: './servicio-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicioForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ServiciosApi);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  /** Llega de la ruta (:id) gracias a withComponentInputBinding. */
  readonly id = input<string>();
  protected readonly esEdicion = computed(() => !!this.id());

  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  // Las mismas reglas que el backend: codigo SRV-000, nombre 3-80, precio > 0, duracion 15-480
  protected readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-\d{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    duracionMin: this.fb.control<number | null>(null, [Validators.required, Validators.min(15), Validators.max(480)]),
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.cargando.set(true);
    this.api.obtener(Number(id)).subscribe({
      next: (s) => {
        this.form.patchValue({ codigo: s.codigo, nombre: s.nombre, precio: s.precio, duracionMin: s.duracionMin });
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(aApiError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }

  protected guardar(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    const cuerpo = {
      codigo: valores.codigo.trim(),
      nombre: valores.nombre.trim(),
      precio: valores.precio as number,
      duracionMin: valores.duracionMin as number,
    };
    this.guardando.set(true);
    const id = this.id();
    const peticion = id ? this.api.actualizar(Number(id), cuerpo) : this.api.crear(cuerpo);
    peticion.subscribe({
      next: (s) => {
        this.notificaciones.exito(id ? `Servicio ${s.codigo} actualizado` : `Servicio ${s.codigo} registrado`);
        void this.router.navigate(['/servicios']);
      },
      error: (e) => {
        const api = aApiError(e);
        // 400: cada mensaje va bajo su control. 409/404: el mensaje del backend se muestra en la pagina.
        const sueltos = aplicarErroresServidor(this.form, api.campos);
        this.error.set(api.campos ? (sueltos.join(' · ') || api.mensaje) : api.mensaje);
        this.guardando.set(false);
      },
    });
  }
}
