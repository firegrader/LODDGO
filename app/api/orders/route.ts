/**
 * Public API: Create order (buy tickets)
 * POST /api/orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { buyTicketsTransactionally, getEventByCode } from '@/lib/loddgo';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  let event_code: string | undefined;
  let qty: number | undefined;
  let buyer_display_name: string | null | undefined;
  let idempotency_key: string | null | undefined;
  let is_nickname: boolean | undefined;

  try {
    const body = await request.json();

    // Validation
    ({ event_code, buyer_display_name, qty, idempotency_key, is_nickname } = body);
    
    // Get user_id from request header (for simulation, will come from auth token later)
    const user_id = request.headers.get('x-user-id') || null;

    if (!event_code || typeof event_code !== 'string') {
      return NextResponse.json(
        { error: 'event_code is required and must be a string' },
        { status: 400 }
      );
    }

    if (!qty || typeof qty !== 'number' || qty < 1 || qty > 200) {
      return NextResponse.json(
        { error: 'qty must be a number between 1 and 200' },
        { status: 400 }
      );
    }

    if (buyer_display_name !== undefined && buyer_display_name !== null && typeof buyer_display_name !== 'string') {
      return NextResponse.json(
        { error: 'buyer_display_name must be a string or null' },
        { status: 400 }
      );
    }

    // Get event to calculate amount and validate
    const event = await getEventByCode(event_code);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'live') {
      return NextResponse.json(
        { error: `Event is not live (status: ${event.status})` },
        { status: 400 }
      );
    }

    // Validate nickname uniqueness if provided
    if (buyer_display_name) {
      const { data: existingOrder } = await supabaseServer
        .from('orders')
        .select('id')
        .eq('event_id', event.id)
        .eq('buyer_display_name', buyer_display_name)
        .limit(1)
        .single();

      if (existingOrder) {
        return NextResponse.json(
          { error: `Nickname "${buyer_display_name}" is already taken for this event. Please choose a different name.` },
          { status: 409 }
        );
      }
    }

    // Calculate amount
    const amount_nok = event.price_nok * qty;

    // Handle user identity tracking
    let identity_id: string | null = null;

    if (user_id && buyer_display_name) {
      // Check if user already has an identity for this event
      const { data: existingIdentity } = await supabaseServer
        .from('user_event_identities')
        .select('*')
        .eq('user_id', user_id)
        .eq('event_id', event.id)
        .single();

      if (existingIdentity) {
        // Update last_used_at
        await supabaseServer
          .from('user_event_identities')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', existingIdentity.id);
        
        identity_id = existingIdentity.id;
      } else {
        // Create new identity for this user+event combination
        const { data: newIdentity, error: identityError } = await supabaseServer
          .from('user_event_identities')
          .insert({
            user_id: user_id,
            event_id: event.id,
            buyer_display_name: buyer_display_name,
            is_nickname: is_nickname || false,
          })
          .select()
          .single();

        if (identityError) {
          console.error('Error creating user event identity:', identityError);
          // Continue without identity_id if creation fails
        } else if (newIdentity) {
          identity_id = newIdentity.id;
        }
      }
    }

    // Create order with mock payment (paid=true for MVP)
    const { order, tickets } = await buyTicketsTransactionally({
      event_id: event.id,
      buyer_display_name: buyer_display_name || null,
      qty,
      amount_nok,
      paid: true, // Mock payment for MVP
      payment_provider: 'mock',
      idempotency_key: idempotency_key || null,
      user_id: user_id || null,
      identity_id: identity_id,
    });

    return NextResponse.json(
      {
        order: {
          id: order.id,
          event_id: order.event_id,
          buyer_display_name: order.buyer_display_name,
          qty: order.qty,
          amount_nok: order.amount_nok,
          paid: order.paid,
          created_at: order.created_at,
        },
        tickets: tickets.map((t) => ({
          id: t.id,
          ticket_number: t.ticket_number,
          created_at: t.created_at,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      event_code,
      qty,
    });

    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('Duplicate order')) {
        return NextResponse.json(
          { error: 'Duplicate order detected (idempotency_key conflict)' },
          { status: 409 }
        );
      }
      if (error.message.includes('Ticket number conflict')) {
        return NextResponse.json(
          { error: 'Concurrency error: please try again' },
          { status: 409 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Database function')) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      // Return the actual error message for debugging
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
