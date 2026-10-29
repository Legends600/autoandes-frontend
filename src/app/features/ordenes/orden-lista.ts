import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Permiso } from '../../core/config/permisos';
import { FiltrosOrden, OrdenResumen } from '../../core/models/orden';
import { OrdenesApi } from '../../core/services/ordenes-api';
import { aApiError } from '../../core/util/errores';
import { SiPermiso } from '../../shared/directives/si-permiso';

@Component({
  selector: 'app-orden-lista',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, CurrencyPipe, SiPermiso],
  templateUrl: './orden-lista.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdenLista implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(OrdenesApi);

  protected readonly Permiso = Permiso;
  protected readonly ordenes = signal<OrdenResumen[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filtros = this.fb.group({
    placa: [''],
    estado: [''],
    desde: [''],
    hasta: [''],
  });

  ngOnInit(): void {
    this.buscar();
  }

  /** Los filtros se envian al backend como parametros: placa, estado, desde y hasta. */
  protected buscar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.api.listar(this.filtros.getRawValue() as FiltrosOrden).subscribe({
      next: (lista) => {
        this.ordenes.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(aApiError(e).mensaje);
        this.cargando.set(false);
      },
    });
  }

  protected limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }
}
