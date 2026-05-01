import { openDB, type DBSchema } from 'idb';
import type { PlantData, Guild } from './types';

interface PlantDB extends DBSchema {
  plants: {
    key: string;
    value: PlantData;
    indexes: { 'by-latin': string };
  };
  guilds: {
    key: string;
    value: Guild;
  };
}

const DB_NAME = 'permaculture-guilds';
// v2: added 'guilds' store. Migration is non-destructive — existing 'plants'
// data carries over because we only call createObjectStore for stores that
// don't yet exist.
const DB_VERSION = 2;

function getDB() {
  return openDB<PlantDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('plants', { keyPath: 'id' });
        store.createIndex('by-latin', 'latinName');
      }
      if (oldVersion < 2) {
        db.createObjectStore('guilds', { keyPath: 'id' });
      }
    },
  });
}

export async function getAllPlants(): Promise<PlantData[]> {
  const db = await getDB();
  return db.getAll('plants');
}

export async function getPlant(id: string): Promise<PlantData | undefined> {
  const db = await getDB();
  return db.get('plants', id);
}

export async function savePlant(plant: PlantData): Promise<void> {
  const db = await getDB();
  await db.put('plants', plant);
}

export async function deletePlant(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('plants', id);
}

export async function importPlants(plants: PlantData[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('plants', 'readwrite');
  for (const plant of plants) {
    await tx.store.put(plant);
  }
  await tx.done;
}

export async function exportPlants(): Promise<PlantData[]> {
  return getAllPlants();
}

export async function clearAllPlants(): Promise<void> {
  const db = await getDB();
  await db.clear('plants');
}

// ── Guilds ────────────────────────────────────────────────────────────────

export async function getAllGuilds(): Promise<Guild[]> {
  const db = await getDB();
  return db.getAll('guilds');
}

export async function getGuild(id: string): Promise<Guild | undefined> {
  const db = await getDB();
  return db.get('guilds', id);
}

export async function saveGuild(guild: Guild): Promise<void> {
  guild.updatedAt = new Date().toISOString();
  const db = await getDB();
  await db.put('guilds', guild);
}

export async function deleteGuild(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('guilds', id);
}
