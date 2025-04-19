import { db, JournalEntry } from './db'; // Import Dexie db instance and interface
import { imageService } from "./image-service";

export const journalService = {
  // Create a new journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    try {
      const newEntry: JournalEntry = {
        ...entry,
        id: Date.now().toString(), // Generate a unique ID (consistent with previous logic)
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use Dexie to add the entry
      await db.journalEntries.add(newEntry);
      console.log(`Entry created with ID: ${newEntry.id}`);
      return newEntry;

    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  // Get all entries for a user
  async getEntries(userId: string): Promise<JournalEntry[]> {
    try {
      // Use Dexie to get entries, filter by userId, and sort
      return await db.journalEntries
        .where('userId')
        .equals(userId)
        .reverse() // To sort by createdAt descending
        .sortBy('createdAt');
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  },

  // Get a single entry by ID
  async getEntryById(entryId: string): Promise<JournalEntry | undefined> { // Return type updated
    try {
      // Use Dexie to get an entry by its primary key (id)
      const entry = await db.journalEntries.get(entryId);
      return entry; // Returns undefined if not found, which is fine
    } catch (error) {
      console.error('Error getting journal entry by ID:', error);
      throw error;
    }
  },

  // Update an existing entry
  async updateEntry(entryId: string, updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    try {
      // Use Dexie to update the entry
      const numUpdated = await db.journalEntries.update(entryId, { 
        ...updates, 
        updatedAt: new Date()
      });

      if (numUpdated === 0) {
        throw new Error(`Entry with ID ${entryId} not found for update`);
      }
      console.log(`Entry updated: ${entryId}`);

    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  // Delete an entry
  async deleteEntry(entryId: string): Promise<void> {
    try {
      // Use Dexie to delete the entry
      await db.journalEntries.delete(entryId);
      console.log(`Entry deleted: ${entryId}`);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  },

  // Process and save a new entry with images
  async processAndSaveEntry(
    userId: string,
    title: string,
    text: string,
    imageDataUrls: string[],
    qualifiers: string[]
  ): Promise<JournalEntry> {
    try {
      console.log(`Processing journal entry for user ${userId} with ${imageDataUrls.length} images`);
      
      // This now uses the Dexie-backed createEntry
      return await this.createEntry({
        userId,
        title: title || 'Untitled Entry',
        text: text || '',
        images: imageDataUrls || [], // Store the data URLs directly
        qualifiers: qualifiers || [],
      });
    } catch (error) {
      console.error('Error processing and saving entry:', error);
      throw error;
    }
  },
}; 