import { ObjectId } from 'mongodb';
import { type Request } from 'express';

export interface Anvandare {
  _id?: ObjectId;
  anvandarNamn: string;
  losenord: string;
  fullstandigtNamn: string;
  ePost: string;
  skapadVid: Date;
}

export interface RegistreraTyp {
  anvandarNamn: string;
  losenord: string;
  fullstandigtNamn: string;
  ePost: string;
}

export interface InloggningTyp {
  anvandarNamn: string;
  losenord: string;
}

export interface AutentiseringsSvar {
  token: string;
  anvandare: {
    id: string;
    anvandarNamn: string;
    fullstandigtNamn: string;
    ePost: string;
  };
}

export interface AutentiseringsForfragan extends Request {
  anvandare?: {
    id: string;
    anvandarNamn: string;
  };
}