import { getStorage, ref } from "firebase/storage";
import { app, auth } from "./firebase";

// Initialize Firebase Storage
const storage = getStorage(app);

interface ProcessImageResult {
  success: boolean;
  text?: string;
  errorRanges?: { start: number; end: number }[];
  error?: string;
}

export const imageService = {
  // Upload an image using server-side API route
  async uploadImage(imageDataUrl: string, userId: string): Promise<string> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // In development mode, just pass the user ID in the header
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using direct user ID in header');
        headers['X-User-ID'] = userId;
      } else {
        // In production, get a real token
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Authentication required to upload images');
        }
        
        let token = '';
        try {
          token = await user.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Error getting ID token:', error);
          throw new Error('Failed to get authentication token');
        }
      }
      
      // Call the API route to upload the image
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          imageData: imageDataUrl,
          requestUserId: userId  // renamed to distinguish from the server-side userId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.url) {
        throw new Error('Upload failed: No URL returned');
      }
      
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
  
  // Process an image with the OpenAI Vision API
  async processImage(imageDataUrl: string): Promise<ProcessImageResult> {
    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: imageDataUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        return {
          success: false,
          error: errorData.error || errorData.details || 'Failed to process image',
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to process image',
      };
    }
  },
}; 