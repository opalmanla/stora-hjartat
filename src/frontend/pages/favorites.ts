import { api } from '../api.js';
import { renderaNavigation, fastaNavigationslyssnare, renderaIdeKort } from '../components.js';
import { navigeraTill } from '../router.js';
import { tillstandsHanterare } from '../state.js';

export async function renderaFavoriterSida() {
  const { anvandare, arAutentiserad } = tillstandsHanterare.hamtaTillstand();
  if (!arAutentiserad || !anvandare) {
    navigeraTill('/login');
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML = `
    ${renderaNavigation()}
    <div class="container">
      <div class="page-header">
        <h2>Mina Favoriter</h2>
      </div>
      <div id="ideas-container">
        <div class="loading">Laddar...</div>
      </div>
    </div>
  `;
  fastaNavigationslyssnare();
  await laddaFavoriter();
  fastaIdeLyssnare();
}

async function laddaFavoriter() {
  const { anvandare } = tillstandsHanterare.hamtaTillstand();
  if (!anvandare) return;
  const container = document.getElementById('ideas-container')!;
  try {
    const ider = await api.hamtaFavoritIder(anvandare.id);
    if (ider.length === 0) {
      container.innerHTML = '<p class="no-results">Du har inga favoriter ännu</p>';
      return;
    }
    container.innerHTML = ider.map((ide: any) => renderaIdeKort(ide)).join('');
    fastaIdeLyssnare();
  } catch (error) {
    container.innerHTML = '<p class="error">Kunde inte ladda dina favoriter</p>';
  }
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
          await laddaFavoriter();
        } catch (error) {
          alert('Kunde inte uppdatera favorit');
        }
      }
    });
  });
}