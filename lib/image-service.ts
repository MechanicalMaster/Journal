interface ProcessImageResult {
  success: boolean;
  text?: string;
  errorRanges?: { start: number; end: number }[];
  error?: string;
}

export const imageService = {
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