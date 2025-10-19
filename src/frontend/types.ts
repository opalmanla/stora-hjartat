export type RuttHanterare = () => void;

export interface Rutt {
  path: string;
  hanterare: RuttHanterare;
}