export type RuttHanterare = () => void;

export interface Rutt {
  path: string;
  hanterare: RuttHanterare;
}

export interface Anvandare {
  id: string;
  anvandarNamn: string;
  fullstandigtNamn: string;
  ePost: string;
}

export interface AutentiseringsSvar {
  token: string;
  anvandare: Anvandare;
}

export type AutentiseringsTillstandAteranrop = (anvandare: Anvandare | null) => void;

export interface AppTillstand {
  anvandare: Anvandare | null;
  arAutentiserad: boolean;
}

export type Tillstandslyssnare = (tillstand: AppTillstand) => void;