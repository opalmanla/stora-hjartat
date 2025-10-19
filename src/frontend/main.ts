import { ruttare } from './router.js';

ruttare.rutt('/', () => {
    const app = document.getElementById('app')!;
    app.innerHTML = `<h1>Välkommen till Stora Hjärtat</h1>`;
});

ruttare.rutt('/ideas', () => {
    const app = document.getElementById('app')!;
    app.innerHTML = `<h1>Dela dina idéer</h1>`;
});

ruttare.starta();
