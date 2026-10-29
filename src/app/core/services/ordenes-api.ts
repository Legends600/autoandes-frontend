import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltrosOrden, Orden, OrdenRequest, OrdenResumen } from '../models/orden';
import { aParametros } from '../util/parametros';

@Injectable({ providedIn: 'root' })
export class OrdenesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ordenes`;

  /** Los filtros del contrato viajan como parametros de consulta: placa, estado, desde y hasta. */
  listar(filtros: FiltrosOrden = {}): Observable<OrdenResumen[]> {
    return this.http.get<OrdenResumen[]>(this.base, { params: aParametros({ ...filtros }) });
  }

  obtener(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${this.base}/${id}`);
  }

  registrar(orden: OrdenRequest): Observable<Orden> {
    return this.http.post<Orden>(this.base, orden);
  }

  anular(id: number, motivo: string): Observable<Orden> {
    return this.http.patch<Orden>(`${this.base}/${id}/anular`, { motivo });
  }
}
