import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
      };

      const docRef = await addDoc(collection(db, 'journalEntries'), entryWithTimestamps);
      
      return {
        ...entryWithTimestamps,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  // Get all entries for a user
  async getEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const q = query(
        collection(db, 'journalEntries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as JournalEntry[];
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  },

  // Update an existing entry
  async updateEntry(entryId: string, updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    try {
      const entryRef = doc(db, 'journalEntries', entryId);
      await updateDoc(entryRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  // Delete an entry
  async deleteEntry(entryId: string): Promise<void> {
    try {
      const entryRef = doc(db, 'journalEntries', entryId);
      await deleteDoc(entryRef);
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
      
      // Upload all images to Firebase Storage
      let imageUrls: string[] = [];
      
      // Handle image uploads
      if (imageDataUrls && imageDataUrls.length > 0) {
        try {
          // Upload images in sequence to avoid overwhelming the system
          for (const imageDataUrl of imageDataUrls) {
            try {
              const imageUrl = await imageService.uploadImage(imageDataUrl, userId);
              if (imageUrl) {
                console.log(`Successfully uploaded image: ${imageUrl.substring(0, 50)}...`);
                imageUrls.push(imageUrl);
              }
            } catch (imageError) {
              console.error('Error uploading individual image:', imageError);
              // Continue with the next image
            }
          }
          console.log(`Successfully uploaded ${imageUrls.length} of ${imageDataUrls.length} images`);
        } catch (error) {
          console.error('Error uploading images:', error);
          // Continue with empty image array if uploads fail
        }
      }

      // Create the journal entry even if image uploads failed
      return await this.createEntry({
        userId,
        title: title || 'Untitled Entry',
        text: text || '',
        images: imageUrls,
        qualifiers: qualifiers || [],
      });
    } catch (error) {
      console.error('Error processing and saving entry:', error);
      throw error;
    }
  },
}; 