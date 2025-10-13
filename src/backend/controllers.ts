import type { Request, Response } from 'express';
import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { hamtaDb } from './db.js';
import type { Anvandare, RegistreraTyp, InloggningTyp, AutentiseringsSvar } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

const scrypt = promisify(crypto.scrypt);

async function hashaLosenord(losenord: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(losenord, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifieraLosenord(losenord: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  const derivedKey = (await scrypt(losenord, salt, 64)) as Buffer;
  return key === derivedKey.toString('hex');
}

export async function registrera(req: Request, res: Response) {
  try {
    const db = hamtaDb();
    const { anvandarNamn, losenord, fullstandigtNamn, ePost }: RegistreraTyp = req.body;
    if (!anvandarNamn || !losenord || !fullstandigtNamn || !ePost) {
      res.status(400).json({ error: 'Alla fält är obligatoriska' });
      return;
    }
    const existingUser = await db.collection<Anvandare>('users').findOne({ anvandarNamn });
    if (existingUser) {
      res.status(409).json({ error: 'Användarnamnet finns redan' });
      return;
    }
    const existingEmail = await db.collection<Anvandare>('users').findOne({ ePost });
    if (existingEmail) {
      res.status(409).json({ error: 'E-postadressen finns redan' });
      return;
    }
    const hashedPassword = await hashaLosenord(losenord);
    const newUser: Anvandare = {
      anvandarNamn,
      losenord: hashedPassword,
      fullstandigtNamn,
      ePost,
      skapadVid: new Date(),
    };
    const result = await db.collection<Anvandare>('users').insertOne(newUser);
    const userId = result.insertedId.toString();
    const token = jwt.sign({id: userId, anvandarNamn: newUser.anvandarNamn}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
    const response: AutentiseringsSvar = {
      token,
      anvandare: {
        id: userId,
        anvandarNamn: newUser.anvandarNamn,
        fullstandigtNamn: newUser.fullstandigtNamn,
        ePost: newUser.ePost,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Misslyckades med att registrera en ny användare' });
  }
}

export async function loggaIn(req: Request, res: Response) {
  try {
    const db = hamtaDb();
    const { anvandarNamn, losenord }: InloggningTyp = req.body;
    if (!anvandarNamn || !losenord) {
      res.status(400).json({ error: 'Användarnamn och lösenord krävs' });
      return;
    }
    const user = await db.collection<Anvandare>('users').findOne({ anvandarNamn });
    if (!user) {
      res.status(401).json({ error: 'Ogiltigt användarnamn eller lösenord' });
      return;
    }
    const isPasswordValid = await verifieraLosenord(losenord, user.losenord);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Ogiltigt användarnamn eller lösenord' });
      return;
    }
    const token = jwt.sign({id: user._id!.toString(), anvandarNamn: user.anvandarNamn}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
    const response: AutentiseringsSvar = {
      token,
      anvandare: {
        id: user._id!.toString(),
        anvandarNamn: user.anvandarNamn,
        fullstandigtNamn: user.fullstandigtNamn,
        ePost: user.ePost,
      },
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Misslyckades med att logga in' });
  }
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
