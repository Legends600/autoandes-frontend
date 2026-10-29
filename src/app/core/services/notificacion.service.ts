import { Injectable, signal } from '@angular/core';

export interface Notificacion {
  id: number;
  tipo: 'exito' | 'error';
  texto: string;
}

/** Avisos breves (toasts) para confirmar acciones exitosas. Los errores del backend se muestran en la pagina. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private siguienteId = 1;
  private readonly _avisos = signal<Notificacion[]>([]);
  readonly avisos = this._avisos.asReadonly();

  exito(texto: string): void {
    this.agregar('exito', texto);
  }

  error(texto: string): void {
    this.agregar('error', texto);
  }

  cerrar(id: number): void {
    this._avisos.update((lista) => lista.filter((a) => a.id !== id));
  }

  private agregar(tipo: Notificacion['tipo'], texto: string): void {
    const id = this.siguienteId++;
    this._avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.cerrar(id), 5000);
  }
}
