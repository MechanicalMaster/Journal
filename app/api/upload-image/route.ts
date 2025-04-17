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
      // Verify image data format
      if (!imageData.startsWith('data:image/') && !imageData.includes('base64')) {
        console.error('Invalid image format');
        return NextResponse.json({
          success: false,
          error: 'Invalid image format. Must be a base64 data URL'
        }, { status: 400 });
      }
      
      // Generate a unique filename with timestamp and random string to prevent collisions
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = `journal-images/${userId}/${timestamp}-${randomStr}.jpg`;
      
      console.log(`Creating storage reference: ${filename}`);
      const storageRef = ref(storage, filename);
      
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      let base64Data = imageData;
      
      if (base64Data.includes(',')) {
        console.log('Processing data URL format');
        base64Data = imageData.split(',')[1];
      }
      
      // Check if base64Data is valid
      try {
        atob(base64Data);
      } catch (e) {
        console.error('Invalid base64 data');
        return NextResponse.json({
          success: false,
          error: 'Invalid base64 data'
        }, { status: 400 });
      }
      
      // Verify storage is properly initialized
      if (!storage) {
        console.error('Firebase storage not initialized');
        return NextResponse.json({
          success: false,
          error: 'Storage service unavailable'
        }, { status: 500 });
      }
      
      console.log('Uploading image to Firebase Storage...');
      console.log(`Base64 data length: ${base64Data.length} characters`);
      
      // Upload with explicit retry logic
      let uploadAttempts = 0;
      const maxAttempts = 3;
      let uploadResult;
      
      while (uploadAttempts < maxAttempts) {
        try {
          uploadAttempts++;
          console.log(`Upload attempt ${uploadAttempts}/${maxAttempts}`);
          
          // Upload the image with correct format type
          uploadResult = await uploadString(storageRef, base64Data, 'base64');
          console.log('Upload successful');
          break; // Success, exit loop
        } catch (err: any) {
          console.error(`Upload attempt ${uploadAttempts} failed:`, err);
          
          if (uploadAttempts >= maxAttempts) {
            throw err; // Rethrow on final attempt
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
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
      
      // More specific error handling
      let errorMessage = uploadError.message || 'Unknown storage error';
      let statusCode = 500;
      
      if (uploadError.code === 'storage/unauthorized') {
        errorMessage = 'Unauthorized access to Firebase Storage';
        statusCode = 403;
      } else if (uploadError.code === 'storage/canceled') {
        errorMessage = 'Upload canceled';
        statusCode = 499;
      } else if (uploadError.code === 'storage/retry-limit-exceeded') {
        errorMessage = 'Upload failed after multiple attempts';
      } else if (uploadError.code === 'storage/invalid-format') {
        errorMessage = 'Invalid image format';
        statusCode = 400;
      }
      
      return NextResponse.json({ 
        success: false,
        error: `Storage error: ${errorMessage}`,
        errorCode: uploadError.code || 'unknown',
        details: process.env.NODE_ENV === 'development' ? uploadError.serverResponse : undefined
      }, { status: statusCode });
    }
  } catch (error: any) {
    console.error('Error in upload-image API route:', error);
    return NextResponse.json({ 
      success: false,
      error: `Server error: ${error.message || 'Unknown error'}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 