import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Permiso } from '../../core/config/permisos';
import { Orden } from '../../core/models/orden';
import { NotificacionService } from '../../core/services/notificacion.service';
import { OrdenesApi } from '../../core/services/ordenes-api';
import { aApiError } from '../../core/util/errores';
import { CampoError } from '../../shared/components/campo-error';
import { SiPermiso } from '../../shared/directives/si-permiso';
import { aplicarErroresServidor } from '../../shared/forms/errores-servidor';

@Component({
  selector: 'app-orden-detalle',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, CurrencyPipe, SiPermiso, CampoError],
  templateUrl: './orden-detalle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdenDetalle implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(OrdenesApi);
  private readonly notificaciones = inject(NotificacionService);

  /** Llega de la ruta (:id). */
  readonly id = input.required<string>();

  protected readonly Permiso = Permiso;
  protected readonly orden = signal<Orden | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly anulando = signal(false);
  protected readonly enviando = signal(false);
  protected readonly errorAnulacion = signal<string | null>(null);
  protected readonly formAnulacion = this.fb.group({
    motivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.api.obtener(Number(this.id())).subscribe({
      next: (orden) => {
        this.orden.set(orden);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(aApiError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }

  protected abrirAnulacion(): void {
    this.formAnulacion.reset();
    this.errorAnulacion.set(null);
    this.anulando.set(true);
  }

  protected cerrarAnulacion(): void {
    this.anulando.set(false);
  }

  protected confirmarAnulacion(): void {
    this.errorAnulacion.set(null);
    if (this.formAnulacion.invalid) {
      this.formAnulacion.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.api.anular(Number(this.id()), this.formAnulacion.controls.motivo.value.trim()).subscribe({
      next: (orden) => {
        this.orden.set(orden);
        this.enviando.set(false);
        this.anulando.set(false);
        this.notificaciones.exito(`Orden ${orden.numero} anulada`);
      },
      error: (e) => {
        const api = aApiError(e);
        const sueltos = aplicarErroresServidor(this.formAnulacion, api.campos);
        // 409 (otro dia o ya anulada): el mensaje del backend se muestra dentro de la ventana
        this.errorAnulacion.set(api.campos ? (sueltos.join(' · ') || null) : api.mensaje);
        this.enviando.set(false);
      },
    });
  }
}
