import { api } from '../api.js';
import { renderaNavigation, fastaNavigationslyssnare } from '../components.js';
import { navigeraTill, ruttare } from '../router.js';
import { tillstandsHanterare } from '../state.js';

export async function renderaRedigeraIdeSida() {
  const { arAutentiserad } = tillstandsHanterare.hamtaTillstand();
  if (!arAutentiserad) {
    navigeraTill('/login');
    return;
  }
  const ideId = ruttare.hamtaParam('id');
  if (!ideId) {
    navigeraTill('/my-ideas');
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML = `
    ${renderaNavigation()}
    <div class="container">
      <div class="page-header">
        <h2>Redigera idé</h2>
      </div>
      <div id="form-container">
        <div class="loading">Laddar...</div>
      </div>
    </div>
  `;
  fastaNavigationslyssnare();
  await laddaOchRenderaFormular(ideId);
}

async function laddaOchRenderaFormular(ideId: string) {
  const container = document.getElementById('form-container')!;
  try {
    const ide = await api.hamtaIde(ideId);
    const { anvandare } = tillstandsHanterare.hamtaTillstand();
    if (ide.anvandarId !== anvandare?.id) {
      container.innerHTML = '<p class="error">Du har inte behörighet att redigera denna idé</p>';
      return;
    }
    container.innerHTML = `
      <form id="idea-form" class="idea-form">
        <div class="form-group">
          <label for="title">Titel *</label>
          <input type="text" id="title" value="${ide.titel}" required maxlength="100" />
        </div>
        <div class="form-group">
          <label for="description">Beskrivning *</label>
          <textarea id="description" rows="6" required maxlength="1000">${ide.beskrivning}</textarea>
        </div>
        <div id="error-message" class="error" style="display: none;"></div>
        <div class="button-group">
          <button type="submit" class="btn btn-primary">Spara andringar</button>
          <button type="button" id="cancel-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </form>
    `;
    fastaFormularLyssnare(ideId);
  } catch (error) {
    container.innerHTML = '<p class="error">Kunde inte ladda idé</p>';
  }
}

function fastaFormularLyssnare(ideId: string) {
  const form = document.getElementById('idea-form') as HTMLFormElement;
  const titleInput = document.getElementById('title') as HTMLInputElement;
  const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
  const errorDiv = document.getElementById('error-message')!;
  const cancelBtn = document.getElementById('cancel-btn');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titel = titleInput.value.trim();
    const beskrivning = descriptionInput.value.trim();
    if (!titel || !beskrivning) {
      errorDiv.textContent = 'Både titel och beskrivning krävs';
      errorDiv.style.display = 'block';
      return;
    }
    errorDiv.style.display = 'none';
    try {
      await api.uppdateraIde(ideId, { titel, beskrivning });
      navigeraTill('/my-ideas');
    } catch (error: any) {
      errorDiv.textContent = error.message || 'Kunde inte uppdatera ide';
      errorDiv.style.display = 'block';
    }
  });
  cancelBtn?.addEventListener('click', () => {
    navigeraTill('/my-ideas');
  });
}