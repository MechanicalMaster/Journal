import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  console.log('Upload image API route started');
  
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
    
    // In production, we would verify the token here
    // For now, we'll just use the requested user ID
    const userId = requestUserId;
    
    console.log(`Processing image upload for user: ${userId.substring(0, 5)}...`);
    
    try {
      // Generate a unique filename with timestamp and random string to prevent collisions
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = `journal-images/${userId}/${timestamp}-${randomStr}.jpg`;
      
      console.log(`Creating storage reference: ${filename}`);
      const storageRef = ref(storage, filename);
      
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      let base64Data = imageData;
      if (base64Data.includes(',')) {
        base64Data = imageData.split(',')[1];
      }
      
      console.log('Uploading image to Firebase Storage...');
      // Upload the image
      await uploadString(storageRef, base64Data, 'base64');
      
      console.log('Getting download URL...');
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log(`Image uploaded successfully: ${filename}`);
      
      return NextResponse.json({
        success: true,
        url: downloadURL
      });
    } catch (uploadError: any) {
      console.error('Firebase storage error details:', uploadError.code, uploadError.message);
      console.error('Full storage error:', JSON.stringify(uploadError, null, 2));
      
      return NextResponse.json({ 
        success: false,
        error: `Storage error: ${uploadError.message || 'Unknown error'}`,
        errorCode: uploadError.code || 'unknown'
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