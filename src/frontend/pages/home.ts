import { api } from '../api.js';
import { renderaNavigation, fastaNavigationslyssnare, renderaIdeKort } from '../components.js';
import { navigeraTill } from '../router.js';

export async function renderaHemSida() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    ${renderaNavigation()}
    <div class="container">
      <div class="hero">
        <h2>Dela dina ideella idéer</h2>
        <p>Upptack och dela idéer som gör skillnad i samhället</p>
      </div>
      <div class="search-box">
        <input type="text" id="search-input" placeholder="Sök efter idéer..." />
        <button id="search-btn" class="btn btn-primary">Sök</button>
      </div>
      <div id="ideas-container">
        <div class="loading">Laddar...</div>
      </div>
    </div>
  `;
  fastaNavigationslyssnare();
  await laddaIder();
  fastaHandelseLyssnare();
}

async function laddaIder(search?: string) {
  const container = document.getElementById('ideas-container')!;
  try {
    const ider = await api.hamtaIder(search);
    if (ider.length === 0) {
      container.innerHTML = '<p class="no-results">Inga ider hittades</p>';
      return;
    }
    container.innerHTML = ider.map((ide: any) => renderaIdeKort(ide)).join('');
    fastaIdeLyssnare();
  } catch (error) {
    console.error('Error loading ideas:', error);
    container.innerHTML = `<p class="error">Kunde inte ladda ider: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
  }
}

function fastaHandelseLyssnare() {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchBtn = document.getElementById('search-btn');
  const utforSokning = () => {
    const query = searchInput.value.trim();
    laddaIder(query || undefined);
  };
  searchBtn?.addEventListener('click', utforSokning);
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') utforSokning();
  });
}

function fastaIdeLyssnare() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id) navigeraTill(`/ideas/${id}`);
    });
  });
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        try {
          await api.vaxlaFavorit(id);
          await laddaIder();
        } catch (error) {
          alert('Kunde inte uppdatera favorit');
        }
      }
    });
  });
}