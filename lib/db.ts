import Dexie, { Table } from 'dexie';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  text: string;
  images: string[]; // Array of data URLs
  qualifiers: string[];
  entryDate: Date; // Date when the entry was written
  createdAt: Date;
  updatedAt: Date;
}

// New interface for User Profile data stored in Dexie
export interface UserProfile {
  userId: string; // Primary key (&userId), matches Firebase UID
  displayName?: string;
  photoDataUrl?: string; // Profile image stored as data URL
  updatedAt: Date;
}

export class MySubclassedDexie extends Dexie {
  journalEntries!: Table<JournalEntry>;
  userProfiles!: Table<UserProfile>; // Add table for user profiles

  constructor() {
    super('digitalJournalDB'); // Database name
    this.version(1).stores({
      journalEntries: '&id, userId, createdAt, title' // Primary key (&id), indexed fields
    });
    // Define version 2 for the new table
    this.version(2).stores({
      journalEntries: '&id, userId, createdAt, title', // Keep existing table definition
      userProfiles: '&userId, updatedAt' // Add userProfiles table, userId is primary key
    });
    // Add version 3 for the entryDate field
    this.version(3).stores({
      journalEntries: '&id, userId, createdAt, title, entryDate', // Add entryDate to indexed fields
      userProfiles: '&userId, updatedAt'
    });
    // Add further versions here if needed
  }
}

export const db = new MySubclassedDexie(); 