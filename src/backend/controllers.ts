import type { Request, Response } from 'express';
import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { hamtaDb } from './db.js';
import type { Anvandare, RegistreraTyp, InloggningTyp, AutentiseringsSvar, Ide,AutentiseringsForfragan, SkapaIdeTyp, UppdateraIdeTyp, LaggTillKommentarTyp, IdeKommentar } from './types.js';
import { ObjectId } from 'mongodb';

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
  try {
    const db = hamtaDb();
    const userId = (req as any).anvandare.id;
    const user = await db.collection<Anvandare>('users').findOne({_id: new ObjectId(userId)});
    if (!user) {
      res.status(404).json({ error: 'Användaren hittades inte' });
      return;
    }
    res.json({
      id: user._id!.toString(),
      anvandarNamn: user.anvandarNamn,
      fullstandigtNamn: user.fullstandigtNamn,
      ePost: user.ePost,
    });
  } catch (error) {
    res.status(500).json({ error: 'Misslyckades med att hämta användarinformation' });
  }
}

export async function hamtaAllaIder(req: Request, res: Response) {
  try {
    const db = hamtaDb();
    const search = req.query.search as string;
    const query = search ? {$or: [{titel: { $regex: search, $options: 'i'}}, {beskrivning: { $regex: search, $options: 'i'}}]} : {};
    const ideas = await db.collection<Ide>('ideas').find(query).sort({ skapadVid: -1 }).toArray();
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: 'Misslyckades med att hämta alla idéer' });
  }
}

export async function hamtaIdeGenomId(req: Request, res: Response) {
  try {
    const db = hamtaDb();
    const idea = await db.collection<Ide>('ideas').findOne({_id: new ObjectId(req.params.id)});
    if (!idea) {
      res.status(404).json({ error: 'Idén hittades inte' });
      return;
    }
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: 'Misslyckades med att hämta idén' });
  }
}

export async function hamtaAnvandarIder(req: Request, res: Response) {
  try {
    const db = hamtaDb();
    const ideas = await db.collection<Ide>('ideas').find({ anvandarId: req.params.userId }).sort({ skapadVid: -1 }).toArray();
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: 'Misslyckades med att hämta användarens idéer' });
  }
}

export async function hamtaAnvandarFavoriter(req: Request, res: Response) {
  try {
    const db = hamtaDb();
    const ideas = await db.collection<Ide>('ideas').find({favoriseradAv: req.params.userId}).sort({skapadVid: -1}).toArray();
    res.json(ideas);
  } catch (error) {
    res.status(500).json({error: 'Misslyckades med att hämta favoritidéer'});
  }
}

export async function skapaIde(req: AutentiseringsForfragan, res: Response) {
  try {
    const db = hamtaDb();
    const { titel, beskrivning }: SkapaIdeTyp = req.body;
    if (!titel || !beskrivning) {
      res.status(400).json({error: 'Titel och beskrivning är obligatoriska'});
      return;
    }
    const newIdea: Ide = {
      titel,
      beskrivning,
      anvandarId: req.anvandare!.id,
      anvandarNamn: req.anvandare!.anvandarNamn,
      skapadVid: new Date(),
      uppdateradVid: new Date(),
      kommentarer: [],
      favoriseradAv: [],
    };
    const result = await db.collection<Ide>('ideas').insertOne(newIdea);
    const idea = { ...newIdea, _id: result.insertedId };
    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({error: 'Misslyckades med att skapa en ny idé'});
  }
}

export async function uppdateraIde(req: AutentiseringsForfragan, res: Response) {
  try {
    const db = hamtaDb();
    const { titel, beskrivning }: UppdateraIdeTyp = req.body;
    const idea = await db.collection<Ide>('ideas').findOne({_id: new ObjectId(req.params.id)});
    if (!idea) {
      res.status(404).json({ error: 'Idén hittades inte' });
      return;
    }
    if (idea.anvandarId !== req.anvandare!.id) {
      res.status(403).json({error: "Du har inte behörighet att uppdatera denna idé"});
      return;
    }
    const updateData: any = { uppdateradVid: new Date() };
    if (titel) updateData.titel = titel;
    if (beskrivning) updateData.beskrivning = beskrivning;
    await db.collection<Ide>('ideas').updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });
    const updatedIdea = await db.collection<Ide>('ideas').findOne({_id: new ObjectId(req.params.id)});
    res.json(updatedIdea);
  } catch (error) {
    res.status(500).json({ error: 'Misslyckades med att uppdatera idén' });
  }
}

export async function taBortIde(req: AutentiseringsForfragan, res: Response) {
  try {
    const db = hamtaDb();
    const idea = await db.collection<Ide>('ideas').findOne({_id: new ObjectId(req.params.id)});
    if (!idea) {
      res.status(404).json({ error: 'Idén hittades inte' });
      return;
    }
    if (idea.anvandarId !== req.anvandare!.id) {
      res.status(403).json({ error: "Du har inte behörighet att ta bort denna idé" });
      return;
    }
    await db.collection<Ide>('ideas').deleteOne({_id: new ObjectId(req.params.id)});
    res.json({ message: 'Idén har tagits bort framgångsrikt' });
  } catch (error) {
    res.status(500).json({ error: 'Misslyckades med att ta bort idén' });
  }
}

export async function laggTillKommentar(req: AutentiseringsForfragan, res: Response) {
  try {
    const db = hamtaDb();
    const { text }: LaggTillKommentarTyp = req.body;
    if (!text) {
      res.status(400).json({ error: 'Kommentartext krävs' });
      return;
    }
    const comment: IdeKommentar = {
      id: new ObjectId().toString(),
      anvandarId: req.anvandare!.id,
      anvandarNamn: req.anvandare!.anvandarNamn,
      text,
      skapadVid: new Date(),
    };
    await db.collection<Ide>('ideas').updateOne({_id: new ObjectId(req.params.id)}, {$push: {kommentarer: comment}, $set: {uppdateradVid: new Date()}});
    const updatedIdea = await db.collection<Ide>('ideas').findOne({_id: new ObjectId(req.params.id)});
    res.json(updatedIdea);
  } catch (error) {
    res.status(500).json({error: 'Misslyckades med att lägga till en ny kommentar'});
  }
}

export async function vaxlaFavorit(req: AutentiseringsForfragan, res: Response) {
  try {
    const db = hamtaDb();
    const idea = await db.collection<Ide>('ideas').findOne({_id: new ObjectId(req.params.id)});
    if (!idea) {
      res.status(404).json({error: 'The idea not found'});
      return;
    }
    if (idea.anvandarId === req.anvandare!.id) {
      res.status(403).json({error: 'Du kan inte favoritisera dina egna idéer'});
      return;
    }
    const isFavorited = idea.favoriseradAv.includes(req.anvandare!.id);
    if (isFavorited) {
      await db.collection<Ide>('ideas').updateOne({_id: new ObjectId(req.params.id)}, {$pull: {favoriseradAv: req.anvandare!.id }});
    } else {
      await db.collection<Ide>('ideas').updateOne({_id: new ObjectId(req.params.id)}, {$addToSet: {favoriseradAv: req.anvandare!.id}});
    }
    const updatedIdea = await db.collection<Ide>('ideas').findOne({_id: new ObjectId(req.params.id)});
    res.json(updatedIdea);
  } catch (error) {
    res.status(500).json({error: 'Misslyckades med att växla favoritstatus'});
  }
}
