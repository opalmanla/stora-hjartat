import type { AppTillstand, Tillstandslyssnare } from './types';

class TillstandsHanterare {
  private tillstand: AppTillstand = {
    anvandare: null,
    arAutentiserad: false,
  };
  private lyssnare: Tillstandslyssnare[] = [];
  public hamtaTillstand(): AppTillstand {
    return { ...this.tillstand };
  }
  public sattTillstand(uppdateringar: Partial<AppTillstand>) {
    this.tillstand = { ...this.tillstand, ...uppdateringar };
    this.meddelaLyssnare();
  }
  public prenumerera(lyssnare: Tillstandslyssnare) {
    this.lyssnare.push(lyssnare);
    return () => {
      this.lyssnare = this.lyssnare.filter(l => l !== lyssnare);
    };
  }
  private meddelaLyssnare() {
    this.lyssnare.forEach(lyssnare => lyssnare(this.hamtaTillstand()));
  }
}

export const tillstandsHanterare = new TillstandsHanterare();