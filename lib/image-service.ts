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
      // Simple validation
      if (!imageDataUrl || !userId) {
        console.error('Missing image data or userId');
        throw new Error('Missing image data or userId');
      }
      
      console.log(`Uploading image for user ${userId.substring(0, 5)}...`);
      
      // Call the API route to upload the image
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageData: imageDataUrl,
          requestUserId: userId
        }),
      });
      
      if (!response.ok) {
        let errorMsg = 'Failed to upload image';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Ignore JSON parsing error
        }
        console.error(`Upload error (${response.status}): ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      try {
        const data = await response.json();
        
        if (!data.success || !data.url) {
          throw new Error('Upload failed: No URL returned');
        }
        
        return data.url;
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        throw new Error('Invalid response from upload service');
      }
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