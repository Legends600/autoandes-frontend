import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Permiso } from '../../core/config/permisos';
import { Cliente } from '../../core/models/cliente';
import { Vehiculo } from '../../core/models/vehiculo';
import { ClientesApi } from '../../core/services/clientes-api';
import { NotificacionService } from '../../core/services/notificacion.service';
import { VehiculosApi } from '../../core/services/vehiculos-api';
import { aApiError } from '../../core/util/errores';
import { ConfirmarDialogo } from '../../shared/components/confirmar-dialogo';
import { SiPermiso } from '../../shared/directives/si-permiso';

@Component({
  selector: 'app-vehiculo-lista',
  imports: [RouterLink, SiPermiso, ConfirmarDialogo],
  templateUrl: './vehiculo-lista.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiculoLista implements OnInit {
  private readonly api = inject(VehiculosApi);
  private readonly clientesApi = inject(ClientesApi);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly Permiso = Permiso;
  protected readonly vehiculos = signal<Vehiculo[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly errorAccion = signal<string | null>(null);
  protected readonly busqueda = signal('');
  /** Filtro por cliente: se envia al backend como ?clienteId. */
  protected readonly clienteFiltro = signal<number | null>(null);
  protected readonly porEliminar = signal<Vehiculo | null>(null);

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.vehiculos();
    return this.vehiculos().filter((v) =>
      `${v.placa} ${v.marca} ${v.modelo} ${v.clienteNombre}`.toLowerCase().includes(texto),
    );
  });

  ngOnInit(): void {
    // La lista desplegable de clientes viene del backend
    this.clientesApi.listar().subscribe({
      next: (lista) => this.clientes.set(lista),
      error: (e) => this.errorAccion.set(aApiError(e).mensaje),
    });
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.api.listar(this.clienteFiltro()).subscribe({
      next: (lista) => {
        this.vehiculos.set(lista);
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

  protected alFiltrarCliente(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.clienteFiltro.set(valor ? Number(valor) : null);
    this.cargar();
  }

  protected pedirEliminar(vehiculo: Vehiculo): void {
    this.errorAccion.set(null);
    this.porEliminar.set(vehiculo);
  }

  protected confirmarEliminar(): void {
    const vehiculo = this.porEliminar();
    if (!vehiculo) return;
    this.porEliminar.set(null);
    this.api.eliminar(vehiculo.id).subscribe({
      next: () => {
        this.notificaciones.exito(`Vehículo ${vehiculo.placa} eliminado`);
        this.cargar();
      },
      // 409: el vehiculo tiene ordenes. El mensaje se muestra en la pagina y la lista sigue funcionando.
      error: (e) => this.errorAccion.set(aApiError(e).mensaje),
    });
  }
}
