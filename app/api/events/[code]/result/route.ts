/**
 * Public API: Get draw result for an event
 * GET /api/events/[code]/result
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getEventByCode } from '@/lib/loddgo';

export async function GET(
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

    // Get event
    const event = await getEventByCode(code);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get draw results (all draws for event)
    const { data: draws, error: drawsError } = await supabaseServer
      .from('draws')
      .select('id, winning_ticket_number, winning_order_id, method, drawn_at')
      .eq('event_id', event.id)
      .order('drawn_at', { ascending: false });

    if (drawsError) {
      if (drawsError.code === 'PGRST116') {
        // No draw exists yet
        return NextResponse.json(
          { error: 'Draw not found for this event' },
          { status: 404 }
        );
      }
      throw drawsError;
    }

    if (!draws || draws.length === 0) {
      return NextResponse.json(
        { error: 'Draw not found for this event' },
        { status: 404 }
      );
    }

    // Get winning order details for all draws
    const orderIds = draws.map((d) => d.winning_order_id);
    const { data: orders } = await supabaseServer
      .from('orders')
      .select('id, buyer_display_name, qty, created_at')
      .in('id', orderIds);

    const ordersById = new Map(
      (orders || []).map((order) => [order.id, order])
    );

    const drawResults = draws.map((draw) => {
      const order = ordersById.get(draw.winning_order_id);
      return {
        id: draw.id,
        winning_ticket_number: draw.winning_ticket_number,
        method: draw.method,
        drawn_at: draw.drawn_at,
        winner: order
          ? {
              buyer_display_name: order.buyer_display_name,
              order_id: order.id,
              tickets_purchased: order.qty,
              order_date: order.created_at,
            }
          : null,
      };
    });

    return NextResponse.json({
      draws: drawResults,
      event: {
        code: event.code,
        title: event.title,
      },
    });
  } catch (error) {
    console.error('Error fetching draw result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
