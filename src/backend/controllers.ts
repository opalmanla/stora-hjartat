import type { Request, Response } from 'express';

export async function registrera(req: Request, res: Response) {
    res.send('Register user');
}

export async function loggaIn(req: Request, res: Response) {
    res.send('Login user');
}

export async function hamtaNuvarandeAnvandare(req: Request, res: Response) {
  res.send('Get current user');
}

export async function hamtaAllaIder(req: Request, res: Response) {
  res.send('Get all ideas');
}

export async function hamtaIdeGenomId(req: Request, res: Response) {
  res.send('Get idea by ID: ' + req.params.id);
}

export async function hamtaAnvandarIder(req: Request, res: Response) {
  res.send('Get user ideas: ' + req.params.userId);
}

export async function hamtaAnvandarFavoriter(req: Request, res: Response) {
  res.send('Get user favorites: ' + req.params.userId);
}

export async function skapaIde(req: Request, res: Response) {
  res.send('Create idea');
}

export async function uppdateraIde(req: Request, res: Response) {
  res.send('Update idea: ' + req.params.id);
}

export async function taBortIde(req: Request, res: Response) {
  res.send('Delete idea: ' + req.params.id);
}

export async function laggTillKommentar(req: Request, res: Response) {
  res.send('Add comment to idea: ' + req.params.id);
}

export async function vaxlaFavorit(req: Request, res: Response) {
  res.send('Favorite idea: ' + req.params.id);
}
