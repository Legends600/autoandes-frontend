import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IngresoPorServicio } from '../../core/models/reporte';
import { ReportesApi } from '../../core/services/reportes-api';
import { aApiError } from '../../core/util/errores';

@Component({
  selector: 'app-reporte-ingresos',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './reporte-ingresos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteIngresos implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ReportesApi);

  protected readonly filas = signal<IngresoPorServicio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filtros = this.fb.group({ desde: [''], hasta: [''] });

  /** Solo para mostrar la suma y las barras: la agregacion real la hace la base de datos. */
  protected readonly totalGeneral = computed(() => this.filas().reduce((suma, f) => suma + f.importeTotal, 0));
  protected readonly mayorImporte = computed(() => Math.max(1, ...this.filas().map((f) => f.importeTotal)));

  ngOnInit(): void {
    this.consultar();
  }

  protected consultar(): void {
    this.cargando.set(true);
    this.error.set(null);
    const { desde, hasta } = this.filtros.getRawValue();
    this.api.ingresosPorServicio(desde, hasta).subscribe({
      next: (filas) => {
        this.filas.set(filas);
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
    this.consultar();
  }
}
