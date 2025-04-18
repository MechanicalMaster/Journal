import { NextRequest, NextResponse } from 'next/server';

// This is a server-side API route, but since we've moved to localStorage
// this API is now for demonstration purposes only
// Real data access would happen client-side directly through the journal service
export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Since localStorage is not available on the server,
    // we'll return an empty array with a message
    // In a real application, you would need to use a database or
    // other server-side storage mechanism
    
    return NextResponse.json({
      success: true,
      entries: [],
      message: "Data is now stored in localStorage. Please use client-side journal service to access entries."
    });
  } catch (error: any) {
    console.error('Error handling entries request:', error);
    return NextResponse.json({ 
      success: false,
      error: `Error handling entries request: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
} 