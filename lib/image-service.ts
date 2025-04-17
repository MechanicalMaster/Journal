import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

// Initialize Firebase Storage
const storage = getStorage(app);

interface ProcessImageResult {
  success: boolean;
  text?: string;
  errorRanges?: { start: number; end: number }[];
  error?: string;
}

export const imageService = {
  // Upload an image to Firebase Storage
  async uploadImage(imageDataUrl: string, userId: string): Promise<string> {
    try {
      // Create a unique file name
      const timestamp = Date.now();
      const imageRef = ref(storage, `journal-images/${userId}/${timestamp}.jpg`);
      
      // Upload the image
      const dataUrlWithoutPrefix = imageDataUrl.split(',')[1];
      await uploadString(imageRef, dataUrlWithoutPrefix, 'base64');
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(imageRef);
      return downloadUrl;
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