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

  // Export all entries for a user to a JSON-compatible array
  async exportEntriesToJson(userId: string): Promise<any[]> {
    try {
      const entries = await db.journalEntries
        .where('userId')
        .equals(userId)
        .toArray();

      // Convert Date objects to ISO strings for JSON compatibility
      return entries.map(entry => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error exporting journal entries:', error);
      throw error;
    }
  },

  // Import entries from a JSON array, updating existing or creating new ones
  async importEntriesFromJson(userId: string, entries: any[]): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
    const validatedEntries: JournalEntry[] = [];
    const errors: string[] = [];
    let errorCount = 0;

    if (!Array.isArray(entries)) {
      throw new Error("Invalid import data: Expected an array of entries.");
    }

    for (const entryData of entries) {
      // Basic validation
      if (!entryData || typeof entryData !== 'object' || !entryData.id || typeof entryData.id !== 'string') {
        errors.push(`Skipping invalid entry object: ${JSON.stringify(entryData)}`);
        errorCount++;
        continue;
      }
      
      // **Crucially, ensure the entry's userId matches the currently logged-in user**
      // Allow import *only* if the entry's userId matches the importing user, 
      // or if the entry doesn't have a userId field (maybe older format? - decide how to handle)
      // For now, we strictly enforce matching userId.
      if (entryData.userId !== userId) {
         errors.push(`Skipping entry ID ${entryData.id}: User ID mismatch.`);
         errorCount++;
         continue; 
      }

      try {
        // Convert ISO strings back to Date objects, provide defaults for missing fields
        const validatedEntry: JournalEntry = {
          id: entryData.id,
          userId: entryData.userId, // Already validated to match logged-in user
          title: typeof entryData.title === 'string' ? entryData.title : 'Untitled (Imported)',
          text: typeof entryData.text === 'string' ? entryData.text : '',
          images: Array.isArray(entryData.images) ? entryData.images.filter((img: string) => typeof img === 'string') : [],
          qualifiers: Array.isArray(entryData.qualifiers) ? entryData.qualifiers.filter((q: string) => typeof q === 'string') : [],
          createdAt: entryData.createdAt ? new Date(entryData.createdAt) : new Date(),
          updatedAt: entryData.updatedAt ? new Date(entryData.updatedAt) : new Date(), // Use imported date or now
        };
        
        // Check if dates are valid after conversion
        if (isNaN(validatedEntry.createdAt.getTime()) || isNaN(validatedEntry.updatedAt.getTime())) {
          throw new Error(`Invalid date format for entry ID ${validatedEntry.id}`);
        }

        validatedEntries.push(validatedEntry);
      } catch (validationError) {
        errors.push(`Skipping entry ID ${entryData.id}: ${(validationError as Error).message}`);
        errorCount++;
      }
    }

    if (validatedEntries.length === 0 && errorCount > 0) {
       // Only errors, no valid entries found
       return { successCount: 0, errorCount, errors };
    }
    
    if (validatedEntries.length > 0) {
        try {
          // Use bulkPut for efficient insert/update
          await db.journalEntries.bulkPut(validatedEntries);
          console.log(`Successfully imported/updated ${validatedEntries.length} entries.`);
        } catch (dbError) {
          console.error('Error during bulk put:', dbError);
          // Treat all entries intended for this bulkPut as failed if the operation fails
          errorCount += validatedEntries.length; 
          errors.push(`Database bulk update failed: ${(dbError as Error).message}`);
          // Return only the errors encountered *before* the failed bulkPut + the bulkPut error
          return { successCount: 0, errorCount, errors }; 
        }
    }

    return { successCount: validatedEntries.length, errorCount, errors };
  },
}; 