import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente } from '../models/cliente';

@Injectable({ providedIn: 'root' })
export class ClientesApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${environment.apiUrl}/clientes`);
  }
}
