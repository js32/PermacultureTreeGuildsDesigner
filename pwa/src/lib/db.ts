import { openDB, type DBSchema } from 'idb';
import type { PlantData } from './types';

interface PlantDB extends DBSchema {
  plants: {
    key: string;
    value: PlantData;
    indexes: { 'by-latin': string };
  };
}

const DB_NAME = 'permaculture-guilds';
const DB_VERSION = 1;

function getDB() {
  return openDB<PlantDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('plants', { keyPath: 'id' });
      store.createIndex('by-latin', 'latinName');
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
