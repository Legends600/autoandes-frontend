import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Permiso } from '../../core/config/permisos';
import { Servicio } from '../../core/models/servicio';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ServiciosApi } from '../../core/services/servicios-api';
import { aApiError } from '../../core/util/errores';
import { ConfirmarDialogo } from '../../shared/components/confirmar-dialogo';
import { SiPermiso } from '../../shared/directives/si-permiso';

type Accion = { tipo: 'baja' | 'eliminar'; servicio: Servicio };

@Component({
  selector: 'app-servicio-lista',
  imports: [RouterLink, DecimalPipe, SiPermiso, ConfirmarDialogo],
  templateUrl: './servicio-lista.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicioLista implements OnInit {
  private readonly api = inject(ServiciosApi);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly Permiso = Permiso;
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly cargando = signal(true);
  /** Error al cargar la lista. */
  protected readonly errorCarga = signal<string | null>(null);
  /** Error de una accion (baja, eliminar, reactivar): se muestra en la pagina y la lista sigue usable. */
  protected readonly errorAccion = signal<string | null>(null);
  protected readonly busqueda = signal('');
  protected readonly pendiente = signal<Accion | null>(null);

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.servicios();
    return this.servicios().filter((s) => `${s.codigo} ${s.nombre}`.toLowerCase().includes(texto));
  });

  protected readonly mensajeConfirmacion = computed(() => {
    const accion = this.pendiente();
    if (!accion) return '';
    return accion.tipo === 'baja'
      ? `¿Dar de baja el servicio ${accion.servicio.codigo} (${accion.servicio.nombre})? Ya no podrá incluirse en nuevas órdenes.`
      : `¿Eliminar definitivamente el servicio ${accion.servicio.codigo} (${accion.servicio.nombre})?`;
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.api.listar().subscribe({
      next: (lista) => {
        this.servicios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.errorCarga.set(aApiError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }

  protected alBuscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  protected pedir(tipo: Accion['tipo'], servicio: Servicio): void {
    this.errorAccion.set(null);
    this.pendiente.set({ tipo, servicio });
  }

  protected cancelar(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const accion = this.pendiente();
    if (!accion) return;
    this.pendiente.set(null);
    const { tipo, servicio } = accion;
    if (tipo === 'baja') {
      this.api.cambiarEstado(servicio.id, false).subscribe({
        next: () => this.exito(`Servicio ${servicio.codigo} dado de baja`),
        error: (e) => this.errorAccion.set(aApiError(e).mensaje),
      });
    } else {
      this.api.eliminar(servicio.id).subscribe({
        next: () => this.exito(`Servicio ${servicio.codigo} eliminado`),
        error: (e) => this.errorAccion.set(aApiError(e).mensaje),
      });
    }
  }

  protected reactivar(servicio: Servicio): void {
    this.errorAccion.set(null);
    this.api.cambiarEstado(servicio.id, true).subscribe({
      next: () => this.exito(`Servicio ${servicio.codigo} reactivado`),
      error: (e) => this.errorAccion.set(aApiError(e).mensaje),
    });
  }

  private exito(mensaje: string): void {
    this.notificaciones.exito(mensaje);
    this.cargar();
  }
}
