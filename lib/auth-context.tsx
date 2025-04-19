"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseAuthProfile // Rename to avoid conflict
} from "firebase/auth";
import { auth } from "./firebase";
import { profileService } from "./profile-service"; // Import profile service
import { UserProfile } from "./db"; // Import UserProfile interface

interface AuthContextProps {
  user: User | null;
  userProfile: UserProfile | null; // Add Dexie profile state
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoDataUrl?: string }) => Promise<void>; // Add update function
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State for Dexie profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // User logged in, fetch profile from Dexie
        setLoading(true); // Start loading profile
        try {
          const profile = await profileService.getProfile(firebaseUser.uid);
          setUserProfile(profile || null); // Set profile or null if not found
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setUserProfile(null); // Ensure profile is null on error
        }
        setLoading(false); // Finish loading user and profile
      } else {
        // User logged out, clear profile
        setUserProfile(null);
        setLoading(false); // Finish loading (no user)
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // After sign up, the onAuthStateChanged listener will handle fetching/creating profile
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = async (email: string, password: string) => {
    // After sign in, the onAuthStateChanged listener will handle fetching profile
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will clear user and userProfile state
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Function to update profile in Dexie and optionally Firebase Auth display name
  const updateUserProfile = async (updates: { displayName?: string; photoDataUrl?: string }) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const currentProfile = userProfile || { userId: user.uid }; // Get current or create base
    let firebaseUpdateNeeded = false;

    // Prepare updates for Dexie
    const profileUpdates: Partial<UserProfile> = {};
    if (updates.displayName !== undefined) {
      profileUpdates.displayName = updates.displayName;
      // Only update Firebase if the name actually changes
      if (updates.displayName !== user.displayName) {
          firebaseUpdateNeeded = true;
      }
    }
    if (updates.photoDataUrl !== undefined) {
      profileUpdates.photoDataUrl = updates.photoDataUrl;
    }
    
    // Update Dexie profile
    await profileService.updateProfile({ 
        userId: user.uid, 
        ...profileUpdates 
    });

    // Optionally update Firebase Auth displayName
    if (firebaseUpdateNeeded && updates.displayName !== undefined) {
      try {
         await updateFirebaseAuthProfile(user, { displayName: updates.displayName });
         // Consider reloading the firebase user object if needed, 
         // though onAuthStateChanged might handle this eventually.
         // await user.reload(); 
      } catch(firebaseError) {
          console.error("Failed to update Firebase Auth displayName:", firebaseError);
          // Decide if we should roll back Dexie update or just log error
          // For now, just log and continue
      }
    }

    // Refresh local state
    const updatedProfile = await profileService.getProfile(user.uid);
    setUserProfile(updatedProfile || null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, logout, resetPassword, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  // Combine user and profile for easier consumption? Or let components decide?
  // For now, return the full context.
  return context;
} 