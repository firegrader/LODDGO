/**
 * Public API: Get event statistics
 * GET /api/events/[code]/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getEventByCode } from '@/lib/loddgo';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Get orders count and total revenue
    const { data: orders, error: ordersError } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }

    console.log(`Found ${orders?.length || 0} orders for event ${event.id}`);
    if (orders && orders.length > 0) {
      console.log('Order IDs:', orders.map(o => o.id));
      console.log('Order details:', JSON.stringify(orders, null, 2));
    }

    // Get tickets count
    const { data: tickets, error: ticketsError } = await supabaseServer
      .from('tickets')
      .select('id')
      .eq('event_id', event.id);

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      throw ticketsError;
    }

    console.log(`Found ${tickets?.length || 0} tickets for event ${event.id}`);
    if (tickets && tickets.length > 0) {
      console.log('Ticket numbers:', tickets.map(t => t.id).slice(0, 10));
    }

    // Get draws
    const { data: draws, error: drawsError } = await supabaseServer
      .from('draws')
      .select('id, winning_ticket_number, winning_order_id, method, drawn_at')
      .eq('event_id', event.id)
      .order('drawn_at', { ascending: false });

    if (drawsError) {
      console.error('Error fetching draws:', drawsError);
      throw drawsError;
    }

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalTickets = tickets?.length || 0;
    const totalDraws = draws?.length || 0;
    const remainingTickets = Math.max(totalTickets - totalDraws, 0);
    const totalRevenue = orders?.reduce((sum, order) => sum + order.amount_nok, 0) || 0;
    const uniqueBuyers = new Set(orders?.map(o => o.buyer_display_name).filter(Boolean)).size;

    // Get recent orders (last 10)
    const recentOrders = orders?.slice(0, 10).map(order => ({
      id: order.id,
      buyer_name: order.buyer_display_name || 'Anonymous',
      qty: order.qty,
      amount_nok: order.amount_nok,
      created_at: order.created_at,
    })) || [];

    const responseData = {
      event: {
        code: event.code,
        title: event.title,
        price_nok: event.price_nok,
        status: event.status,
      },
      stats: {
        total_orders: totalOrders,
        total_tickets: totalTickets,
        total_revenue: totalRevenue,
        unique_buyers: uniqueBuyers,
        total_draws: totalDraws,
        remaining_tickets: remainingTickets,
      },
      recent_orders: recentOrders,
      draws: draws || [],
    };

    console.log('Stats response:', JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
