export interface Seat {
    fecha:              string;
    glosa:              string;
    gasto_no_deducible: number;
    prefijo:            string;
    detalles:           Detalle[];
}

export interface Detalle {
    cuenta_id:       string;
    valor:           number;
    tipo:            string;
    centro_costo_id: string;
}


export interface SeatResponse {
    detalles: Detalle[];
    glosa:    string;
    fecha:    string;
    id:       string;
}