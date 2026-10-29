import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cliente } from '../../core/models/cliente';
import { ClientesApi } from '../../core/services/clientes-api';
import { NotificacionService } from '../../core/services/notificacion.service';
import { VehiculosApi } from '../../core/services/vehiculos-api';
import { aApiError } from '../../core/util/errores';
import { CampoError } from '../../shared/components/campo-error';
import { aplicarErroresServidor } from '../../shared/forms/errores-servidor';

/** Un solo formulario para registrar (/vehiculos/nuevo) y editar (/vehiculos/:id/editar). */
@Component({
  selector: 'app-vehiculo-form',
  imports: [ReactiveFormsModule, RouterLink, CampoError],
  templateUrl: './vehiculo-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiculoForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(VehiculosApi);
  private readonly clientesApi = inject(ClientesApi);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  readonly id = input<string>();
  protected readonly esEdicion = computed(() => !!this.id());

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  // Mismas reglas que el backend: placa ABC-123, anio entre 1990 y 2027, cliente obligatorio
  protected readonly form = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: this.fb.control<number | null>(null, [Validators.required, Validators.min(1990), Validators.max(2027)]),
    clienteId: this.fb.control<number | null>(null, [Validators.required]),
  });

  ngOnInit(): void {
    this.clientesApi.listar().subscribe({
      next: (lista) => {
        this.clientes.set(lista);
        this.cargarVehiculo();
      },
      error: (e) => {
        this.error.set(aApiError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }

  private cargarVehiculo(): void {
    const id = this.id();
    if (!id) {
      this.cargando.set(false);
      return;
    }
    this.api.obtener(Number(id)).subscribe({
      next: (v) => {
        this.form.patchValue({ placa: v.placa, marca: v.marca, modelo: v.modelo, anio: v.anio, clienteId: v.clienteId });
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(aApiError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }

  /** La placa se escribe siempre en mayusculas, como exige el formato ABC-123. */
  protected placaEnMayusculas(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.form.controls.placa.setValue(campo.value.toUpperCase());
  }

  protected guardar(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo = {
      placa: v.placa.trim(),
      marca: v.marca.trim(),
      modelo: v.modelo.trim(),
      anio: v.anio as number,
      clienteId: v.clienteId as number,
    };
    this.guardando.set(true);
    const id = this.id();
    const peticion = id ? this.api.actualizar(Number(id), cuerpo) : this.api.crear(cuerpo);
    peticion.subscribe({
      next: (guardado) => {
        this.notificaciones.exito(id ? `Vehículo ${guardado.placa} actualizado` : `Vehículo ${guardado.placa} registrado`);
        void this.router.navigate(['/vehiculos']);
      },
      error: (e) => {
        const api = aApiError(e);
        // 409 (placa repetida) y 404 (cliente inexistente) se muestran tal como los devuelve el backend
        const sueltos = aplicarErroresServidor(this.form, api.campos);
        this.error.set(api.campos ? (sueltos.join(' · ') || api.mensaje) : api.mensaje);
        this.guardando.set(false);
      },
    });
  }
}
