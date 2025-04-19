import { db, UserProfile } from './db';

export const profileService = {
  /**
   * Fetches the user profile from IndexedDB.
   * @param userId The Firebase UID of the user.
   * @returns The UserProfile object or undefined if not found.
   */
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    if (!userId) return undefined;
    try {
      return await db.userProfiles.get(userId);
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      // Depending on requirements, you might want to throw or return undefined
      return undefined;
    }
  },

  /**
   * Creates or updates a user profile in IndexedDB.
   * @param profileData Object containing userId and optional displayName and photoDataUrl.
   */
  async updateProfile(profileData: Omit<UserProfile, 'updatedAt'>): Promise<void> {
    if (!profileData || !profileData.userId) {
      console.error('updateProfile error: userId is required.');
      throw new Error('User ID is required to update profile.');
    }
    try {
      const dataToStore: UserProfile = {
        userId: profileData.userId,
        displayName: profileData.displayName,
        photoDataUrl: profileData.photoDataUrl,
        updatedAt: new Date(),
      };
      // 'put' will insert if the userId doesn't exist, or update if it does.
      await db.userProfiles.put(dataToStore);
      console.log(`Profile updated successfully for user ${profileData.userId}`);
    } catch (error) {
      console.error(`Error updating profile for user ${profileData.userId}:`, error);
      throw error; // Re-throw the error to be handled by the caller
    }
  },
}; 