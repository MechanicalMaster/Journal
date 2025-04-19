import { imageProcessor } from './image-processor';

interface ProcessImageResult {
  success: boolean;
  text?: string;
  errorRanges?: { start: number; end: number }[];
  error?: string;
  compressionStats?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
}

export const imageService = {
  // Process an image with the OpenAI Vision API
  async processImage(imageDataUrl: string): Promise<ProcessImageResult> {
    try {
      // Get compression level from localStorage, default to 'Medium' if not set
      const compressionLevel = localStorage.getItem('compressionLevel') || 'Medium';
      
      // Apply compression based on the selected level
      const compressionResult = await imageProcessor.compressImage(
        imageDataUrl, 
        compressionLevel as any // Type cast to the enum type
      );
      
      // Send the compressed image to the API
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageData: compressionResult.dataUrl,
          compressionLevel // Pass the compression level for analytics
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        return {
          success: false,
          error: errorData.error || errorData.details || 'Failed to process image',
          compressionStats: {
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: compressionResult.compressionRatio
          }
        };
      }
      
      // Get API result
      const result = await response.json();
      
      // Add compression stats to the result
      return {
        ...result,
        compressionStats: {
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          compressionRatio: compressionResult.compressionRatio
        }
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to process image',
      };
    }
  },
};