import type { Rutt, RuttHanterare } from './types.js';

class Ruttare {
  private rutter: Rutt[] = [];
  private nuvarandeSokvag: string = '/';
  constructor() {
    window.addEventListener('popstate', () => {
      this.hanteraRutt(window.location.pathname);
    });
  }
  public rutt(path: string, hanterare: RuttHanterare) {
    this.rutter.push({ path, hanterare });
  }
  public navigera(path: string) {
    window.history.pushState({}, '', path);
    this.hanteraRutt(path);
  }
  private hanteraRutt(path: string) {
    this.nuvarandeSokvag = path;
    const exaktRutt = this.rutter.find(rutt => rutt.path === path);
    if (exaktRutt) {
      exaktRutt.hanterare();
      return;
    }
    for (const rutt of this.rutter) {
      const params = this.matchaRutt(rutt.path, path);
      if (params !== null) {
        rutt.hanterare();
        return;
      }
    }
    const hemRutt = this.rutter.find(rutt => rutt.path === '/');
    if (hemRutt) {
      hemRutt.hanterare();
    }
  }
  private matchaRutt(ruttSokvag: string, urlSokvag: string): Record<string, string> | null {
    const ruttDelar = ruttSokvag.split('/').filter(Boolean);
    const urlDelar = urlSokvag.split('/').filter(Boolean);
    if (ruttDelar.length !== urlDelar.length) {
      return null;
    }
    const params: Record<string, string> = {};
    for (let i = 0; i < ruttDelar.length; i++) {
      if (ruttDelar[i].startsWith(':')) {
        const paramNamn = ruttDelar[i].slice(1);
        params[paramNamn] = urlDelar[i];
      } else if (ruttDelar[i] !== urlDelar[i]) {
        return null;
      }
    }
    return params;
  }
  public hamtaParam(paramNamn: string): string | null {
    const nuvarandeRutt = this.rutter.find(rutt => {
      const params = this.matchaRutt(rutt.path, this.nuvarandeSokvag);
      return params !== null && paramNamn in params;
    });
    if (!nuvarandeRutt) return null;
    const params = this.matchaRutt(nuvarandeRutt.path, this.nuvarandeSokvag);
    return params ? params[paramNamn] : null;
  }
  public starta() {
    this.hanteraRutt(window.location.pathname);
  }
  public hamtaNuvarandeSokvag(): string {
    return this.nuvarandeSokvag;
  }
}

export const ruttare = new Ruttare();

export function navigeraTill(path: string) {
  ruttare.navigera(path);
}