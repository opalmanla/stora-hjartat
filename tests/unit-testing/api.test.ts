import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, getTestDb } from './db-test.js';
import type { Ide } from '../../src/backend/types';
import { ObjectId } from 'mongodb';

describe('Idé API Test', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });
  afterAll(async () => {
    await teardownTestDatabase();
  });
  it('skapa en ny idé', async () => {
    const db = getTestDb();
    const newIdea: Ide = {
      titel: 'Test Ideell Idé',
      beskrivning: 'Detta är en test beskrivning för en ideell idé',
      anvandarId: 'test-user-123',
      anvandarNamn: 'Test User',
      skapadVid: new Date(),
      uppdateradVid: new Date(),
      kommentarer: [],
      favoriseradAv: [],
    };
    const result = await db.collection<Ide>('ideas').insertOne(newIdea);
    expect(result.insertedId).toBeDefined();
    const idea = await db.collection<Ide>('ideas').findOne({ _id: result.insertedId });
    expect(idea).toBeDefined();
    expect(idea?.titel).toBe('Test Ideell Idé');
    expect(idea?.anvandarId).toBe('test-user-123');
  });
  it('Lägga till en kommentar till en idé', async () => {
    const db = getTestDb();
    const idea: Ide = {
      titel: 'Idé med kommentarer',
      beskrivning: 'Test',
      anvandarId: 'user-1',
      anvandarNamn: 'User 1',
      skapadVid: new Date(),
      uppdateradVid: new Date(),
      kommentarer: [],
      favoriseradAv: [],
    };
    const insertResult = await db.collection<Ide>('ideas').insertOne(idea);
    const comment = {
      id: new ObjectId().toString(),
      anvandarId: 'user-2',
      anvandarNamn: 'User 2',
      text: 'Bra idé!',
      skapadVid: new Date(),
    };
    await db.collection<Ide>('ideas').updateOne(
      { _id: insertResult.insertedId },
      { $push: { kommentarer: comment } }
    );
    const updatedIdea = await db.collection<Ide>('ideas').findOne({ _id: insertResult.insertedId });
    expect(updatedIdea?.kommentarer).toHaveLength(1);
    expect(updatedIdea?.kommentarer[0].text).toBe('Bra idé!');
  });
  it('Växla mellan favoriter och idéer', async () => {
    const db = getTestDb();
    const idea: Ide = {
      titel: 'Favorit Idé',
      beskrivning: 'Test',
      anvandarId: 'user-1',
      anvandarNamn: 'User 1',
      skapadVid: new Date(),
      uppdateradVid: new Date(),
      kommentarer: [],
      favoriseradAv: [],
    };
    const insertResult = await db.collection<Ide>('ideas').insertOne(idea);
    const userId = 'user-2';
    await db.collection<Ide>('ideas').updateOne(
      { _id: insertResult.insertedId },
      { $addToSet: { favoriseradAv: userId } }
    );
    let updatedIdea = await db.collection<Ide>('ideas').findOne({ _id: insertResult.insertedId });
    expect(updatedIdea?.favoriseradAv).toContain(userId);
    await db.collection<Ide>('ideas').updateOne(
      { _id: insertResult.insertedId },
      { $pull: { favoriseradAv: userId } }
    );
    updatedIdea = await db.collection<Ide>('ideas').findOne({ _id: insertResult.insertedId });
    expect(updatedIdea?.favoriseradAv).not.toContain(userId);
  });
  it('Söka idéer efter titel', async () => {
    const db = getTestDb();
    await db.collection<Ide>('ideas').insertMany([
      {
        titel: 'Hjälp hemlösa',
        beskrivning: 'En idé om att hjälpa hemlösa',
        anvandarId: 'user-1',
        anvandarNamn: 'User 1',
        skapadVid: new Date(),
        uppdateradVid: new Date(),
        kommentarer: [],
        favoriseradAv: [],
      },
      {
        titel: 'Rädda miljön',
        beskrivning: 'En miljöidé',
        anvandarId: 'user-2',
        anvandarNamn: 'User 2',
        skapadVid: new Date(),
        uppdateradVid: new Date(),
        kommentarer: [],
        favoriseradAv: [],
      },
    ]);
    const results = await db.collection<Ide>('ideas')
      .find({ titel: { $regex: 'miljön', $options: 'i' } })
      .toArray();
    expect(results).toHaveLength(1);
    expect(results[0].titel).toBe('Rädda miljön');
  });
});