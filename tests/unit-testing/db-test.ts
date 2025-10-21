import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;

export async function setupTestDatabase() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('test-stora-hjartat');
  process.env.MONGODB_URI = uri;
  return { db, client, mongod };
}

export async function teardownTestDatabase() {
  if (client) {
    await client.close();
  }
  if (mongod) {
    await mongod.stop();
  }
}

export function getTestDb(): Db {
  return db;
}