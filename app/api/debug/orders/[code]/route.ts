/**
 * Debug endpoint: Check all orders for an event
 * GET /api/debug/orders/[code]
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

    const event = await getEventByCode(code);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get all orders
    const { data: orders, error: ordersError } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    // Get all tickets
    const { data: tickets, error: ticketsError } = await supabaseServer
      .from('tickets')
      .select('*')
      .eq('event_id', event.id)
      .order('ticket_number', { ascending: true });

    if (ticketsError) {
      throw ticketsError;
    }

    return NextResponse.json({
      event: {
        code: event.code,
        title: event.title,
        id: event.id,
      },
      orders: orders || [],
      tickets: tickets || [],
      summary: {
        total_orders: orders?.length || 0,
        total_tickets: tickets?.length || 0,
        ticket_numbers: tickets?.map(t => t.ticket_number) || [],
      },
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
