/**
 * Organizer API: Get organizer's events
 * GET /api/organizers/me/events
 * Requires x-organizer-id header (for simulation, will use auth token when real auth is added)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    // Get organizer_id from header (for simulation, will come from auth token later)
    const organizer_id = request.headers.get('x-organizer-id');
    
    if (!organizer_id) {
      return NextResponse.json(
        { error: 'Organizer ID required' },
        { status: 401 }
      );
    }
    
    const { data: events, error } = await supabaseServer
      .from('events')
      .select('*')
      .eq('organizer_id', organizer_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching organizer events:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      organizer_id,
      events: events || [] 
    });
  } catch (error) {
    console.error('Error in organizer events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
