import { ruttare } from './router.js';
import { tillstandsHanterare } from './state.js';
import { paAutentiseringsAndring, hamtaAnvandare } from './auth.js';
import './style.css';
import { renderaHemSida } from './pages/home.js';
import { renderaInloggningsSida } from './pages/login.js';
import { renderaMinaIderSida } from './pages/my-ideas.js';
import { renderaFavoriterSida } from './pages/favorites.js';
import { renderaSkapaIdeSida } from './pages/create-idea.js';
import { renderaRedigeraIdeSida } from './pages/edit-idea.js';
import { renderaVisaIdeSida } from './pages/view-idea.js';

paAutentiseringsAndring((anvandare) => {
  tillstandsHanterare.sattTillstand({
    anvandare,
    arAutentiserad: !!anvandare,
  });
  ruttare.starta();
});

ruttare.rutt('/', renderaHemSida);
ruttare.rutt('/login', renderaInloggningsSida);
ruttare.rutt('/my-ideas', renderaMinaIderSida);
ruttare.rutt('/favorites', renderaFavoriterSida);
ruttare.rutt('/ideas/create', renderaSkapaIdeSida);
ruttare.rutt('/ideas/edit/:id', renderaRedigeraIdeSida);
ruttare.rutt('/ideas/:id', renderaVisaIdeSida);

const nuvarandeAnvandare = hamtaAnvandare();

if (nuvarandeAnvandare) {
  tillstandsHanterare.sattTillstand({
    anvandare: nuvarandeAnvandare,
    arAutentiserad: true,
  });
}

ruttare.starta();