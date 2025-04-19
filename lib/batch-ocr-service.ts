/**
 * Batch OCR Service
 * Handles processing of multiple images for OCR in sequence
 */

import { imageService } from './image-service';

export interface BatchOcrResult {
  results: {
    imageUrl: string;
    extractedText: string;
    success: boolean;
    errorRanges?: { start: number; end: number }[];
    error?: string;
    compressionStats?: {
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
    };
  }[];
  combinedText: string;
}

export const batchOcrService = {
  /**
   * Process multiple images for OCR extraction
   * @param imageDataUrls Array of image data URLs to process
   * @returns Results for each image and combined text
   */
  async processImages(imageDataUrls: string[]): Promise<BatchOcrResult> {
    const results = [];
    let combinedText = "";
    
    for (let i = 0; i < imageDataUrls.length; i++) {
      try {
        console.log(`Processing image ${i+1} of ${imageDataUrls.length}`);
        
        // Process each image with existing service
        const result = await imageService.processImage(imageDataUrls[i]);
        
        if (result.success && result.text) {
          // Add page number prefix for combined text
          const pageText = `[Page ${i+1}]\n${result.text}\n\n`;
          combinedText += pageText;
          
          results.push({
            imageUrl: imageDataUrls[i],
            extractedText: result.text,
            success: true,
            errorRanges: result.errorRanges,
            compressionStats: result.compressionStats
          });
        } else {
          results.push({
            imageUrl: imageDataUrls[i],
            extractedText: "",
            success: false,
            error: result.error || "OCR failed"
          });
        }
      } catch (error) {
        console.error(`Error processing image ${i+1}:`, error);
        
        results.push({
          imageUrl: imageDataUrls[i],
          extractedText: "",
          success: false,
          error: (error as Error).message || "Processing error"
        });
      }
    }
    
    return {
      results,
      combinedText: combinedText.trim()
    };
  }
}; 