import express from 'express';
import * as controllers from './controllers.js';
import { anslutTillDatabas } from './db.js';
import { autentiseraAnvandare } from './middleware.js';

const router = express.Router();

let dbConnected = false;
anslutTillDatabas().then(() => {
  dbConnected = true;
}).catch((err) => {
  console.error("MongoDB - anslutningen misslyckades :", err);
});

router.post('/auth/register', controllers.registrera);
router.post('/auth/login', controllers.loggaIn);
router.get('/auth/me',autentiseraAnvandare, controllers.hamtaNuvarandeAnvandare);
router.get('/ideas', controllers.hamtaAllaIder);
router.get('/ideas/:id', controllers.hamtaIdeGenomId);
router.post('/ideas',autentiseraAnvandare, controllers.skapaIde);
router.put('/ideas/:id',autentiseraAnvandare, controllers.uppdateraIde);
router.delete('/ideas/:id',autentiseraAnvandare, controllers.taBortIde);
router.post('/ideas/:id/comments',autentiseraAnvandare, controllers.laggTillKommentar);
router.post('/ideas/:id/favorite',autentiseraAnvandare, controllers.vaxlaFavorit);
router.get('/users/:userId/ideas', controllers.hamtaAnvandarIder);
router.get('/users/:userId/favorites', controllers.hamtaAnvandarFavoriter);

export default router;