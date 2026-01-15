/**
 * Public API: Get order details
 * GET /api/orders/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Get order
    const { data: order, error: orderError } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get tickets for this order
    const { data: tickets } = await supabaseServer
      .from('tickets')
      .select('id, ticket_number, created_at')
      .eq('order_id', orderId)
      .order('ticket_number', { ascending: true });

    // Get event info
    const { data: event } = await supabaseServer
      .from('events')
      .select('code, title')
      .eq('id', order.event_id)
      .single();

    return NextResponse.json({
      order: {
        id: order.id,
        event_id: order.event_id,
        buyer_display_name: order.buyer_display_name,
        qty: order.qty,
        amount_nok: order.amount_nok,
        paid: order.paid,
        created_at: order.created_at,
      },
      tickets: tickets || [],
      event: event || null,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
