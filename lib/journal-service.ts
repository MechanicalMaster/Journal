import { imageService } from "./image-service";

export interface JournalEntry {
  id?: string;
  userId: string;
  title: string;
  text: string;
  images: string[];
  qualifiers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const journalService = {
  // Create a new journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    try {
      const entryWithTimestamps = {
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: Date.now().toString(), // Generate a unique ID
      };

      // Get existing entries
      const entries = this.getLocalEntries();
      
      // Add new entry
      entries.push(entryWithTimestamps);
      
      // Save to localStorage
      localStorage.setItem('journalEntries', JSON.stringify(entries));
      
      return entryWithTimestamps as JournalEntry;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  // Get all entries for a user
  async getEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const entries = this.getLocalEntries();
      // Filter entries by userId and sort by createdAt descending
      return entries
        .filter(entry => entry.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  },

  // Get a single entry by ID
  async getEntryById(entryId: string): Promise<JournalEntry | null> {
    try {
      const entries = this.getLocalEntries();
      const entry = entries.find(entry => entry.id === entryId);
      return entry || null;
    } catch (error) {
      console.error('Error getting journal entry by ID:', error);
      throw error;
    }
  },

  // Helper to get entries from localStorage
  getLocalEntries(): JournalEntry[] {
    try {
      const entriesJson = localStorage.getItem('journalEntries');
      if (!entriesJson) return [];
      return JSON.parse(entriesJson) as JournalEntry[];
    } catch (e) {
      console.error('Error parsing journal entries from localStorage:', e);
      return [];
    }
  },

  // Update an existing entry
  async updateEntry(entryId: string, updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    try {
      const entries = this.getLocalEntries();
      const entryIndex = entries.findIndex(entry => entry.id === entryId);
      
      if (entryIndex === -1) {
        throw new Error(`Entry with ID ${entryId} not found`);
      }
      
      // Update the entry
      entries[entryIndex] = {
        ...entries[entryIndex],
        ...updates,
        updatedAt: new Date(),
      };
      
      // Save to localStorage
      localStorage.setItem('journalEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  // Delete an entry
  async deleteEntry(entryId: string): Promise<void> {
    try {
      const entries = this.getLocalEntries();
      const filteredEntries = entries.filter(entry => entry.id !== entryId);
      
      // Save to localStorage
      localStorage.setItem('journalEntries', JSON.stringify(filteredEntries));
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
      
      // Store the image data URLs directly instead of uploading to Firebase
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