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
// v3: idempotent self-healing upgrade. Some browsers ended up with a v2 DB
// that was missing the 'plants' store after an inconsistent upgrade path
// (Symptom: "Failed to execute 'transaction' … object store not found").
// Bumping to v3 forces the upgrade to run for everyone; the handler then
// checks each store individually and creates any that are missing — so
// fresh installs, legacy v1 plants-only DBs, and broken v2 DBs all
// converge to the same shape.
const DB_VERSION = 3;

function getDB() {
  return openDB<PlantDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('plants')) {
        const store = db.createObjectStore('plants', { keyPath: 'id' });
        store.createIndex('by-latin', 'latinName');
      }
      if (!db.objectStoreNames.contains('guilds')) {
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

export async function importGuilds(guilds: Guild[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('guilds', 'readwrite');
  for (const guild of guilds) {
    await tx.store.put(guild);
  }
  await tx.done;
}
