// Generated by https://quicktype.io

export interface BankMovement {
    numero_comprobante: string;
    persona:            string;
    tipo:               string;
    cuenta_bancaria_id: string;
    tipo_registro:      string;
    detalles:           Detalle[];
    fecha_emision:      string;
    id:                 string;
}

export interface Detalle {
    monto:           string;
    cuenta_id:       null;
    centro_costo_id: null;
}