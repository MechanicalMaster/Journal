import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { imageData, requestUserId } = await request.json();
    
    if (!imageData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing image data' 
      }, { status: 400 });
    }

    // Get the user ID - in development, use the header; in production, authenticate properly
    let userId: string;
    
    // Simplified auth for development
    if (process.env.NODE_ENV === 'development') {
      userId = request.headers.get('x-user-id') || requestUserId;
      if (!userId) {
        return NextResponse.json({ 
          success: false, 
          error: 'Missing user ID in development mode' 
        }, { status: 400 });
      }
      console.log('Development mode: Using user ID', userId);
    } else {
      // In production, token would be verified here and user ID extracted
      // This is a placeholder for when you implement Firebase Admin authentication
      return NextResponse.json({ 
        success: false, 
        error: 'Production authentication not yet implemented' 
      }, { status: 501 });
    }

    // Initialize Firebase Storage
    const storage = getStorage(app);
    
    // Create a unique file name
    const timestamp = Date.now();
    const imageRef = ref(storage, `journal-images/${userId}/${timestamp}.jpg`);
    
    // Upload the image
    const dataUrlWithoutPrefix = imageData.split(',')[1];
    await uploadString(imageRef, dataUrlWithoutPrefix, 'base64');
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(imageRef);
    
    return NextResponse.json({ success: true, url: downloadUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    }, { status: 500 });
  }
} 