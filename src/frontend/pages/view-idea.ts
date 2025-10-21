import { api } from '../api.js';
import { renderaNavigation, fastaNavigationslyssnare, formateraDatum } from '../components.js';
import { ruttare } from '../router.js';
import { tillstandsHanterare } from '../state.js';

export async function renderaVisaIdeSida() {
  const ideId = ruttare.hamtaParam('id');
  if (!ideId) {
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML = `
    ${renderaNavigation()}
    <div class="container">
      <div id="idea-container">
        <div class="loading">Laddar...</div>
      </div>
    </div>
  `;
  fastaNavigationslyssnare();
  await laddaIde(ideId);
}

async function laddaIde(ideId: string) {
  const container = document.getElementById('idea-container')!;
  const { anvandare } = tillstandsHanterare.hamtaTillstand();
  try {
    const ide = await api.hamtaIde(ideId);
    const arFavoriserad = anvandare && ide.favoriseradAv?.includes(anvandare.id);
    const arAgare = anvandare && ide.anvandarId === anvandare.id;
    container.innerHTML = `
      <div class="idea-detail">
        <h2>${ide.titel}</h2>
        <div class="idea-meta">
          <span class="author">Av: ${ide.anvandarNamn}</span>
          <span class="date">${formateraDatum(ide.skapadVid)}</span>
        </div>
        <div class="idea-description-full">
          ${ide.beskrivning}
        </div>
        <div class="idea-stats">
          <span>💬 ${ide.kommentarer?.length || 0} kommentarer</span>
          <span>⭐ ${ide.favoriseradAv?.length || 0} favoriter</span>
        </div>
        ${anvandare && !arAgare ? `
          <button class="btn btn-icon favorite-btn ${arFavoriserad ? 'active' : ''}" id="favorite-btn">
            ${arFavoriserad ? '⭐' : '☆'} ${arFavoriserad ? 'Ta bort favorit' : 'Lagg till favorit'}
          </button>
        ` : ''}
      </div>
      <div class="comments-section">
        <h3>Kommentarer</h3>
        ${anvandare ? `
          <form id="comment-form" class="comment-form">
            <textarea id="comment-text" placeholder="Skriv en kommentar..." rows="3" required></textarea>
            <button type="submit" class="btn btn-primary">Kommentera</button>
          </form>
        ` : '<p class="info">Logga in för att kommentera</p>'}
        <div id="comments-list">
          ${renderaKommentarer(ide.kommentarer || [])}
        </div>
      </div>
    `;
    fastaIdeLyssnare(ideId);
  } catch (error) {
    container.innerHTML = '<p class="error">Kunde inte ladda idén</p>';
  }
}

function renderaKommentarer(kommentarer: any[]): string {
  if (kommentarer.length === 0) {
    return '<p class="no-results">Inga kommentarer ännu</p>';
  }
  return kommentarer.map(kommentar => `
    <div class="comment">
      <div class="comment-header">
        <strong>${kommentar.anvandarNamn}</strong>
        <span class="comment-date">${formateraDatum(kommentar.skapadVid)}</span>
      </div>
      <p>${kommentar.text}</p>
    </div>
  `).join('');
}

function fastaIdeLyssnare(ideId: string) {
  const favoriteBtn = document.getElementById('favorite-btn');
  const commentForm = document.getElementById('comment-form') as HTMLFormElement;
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', async () => {
      try {
        await api.vaxlaFavorit(ideId);
        await laddaIde(ideId);
      } catch (error) {
        alert('Kunde inte uppdatera favorit');
      }
    });
  }
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const textArea = document.getElementById('comment-text') as HTMLTextAreaElement;
      const text = textArea.value.trim();
      if (!text) return;
      try {
        await api.laggTillKommentar(ideId, text);
        textArea.value = '';
        await laddaIde(ideId);
      } catch (error) {
        alert('Kunde inte lägga till kommentar');
      }
    });
  }
}