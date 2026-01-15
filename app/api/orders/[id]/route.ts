/**
 * Public API: Get order details
 * GET /api/orders/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      .select('code, title, price_nok')
      .eq('id', order.event_id)
      .single();

    // Get draw info for this event (to mark winners on tickets)
    const { data: draws } = await supabaseServer
      .from('draws')
      .select('winning_ticket_number')
      .eq('event_id', order.event_id);

    // If buyer_display_name exists, aggregate tickets across all their orders for this event
    let aggregatedTickets = tickets || [];
    if (order.buyer_display_name) {
      const { data: buyerOrders } = await supabaseServer
        .from('orders')
        .select('id')
        .eq('event_id', order.event_id)
        .eq('buyer_display_name', order.buyer_display_name);

      const orderIds = buyerOrders?.map((o) => o.id) || [];
      if (orderIds.length > 0) {
        const { data: allTickets } = await supabaseServer
          .from('tickets')
          .select('id, ticket_number, created_at')
          .in('order_id', orderIds)
          .order('ticket_number', { ascending: true });

        aggregatedTickets = allTickets || aggregatedTickets;
      }
    }

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
      tickets: aggregatedTickets,
      total_tickets: aggregatedTickets.length,
      event: event || null,
      draws: draws || [],
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
