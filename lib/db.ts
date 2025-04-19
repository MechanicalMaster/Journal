import Dexie, { Table } from 'dexie';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  text: string;
  images: string[]; // Array of data URLs
  qualifiers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class MySubclassedDexie extends Dexie {
  journalEntries!: Table<JournalEntry>;

  constructor() {
    super('digitalJournalDB'); // Database name
    this.version(1).stores({
      journalEntries: '&id, userId, createdAt, title' // Primary key (&id), indexed fields
    });
  }
}

export const db = new MySubclassedDexie(); 