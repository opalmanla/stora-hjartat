import { loggaIn, registrera, meddelaAutentiseringsAndring } from '../auth.js';
import { navigeraTill } from '../router.js';
import { renderaNavigation, fastaNavigationslyssnare } from '../components.js';

export function renderaInloggningsSida() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    ${renderaNavigation()}
    <div class="container">
      <div class="auth-container">
        <div class="auth-tabs">
          <button class="tab-btn active" data-tab="login">Logga in</button>
          <button class="tab-btn" data-tab="register">Registrera dig</button>
        </div>
        <form id="login-form" class="auth-form active">
          <h2>Logga in</h2>
          <div class="form-group">
            <label for="login-username">Användarnamn</label>
            <input type="text" id="login-username" required />
          </div>
          <div class="form-group">
            <label for="login-password">Lösenord</label>
            <input type="password" id="login-password" required />
          </div>
          <div id="login-error" class="error" style="display: none;"></div>
          <button type="submit" class="btn btn-primary full-width">
            Logga in
          </button>
        </form>
        <form id="register-form" class="auth-form">
          <h2>Registrera dig</h2>
          <div class="form-group">
            <label for="register-username">Användarnamn</label>
            <input type="text" id="register-username" required />
          </div>
          <div class="form-group">
            <label for="register-fullname">Fullstandigt namn</label>
            <input type="text" id="register-fullname" required />
          </div>    
          <div class="form-group">
            <label for="register-email">E-post</label>
            <input type="email" id="register-email" required />
          </div>
          <div class="form-group">
            <label for="register-password">Lösenord</label>
            <input type="password" id="register-password" required minlength="6" />
          </div>
          <div class="form-group">
            <label for="register-confirm-password">Bekräfta lösenord</label>
            <input type="password" id="register-confirm-password" required minlength="6" />
          </div>
          <div id="register-error" class="error" style="display: none;"></div>
          <button type="submit" class="btn btn-primary full-width">
            Registrera dig
          </button>
        </form>
      </div>
    </div>
  `;
  fastaNavigationslyssnare();
  fastaFlikLyssnare();
  fastaFormularLyssnare();
}

function fastaFlikLyssnare() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const loginForm = document.getElementById('login-form')!;
  const registerForm = document.getElementById('register-form')!;
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLElement).dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
      } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
      }
    });
  });
}

function fastaFormularLyssnare() {
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  const loginUsername = document.getElementById('login-username') as HTMLInputElement;
  const loginPassword = document.getElementById('login-password') as HTMLInputElement;
  const loginError = document.getElementById('login-error')!;
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    try {
      await loggaIn(loginUsername.value, loginPassword.value);
      meddelaAutentiseringsAndring();
      navigeraTill('/');
    } catch (error: any) {
      loginError.textContent = error.message || 'Inloggning misslyckades';
      loginError.style.display = 'block';
    }
  });
  const registerForm = document.getElementById('register-form') as HTMLFormElement;
  const registerUsername = document.getElementById('register-username') as HTMLInputElement;
  const registerFullname = document.getElementById('register-fullname') as HTMLInputElement;
  const registerEmail = document.getElementById('register-email') as HTMLInputElement;
  const registerPassword = document.getElementById('register-password') as HTMLInputElement;
  const registerConfirmPassword = document.getElementById('register-confirm-password') as HTMLInputElement;
  const registerError = document.getElementById('register-error')!;
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.style.display = 'none';
    if (registerPassword.value !== registerConfirmPassword.value) {
      registerError.textContent = 'Losenorden matchar inte';
      registerError.style.display = 'block';
      return;
    }
    try {
      await registrera(
        registerUsername.value,
        registerPassword.value,
        registerFullname.value,
        registerEmail.value
      );
      meddelaAutentiseringsAndring();
      navigeraTill('/');
    } catch (error: any) {
      registerError.textContent = error.message || 'Registrering misslyckades';
      registerError.style.display = 'block';
    }
  });
}