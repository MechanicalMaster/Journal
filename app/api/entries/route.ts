import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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
    
    // Get journal entries
    const entriesRef = collection(db, 'journalEntries');
    const q = query(
      entriesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert timestamps to strings for proper JSON serialization
      createdAt: doc.data().createdAt?.toDate?.().toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || null,
    }));
    
    return NextResponse.json({
      success: true,
      entries
    });
  } catch (error: any) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ 
      success: false,
      error: `Error fetching entries: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
} 