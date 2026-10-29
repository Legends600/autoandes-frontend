import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehiculo, VehiculoRequest } from '../models/vehiculo';
import { aParametros } from '../util/parametros';

@Injectable({ providedIn: 'root' })
export class VehiculosApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/vehiculos`;

  listar(clienteId?: number | null): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.base, { params: aParametros({ clienteId }) });
  }

  obtener(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.base}/${id}`);
  }

  crear(vehiculo: VehiculoRequest): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.base, vehiculo);
  }

  actualizar(id: number, vehiculo: VehiculoRequest): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.base}/${id}`, vehiculo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
