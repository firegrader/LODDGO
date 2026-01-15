/**
 * Public API: Draw next winner (random undrawn ticket)
 * POST /api/events/[code]/draw
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getEventByCode } from '@/lib/loddgo';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid event code' },
        { status: 400 }
      );
    }

    const event = await getEventByCode(code);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Call RPC to draw next winner
    const { data: draw, error: drawError } = await supabaseServer
      .rpc('draw_next_winner', { p_event_id: event.id })
      .single();

    if (drawError) {
      console.error('Draw RPC error:', drawError);
      if (drawError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No tickets available to draw' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: drawError.message || 'Failed to draw next winner' },
        { status: 500 }
      );
    }

    if (!draw) {
      return NextResponse.json(
        { error: 'No tickets available to draw' },
        { status: 409 }
      );
    }

    return NextResponse.json(draw, { status: 201 });
  } catch (error) {
    console.error('Error drawing next winner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
