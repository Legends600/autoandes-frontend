export type EstadoOrden = 'REGISTRADA' | 'ANULADA';

export interface OrdenResumen {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  placa: string;
  clienteNombre: string;
  kilometraje: number;
  estado: EstadoOrden;
  total: number;
  usuarioRegistro: string;
}

export interface DetalleOrden {
  id: number;
  servicioId: number;
  servicioCodigo: string;
  servicioNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Orden extends OrdenResumen {
  motivoAnulacion: string | null;
  detalles: DetalleOrden[];
}

/** Solo viajan servicioId y cantidad: el precio, el subtotal y el total los calcula el backend. */
export interface DetalleOrdenRequest {
  servicioId: number;
  cantidad: number;
}

export interface OrdenRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: DetalleOrdenRequest[];
}

export interface FiltrosOrden {
  placa?: string;
  estado?: EstadoOrden | '';
  desde?: string;
  hasta?: string;
}
