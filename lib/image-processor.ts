/**
 * Image Processing Service
 * Handles image compression and resizing based on compression tiers.
 */

// Import compression tier config
const config = require('./config');

type CompressionLevel = 'None' | 'Low' | 'Medium' | 'High';

interface CompressionSettings {
  maxWidth: number;
  quality: number;
}

interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export const imageProcessor = {
  /**
   * Compress an image based on the selected compression tier
   * @param {string} dataUrl - The image data URL
   * @param {CompressionLevel} compressionLevel - Compression tier (None, Low, Medium, High)
   * @returns {Promise<CompressionResult>} - The compression result with stats
   */
  async compressImage(dataUrl: string, compressionLevel: CompressionLevel = 'Medium'): Promise<CompressionResult> {
    // Calculate original size
    const originalSize = this.getFileSizeInKB(dataUrl);
    
    // If no compression or settings unavailable, return original
    if (compressionLevel === 'None' || !config.imageTiers[compressionLevel]) {
      return {
        dataUrl,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1
      };
    }
    
    // Get compression settings
    const settings: CompressionSettings = config.imageTiers[compressionLevel];
    
    try {
      // Compress the image
      const compressedDataUrl = await this._resizeAndCompress(dataUrl, settings);
      
      // Calculate compressed size and ratio
      const compressedSize = this.getFileSizeInKB(compressedDataUrl);
      const compressionRatio = compressedSize / originalSize;
      
      return {
        dataUrl: compressedDataUrl,
        originalSize,
        compressedSize,
        compressionRatio
      };
    } catch (error) {
      console.error('Image compression failed:', error);
      
      // Return original image if compression fails
      return {
        dataUrl,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1
      };
    }
  },
  
  /**
   * Internal method to resize and compress image using canvas
   * @private
   */
  async _resizeAndCompress(dataUrl: string, settings: CompressionSettings): Promise<string> {
    const { maxWidth, quality } = settings;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Handle image load
      img.onload = () => {
        // Calculate dimensions preserving aspect ratio
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (newWidth > maxWidth) {
          const ratio = maxWidth / newWidth;
          newWidth = maxWidth;
          newHeight = Math.round(newHeight * ratio);
        }
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Unable to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to JPEG with specified quality
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      // Handle errors
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      // Set image source to trigger loading
      img.src = dataUrl;
    });
  },
  
  /**
   * Get file size in KB from a data URL
   * @param {string} dataUrl - The image data URL
   * @returns {number} - Size in KB
   */
  getFileSizeInKB(dataUrl: string): number {
    try {
      // Remove the data URL prefix to get just the base64 data
      const base64 = dataUrl.split(',')[1];
      if (!base64) return 0;
      
      // Base64 size in bytes: (base64 length * 3) / 4
      const sizeInBytes = (base64.length * 3) / 4;
      return Math.round(sizeInBytes / 1024); // Convert to KB
    } catch (error) {
      console.error('Error calculating file size:', error);
      return 0;
    }
  }
}; 