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

export interface IdeKommentar {
  id: string;
  anvandarId: string;
  anvandarNamn: string;
  text: string;
  skapadVid: Date;
}

export interface Ide {
  _id?: ObjectId;
  titel: string;
  beskrivning: string;
  anvandarId: string;
  anvandarNamn: string;
  skapadVid: Date;
  uppdateradVid: Date;
  kommentarer: IdeKommentar[];
  favoriseradAv: string[]
}

export interface SkapaIdeTyp {
  titel: string;
  beskrivning: string;
}

export interface UppdateraIdeTyp {
  titel?: string;
  beskrivning?: string;
}

export interface LaggTillKommentarTyp {
  text: string;
}

export interface RegistreraTyp {
  anvandarNamn: string;
  losenord: string;
  fullstandigtNamn: string;
  ePost: string;
}