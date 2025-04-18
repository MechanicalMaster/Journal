import { NextRequest, NextResponse } from 'next/server';

// This endpoint is no longer needed for Firebase Storage uploads
// Now it just returns the same image data URL that was sent
export async function POST(request: NextRequest) {
  console.log('Upload image API route called - now client-side only');
  
  try {
    // Parse request body
    const { imageData, requestUserId } = await request.json();
    
    if (!imageData) {
      console.error('No image data provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No image data provided' 
      }, { status: 400 });
    }
    
    if (!requestUserId) {
      console.error('No user ID provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No user ID provided' 
      }, { status: 400 });
    }
    
    // Since storage is now on client-side, just return the same URL back
    // Client will store it in localStorage
    return NextResponse.json({
      success: true,
      url: imageData // Return the same data URL that was sent
    });
    
  } catch (error: any) {
    console.error('Error in upload-image API route:', error);
    return NextResponse.json({ 
      success: false,
      error: `Server error: ${error.message || 'Unknown error'}`
    }, { status: 500 });
  }
} 