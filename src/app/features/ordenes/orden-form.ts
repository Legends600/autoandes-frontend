import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, map, startWith } from 'rxjs';
import { OrdenRequest } from '../../core/models/orden';
import { Servicio } from '../../core/models/servicio';
import { Vehiculo } from '../../core/models/vehiculo';
import { NotificacionService } from '../../core/services/notificacion.service';
import { OrdenesApi } from '../../core/services/ordenes-api';
import { ServiciosApi } from '../../core/services/servicios-api';
import { VehiculosApi } from '../../core/services/vehiculos-api';
import { aApiError } from '../../core/util/errores';
import { CampoError } from '../../shared/components/campo-error';
import { aplicarErroresServidor } from '../../shared/forms/errores-servidor';

const MAX_LINEAS = 10;

type LineaForm = FormGroup<{
  servicioId: FormControl<number | null>;
  cantidad: FormControl<number>;
}>;

/** Un servicio no puede aparecer en dos lineas de la misma orden. */
function sinServiciosRepetidos(control: AbstractControl): ValidationErrors | null {
  const ids = (control as FormArray<LineaForm>).controls
    .map((linea) => linea.controls.servicioId.value)
    .filter((id): id is number => id !== null);
  return new Set(ids).size === ids.length ? null : { duplicado: 'No puede repetir el mismo servicio' };
}

const redondear = (n: number) => Math.round(n * 100) / 100;

/**
 * Formulario cabecera-detalle de la orden. El subtotal y el total que se ven aqui son solo una ayuda
 * para quien registra: al backend viajan unicamente vehiculo, kilometraje y (servicio, cantidad),
 * y el backend calcula y guarda los importes.
 */
@Component({
  selector: 'app-orden-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, CampoError],
  templateUrl: './orden-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdenForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ordenesApi = inject(OrdenesApi);
  private readonly vehiculosApi = inject(VehiculosApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly maxLineas = MAX_LINEAS;
  protected readonly vehiculos = signal<Vehiculo[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly enviando = signal(false);
  /** Error general (409, 404 o error de red): se muestra arriba y el formulario conserva las lineas. */
  protected readonly error = signal<string | null>(null);
  protected readonly erroresSueltos = signal<string[]>([]);

  protected readonly form = this.fb.group({
    vehiculoId: this.fb.control<number | null>(null, [Validators.required]),
    kilometraje: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    detalles: this.fb.array<LineaForm>([], [Validators.minLength(1), Validators.maxLength(MAX_LINEAS), sinServiciosRepetidos]),
  });

  protected get lineas(): FormArray<LineaForm> {
    return this.form.controls.detalles;
  }

  /** Valores del formulario como signal: cada cambio recalcula subtotales y total al instante. */
  private readonly valores = toSignal(
    this.form.valueChanges.pipe(
      startWith(null),
      map(() => this.form.getRawValue()),
    ),
    { requireSync: true },
  );

  protected readonly serviciosActivos = computed(() => this.servicios().filter((s) => s.activo));
  private readonly catalogo = computed(() => new Map(this.servicios().map((s) => [s.id, s])));

  protected readonly resumenLineas = computed(() =>
    this.valores().detalles.map((d) => {
      const servicio = d.servicioId !== null ? this.catalogo().get(d.servicioId) : undefined;
      const cantidad = Number(d.cantidad) || 0;
      return { precio: servicio?.precio ?? null, subtotal: servicio ? redondear(servicio.precio * cantidad) : 0 };
    }),
  );

  protected readonly total = computed(() => redondear(this.resumenLineas().reduce((suma, l) => suma + l.subtotal, 0)));

  ngOnInit(): void {
    this.agregarLinea();
    forkJoin({ vehiculos: this.vehiculosApi.listar(), servicios: this.serviciosApi.listar() }).subscribe({
      next: ({ vehiculos, servicios }) => {
        this.vehiculos.set(vehiculos);
        this.servicios.set(servicios);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(aApiError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }

  protected agregarLinea(): void {
    if (this.lineas.length >= MAX_LINEAS) return;
    this.lineas.push(
      this.fb.group({
        servicioId: this.fb.control<number | null>(null, [Validators.required]),
        cantidad: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(5)]),
      }),
    );
  }

  protected quitarLinea(indice: number): void {
    this.lineas.removeAt(indice);
  }

  /** Para deshabilitar en la lista los servicios que ya se eligieron en otra linea. */
  protected usadoEnOtraLinea(servicioId: number, indice: number): boolean {
    return this.valores().detalles.some((d, i) => i !== indice && d.servicioId === servicioId);
  }

  protected registrar(): void {
    this.error.set(null);
    this.erroresSueltos.set([]);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const cuerpo: OrdenRequest = {
      vehiculoId: v.vehiculoId as number,
      kilometraje: v.kilometraje as number,
      detalles: v.detalles.map((d) => ({ servicioId: d.servicioId as number, cantidad: d.cantidad })),
    };

    this.enviando.set(true);
    this.ordenesApi.registrar(cuerpo).subscribe({
      next: (orden) => {
        this.notificaciones.exito(`Orden ${orden.numero} registrada correctamente`);
        void this.router.navigate(['/ordenes', orden.id]);
      },
      error: (e) => {
        const api = aApiError(e);
        // 409/404: se muestra el mensaje del backend y las lineas quedan intactas para corregirlas
        this.erroresSueltos.set(aplicarErroresServidor(this.form, api.campos));
        this.error.set(api.mensaje);
        this.enviando.set(false);
      },
    });
  }
}
