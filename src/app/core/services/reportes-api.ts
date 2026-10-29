import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IngresoPorServicio } from '../models/reporte';
import { aParametros } from '../util/parametros';

@Injectable({ providedIn: 'root' })
export class ReportesApi {
  private readonly http = inject(HttpClient);

  ingresosPorServicio(desde?: string, hasta?: string): Observable<IngresoPorServicio[]> {
    return this.http.get<IngresoPorServicio[]>(`${environment.apiUrl}/reportes/ingresos-por-servicio`, {
      params: aParametros({ desde, hasta }),
    });
  }
}
