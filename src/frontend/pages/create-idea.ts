import { api } from '../api.js';
import { renderaNavigation, fastaNavigationslyssnare } from '../components.js';
import { navigeraTill } from '../router.js';
import { tillstandsHanterare } from '../state.js';

export function renderaSkapaIdeSida() {
  const { arAutentiserad } = tillstandsHanterare.hamtaTillstand();
  if (!arAutentiserad) {
    navigeraTill('/login');
    return;
  }
  const app = document.getElementById('app')!;
  app.innerHTML = `
    ${renderaNavigation()}
    <div class="container">
      <div class="page-header">
        <h2>Skapa en ny ideell idé</h2>
      </div>
      <form id="idea-form" class="idea-form">
        <div class="form-group">
          <label for="title">Titel *</label>
          <input type="text" id="title" required maxlength="100" />
        </div>
        <div class="form-group">
          <label for="description">Beskrivning *</label>
          <textarea id="description" rows="6" required maxlength="1000"></textarea>
        </div>
        <div id="error-message" class="error" style="display: none;"></div>
        <div class="button-group">
          <button type="submit" class="btn btn-primary">Spara idé</button>
          <button type="button" id="cancel-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </form>
    </div>
  `;
  fastaNavigationslyssnare();
  fastaFormularLyssnare();
}

function fastaFormularLyssnare() {
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
      await api.skapaIde({ titel, beskrivning });
      navigeraTill('/my-ideas');
    } catch (error: any) {
      errorDiv.textContent = error.message || 'Kunde inte skapa idé';
      errorDiv.style.display = 'block';
    }
  });
  cancelBtn?.addEventListener('click', () => {
    navigeraTill('/my-ideas');
  });
}