export interface auth_session {
    username?: string,
    password?:string
};

export interface User {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
}

export interface plate {
  plate: string |  string
}

export interface amount {
  coberturas:{
    danosCosas:number,
    danosPersonas: number,
  },
  order_id:number,
  primaTotal:{
    bs:number,
    dolar:number
  }
}

export interface data_person {
  anio:number,
  brand_model:string,
  name:string,
  plate:string,
  type_car:string,
  type_plate:string
}