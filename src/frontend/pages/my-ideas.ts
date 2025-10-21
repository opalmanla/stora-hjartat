import { api } from '../api.js';
import { renderaNavigation, fastaNavigationslyssnare, renderaIdeKort } from '../components.js';
import { navigeraTill } from '../router.js';
import { tillstandsHanterare } from '../state.js';

export async function renderaMinaIderSida() {
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
        <h2>Mina Ideella Idéer</h2>
        <button id="create-idea-btn" class="btn btn-primary">Skapa en ny idé</button>
      </div>
      <div id="ideas-container">
        <div class="loading">Laddar...</div>
      </div>
    </div>
  `;
  fastaNavigationslyssnare();
  await laddaAnvandarIder();
  fastaHandelseLyssnare();
}

async function laddaAnvandarIder() {
  const { anvandare } = tillstandsHanterare.hamtaTillstand();
  if (!anvandare) return;
  const container = document.getElementById('ideas-container')!;
  try {
    const ider = await api.hamtaAnvandarIder(anvandare.id);
    
    if (ider.length === 0) {
      container.innerHTML = '<p class="no-results">Du har inga idéer ännu</p>';
      return;
    }
    container.innerHTML = ider.map((ide: any) => renderaIdeKort(ide, true)).join('');
    fastaIdeLyssnare();
  } catch (error) {
    container.innerHTML = '<p class="error">Kunde inte ladda dina idéer</p>';
  }
}

function fastaHandelseLyssnare() {
  const createBtn = document.getElementById('create-idea-btn');
  createBtn?.addEventListener('click', () => {
    navigeraTill('/ideas/create');
  });
}

function fastaIdeLyssnare() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id) navigeraTill(`/ideas/${id}`);
    });
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id) navigeraTill(`/ideas/edit/${id}`);
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id && confirm('Är du säker på att du vill ta bort denna idé?')) {
        try {
          await api.taBortIde(id);
          await laddaAnvandarIder();
        } catch (error) {
          alert('Kunde inte ta bort idén');
        }
      }
    });
  });
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        try {
          await api.vaxlaFavorit(id);
          await laddaAnvandarIder();
        } catch (error) {
          alert('Kunde inte uppdatera favorit');
        }
      }
    });
  });
}