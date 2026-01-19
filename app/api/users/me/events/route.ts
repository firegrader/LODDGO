/**
 * Public API: Get user's event history
 * GET /api/users/me/events
 * Requires x-user-id header (will use auth token when real auth is added)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    // Get user_id from header (for simulation, will come from auth token later)
    const user_id = request.headers.get('x-user-id');
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }
    
    const { data: identities, error } = await supabaseServer
      .from('user_event_identities')
      .select(`
        *,
        event:events(id, code, title, status, created_at)
      `)
      .eq('user_id', user_id)
      .order('last_used_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user events:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      user_id,
      events: identities || [],
    });
  } catch (error) {
    console.error('Error in user events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
