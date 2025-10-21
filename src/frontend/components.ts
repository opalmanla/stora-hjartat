import { navigeraTill } from './router.js';
import { tillstandsHanterare } from './state.js';
import { loggaUt, meddelaAutentiseringsAndring } from './auth.js';
import type { Ide } from './types.js';

export function renderaNavigation(): string {
  const { arAutentiserad, anvandare } = tillstandsHanterare.hamtaTillstand();
  return `
    <nav class="navbar">
      <div class="nav-brand">
        <h1>💚 Stora Hjärtat</h1>
      </div>
      <div class="nav-links">
        <a href="/" data-link>Hem</a>
        ${arAutentiserad ? `
          <a href="/my-ideas" data-link>Mina déer</a>
          <a href="/favorites" data-link>Favoriter</a>
          <span class="user-info">${anvandare?.anvandarNamn || ''}</span>
          <button id="signout-btn" class="btn btn-secondary">Logga ut</button>
        ` : `
          <a href="/login" data-link>Logga in</a>
        `}
      </div>
    </nav>
  `;
}

export function fastaNavigationslyssnare() {
  document.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = (e.target as HTMLAnchorElement).getAttribute('href');
      if (href) navigeraTill(href);
    });
  });
  const signOutBtn = document.getElementById('signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      await loggaUt();
      meddelaAutentiseringsAndring();
      navigeraTill('/');
    });
  }
}

export function visaFel(meddelande: string): string {
  return `<div class="error">${meddelande}</div>`;
}

export function formateraDatum(datum: Date | string | undefined): string {
  if (!datum) return 'Okänt datum';
  const d = typeof datum === 'string' ? new Date(datum) : datum;
  if (isNaN(d.getTime())) return 'Ogiltigt datum';
  return d.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function renderaIdeKort(ide: Ide, visaAtgarder: boolean = false): string {
  const { anvandare } = tillstandsHanterare.hamtaTillstand();
  const ideId = typeof ide._id === 'string' ? ide._id : (ide._id as any)?.$oid || '';
  const arFavoriserad = anvandare && ide.favoriseradAv?.includes(anvandare.id);
  const arAgare = anvandare && ide.anvandarId === anvandare.id;
  return `
    <div class="idea-card" data-id="${ideId}">
      <h3>${ide.titel}</h3>
      <p class="idea-description">${ide.beskrivning}</p>
      <div class="idea-meta">
        <span class="author">Av: ${ide.anvandarNamn}</span>
        <span class="date">${formateraDatum(ide.skapadVid)}</span>
      </div>
      <div class="idea-stats">
        <span>💬 ${ide.kommentarer?.length || 0} kommentarer</span>
        <span>⭐ ${ide.favoriseradAv?.length || 0} favoriter</span>
      </div>
      ${anvandare ? `
        <div class="idea-actions">
          ${!arAgare ? `
            <button class="btn btn-icon favorite-btn ${arFavoriserad ? 'active' : ''}" data-id="${ideId}">
              ${arFavoriserad ? '⭐' : '☆'} Favorit
            </button>
          ` : ''}
          ${arAgare && visaAtgarder ? `
            <button class="btn btn-secondary edit-btn" data-id="${ideId}">✏️ Redigera</button>
            <button class="btn btn-danger delete-btn" data-id="${ideId}">🗑️ Ta bort</button>
          ` : ''}
          <button class="btn btn-primary view-btn" data-id="${ideId}">👁️ Visa</button>
        </div>
      ` : ''}
    </div>
  `;
}