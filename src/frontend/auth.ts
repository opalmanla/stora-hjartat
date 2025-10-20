import type { Anvandare, AutentiseringsSvar, AutentiseringsTillstandAteranrop } from './types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function sparaAutentisering(autentiseringsSvar: AutentiseringsSvar): void {
  localStorage.setItem(TOKEN_KEY, autentiseringsSvar.token);
  localStorage.setItem(USER_KEY, JSON.stringify(autentiseringsSvar.anvandare));
}

function rensaAutentisering(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function hamtaToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function hamtaAnvandare(): Anvandare | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function arAutentiserad(): boolean {
  return !!hamtaToken();
}

export async function registrera(anvandarNamn: string, losenord: string, fullstandigtNamn: string, ePost: string): Promise<Anvandare> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({anvandarNamn, losenord, fullstandigtNamn, ePost}),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  const autentiseringsSvar: AutentiseringsSvar = await response.json();
  sparaAutentisering(autentiseringsSvar);
  return autentiseringsSvar.anvandare;
}

export async function loggaIn(anvandarNamn: string, losenord: string): Promise<Anvandare> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anvandarNamn, losenord }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  const autentiseringsSvar: AutentiseringsSvar = await response.json();
  sparaAutentisering(autentiseringsSvar);
  return autentiseringsSvar.anvandare;
}

export async function loggaUt(): Promise<void> {
  rensaAutentisering();
}

export async function hamtaNuvarandeAnvandare(): Promise<Anvandare> {
  const token = hamtaToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    rensaAutentisering();
    throw new Error('Session expired');
  }
  return await response.json();
}

let autentiseringsAteranrop: AutentiseringsTillstandAteranrop[] = [];

export function paAutentiseringsAndring(ateranrop: AutentiseringsTillstandAteranrop): () => void {
  autentiseringsAteranrop.push(ateranrop);
  ateranrop(hamtaAnvandare());
  return () => {
    autentiseringsAteranrop = autentiseringsAteranrop.filter(cb => cb !== ateranrop);
  };
}

export function meddelaAutentiseringsAndring(): void {
  const anvandare = hamtaAnvandare();
  autentiseringsAteranrop.forEach(ateranrop => ateranrop(anvandare));
}