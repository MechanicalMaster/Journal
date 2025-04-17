import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { imageData, requestUserId } = await request.json();
    
    if (!imageData) {
      return NextResponse.json({ 
        success: false, 
        error: 'No image data provided' 
      }, { status: 400 });
    }
    
    if (!requestUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No user ID provided' 
      }, { status: 400 });
    }
    
    // In production, we would verify the token here
    // For now, we'll just use the requested user ID
    const userId = requestUserId;
    
    console.log(`Processing image upload for user: ${userId.substring(0, 5)}...`);
    
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `journal-images/${userId}/${timestamp}.jpg`;
      const storageRef = ref(storage, filename);
      
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = imageData.split(',')[1];
      
      // Upload the image
      await uploadString(storageRef, base64Data, 'base64');
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log(`Image uploaded successfully: ${filename}`);
      
      return NextResponse.json({
        success: true,
        url: downloadURL
      });
    } catch (uploadError: any) {
      console.error('Firebase storage error:', uploadError);
      return NextResponse.json({ 
        success: false,
        error: `Storage error: ${uploadError.message || 'Unknown error'}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in upload-image API route:', error);
    return NextResponse.json({ 
      success: false,
      error: `Server error: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
} 