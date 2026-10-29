import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servicio, ServicioRequest } from '../models/servicio';

@Injectable({ providedIn: 'root' })
export class ServiciosApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/servicios`;

  listar(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.base);
  }

  obtener(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.base}/${id}`);
  }

  crear(servicio: ServicioRequest): Observable<Servicio> {
    return this.http.post<Servicio>(this.base, servicio);
  }

  actualizar(id: number, servicio: ServicioRequest): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.base}/${id}`, servicio);
  }

  cambiarEstado(id: number, activo: boolean): Observable<Servicio> {
    return this.http.patch<Servicio>(`${this.base}/${id}/estado`, { activo });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
