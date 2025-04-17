import { NextRequest, NextResponse } from 'next/server';
import { auth as clientAuth } from './firebase';

// Only import Firebase Admin in production environment
let admin: any = null;
let getFirebaseAdmin: () => any;

if (process.env.NODE_ENV !== 'development') {
  // This code only runs in production, not during development
  try {
    // Dynamic import for Firebase Admin
    const adminModule = require('firebase-admin');
    admin = adminModule;
    
    // Initialize Firebase Admin if not already initialized
    getFirebaseAdmin = () => {
      if (adminModule.apps.length === 0) {
        try {
          const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
          );
          
          adminModule.initializeApp({
            credential: adminModule.credential.cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          });
        } catch (error) {
          console.error('Error initializing Firebase Admin:', error);
        }
      }
      
      return adminModule;
    };
  } catch (error) {
    console.error('Error loading Firebase Admin:', error);
    // Fallback function in case of import failure
    getFirebaseAdmin = () => null;
  }
} else {
  // Development mode - return a mock Firebase Admin
  getFirebaseAdmin = () => null;
}

/**
 * Middleware for handling API route authentication
 * Returns user ID if authenticated, or null with an error response if not
 */
export async function authenticateRequest(request: NextRequest): Promise<{ userId: string | null, response: NextResponse | null }> {
  try {
    // Development mode fast path - use header
    if (process.env.NODE_ENV === 'development') {
      const userIdFromHeader = request.headers.get('x-user-id');
      if (userIdFromHeader) {
        console.log('Development mode: Using user ID from header:', userIdFromHeader);
        return {
          userId: userIdFromHeader,
          response: null
        };
      }
    }
    
    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        userId: null,
        response: NextResponse.json({ 
          success: false, 
          error: 'Authentication required' 
        }, { status: 401 })
      };
    }

    // Get token
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return {
        userId: null,
        response: NextResponse.json({ 
          success: false, 
          error: 'Invalid authentication token' 
        }, { status: 401 })
      };
    }

    try {
      // Development mode - use a dummy verification
      if (process.env.NODE_ENV === 'development') {
        // In development, handle tokens without Firebase Admin SDK
        console.log('Development mode: Skipping token verification');
        return {
          userId: 'dev-user-id',
          response: null
        };
      } else {
        // Production mode - verify the token
        const firebaseAdmin = getFirebaseAdmin();
        if (!firebaseAdmin) {
          return {
            userId: null,
            response: NextResponse.json({ 
              success: false, 
              error: 'Firebase Admin not available' 
            }, { status: 500 })
          };
        }
        
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        return {
          userId: decodedToken.uid,
          response: null
        };
      }
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return {
        userId: null,
        response: NextResponse.json({ 
          success: false, 
          error: 'Invalid or expired authentication token' 
        }, { status: 401 })
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      userId: null,
      response: NextResponse.json({ 
        success: false,  
        error: 'Authentication failed' 
      }, { status: 500 })
    };
  }
} 