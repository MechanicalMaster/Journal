import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    // Process as a development request if in development mode
    if (process.env.NODE_ENV === 'development') {
      const userIdHeader = request.headers.get('x-user-id');
      if (userIdHeader) {
        return NextResponse.json({
          authenticated: true,
          userId: userIdHeader,
          development: true
        });
      }
    }

    // Otherwise use the authentication middleware
    const { userId, response: authError } = await authenticateRequest(request);
    
    if (authError) {
      return authError;
    }
    
    return NextResponse.json({
      authenticated: true,
      userId: userId
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Authentication check failed' 
    }, { status: 500 });
  }
} 