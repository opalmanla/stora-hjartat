import { hamtaToken } from './auth.js';

const API_URL = '/api';

async function hamtaMedAutentisering(url: string, options: RequestInit = {}) {
  const token = hamtaToken();
  const headers: Record<string, string> = {'Content-Type': 'application/json', ...(options.headers as Record<string, string>)};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${url}`, {...options, headers});
  if (!response.ok) {
    const error = await response.json().catch(() => ({error: 'Något har blivit fel'}));
    throw new Error(error.error);
  }
  return response.json();
}

export const api = {
  hamtaIder: (search?: string) => {
    const url = search ? `/ideas?search=${encodeURIComponent(search)}` : '/ideas';
    return hamtaMedAutentisering(url);
  },
  hamtaIde: (id: string) => hamtaMedAutentisering(`/ideas/${id}`),
  hamtaAnvandarIder: (userId: string) => hamtaMedAutentisering(`/users/${userId}/ideas`),
  hamtaFavoritIder: (userId: string) => hamtaMedAutentisering(`/users/${userId}/favorites`),
  skapaIde: (data: { titel: string; beskrivning: string }) => hamtaMedAutentisering('/ideas', {method: 'POST', body: JSON.stringify(data)}),
  uppdateraIde: (id: string, data: { titel?: string; beskrivning?: string }) => hamtaMedAutentisering(`/ideas/${id}`, {method: 'PUT', body: JSON.stringify(data)}),
  taBortIde: (id: string) => hamtaMedAutentisering(`/ideas/${id}`, {method: 'DELETE'}),
  laggTillKommentar: (ideaId: string, text: string) => hamtaMedAutentisering(`/ideas/${ideaId}/comments`, {method: 'POST', body: JSON.stringify({ text })}),
  vaxlaFavorit: (ideaId: string) => hamtaMedAutentisering(`/ideas/${ideaId}/favorite`, {method: 'POST'}),
};