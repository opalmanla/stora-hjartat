import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;
let client: MongoClient | null = null;

export async function anslutTillDatabas(): Promise<Db> {
  if (db) {
    return db;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MongoDB - Fel på URI');
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  console.log('MongoDB - Ansluten');
  return db;
}

export async function stangDatabas(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB - Frånkopplad');
  }
}

export function hamtaDb(): Db {
  if (!db) {
    throw new Error('MongoDB - Inte ansluten än');
  }
  return db;
}