/**
 * Public API: Get all purchases for the same participant within an event
 * GET /api/orders/[id]/purchases
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

    // Get base order to identify participant and event
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

    const buyerName = order.buyer_display_name;

    // Get event info
    const { data: event } = await supabaseServer
      .from('events')
      .select('code, title, price_nok')
      .eq('id', order.event_id)
      .single();

    if (!buyerName) {
      // If no buyer name, only return this order
      return NextResponse.json({
        event: event || null,
        purchases: [
          {
            id: order.id,
            buyer_display_name: order.buyer_display_name,
            qty: order.qty,
            amount_nok: order.amount_nok,
            paid: order.paid,
            created_at: order.created_at,
          },
        ],
      });
    }

    // Fetch all orders for this buyer within the same event
    const { data: orders, error: ordersError } = await supabaseServer
      .from('orders')
      .select('id, buyer_display_name, qty, amount_nok, paid, created_at')
      .eq('event_id', order.event_id)
      .eq('buyer_display_name', buyerName)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    return NextResponse.json({
      event: event || null,
      purchases: orders || [],
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
