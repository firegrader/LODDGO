/**
 * Public API: Check if a nickname is available for an event
 * GET /api/events/[code]/check-nickname?nickname=Otter534
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventByCode } from '@/lib/loddgo';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname');

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { error: 'nickname query parameter is required' },
        { status: 400 }
      );
    }

    // Get event
    const event = await getEventByCode(code);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if nickname already exists for this event
    const { data: existingOrder, error } = await supabaseServer
      .from('orders')
      .select('id')
      .eq('event_id', event.id)
      .eq('buyer_display_name', nickname)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      console.error('Error checking nickname:', error);
      return NextResponse.json(
        { error: 'Failed to check nickname availability' },
        { status: 500 }
      );
    }

    const isAvailable = !existingOrder;

    return NextResponse.json({
      available: isAvailable,
      nickname,
      event_code: code,
    });
  } catch (error) {
    console.error('Error checking nickname:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
