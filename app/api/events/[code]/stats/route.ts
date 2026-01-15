/**
 * Public API: Get event statistics
 * GET /api/events/[code]/stats
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

    // Get orders count and total revenue
    const { data: orders, error: ordersError } = await supabaseServer
      .from('orders')
      .select('id, qty, amount_nok, buyer_display_name, created_at')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }

    console.log(`Found ${orders?.length || 0} orders for event ${event.id}`);

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

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalTickets = tickets?.length || 0;
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
      },
      recent_orders: recentOrders,
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
