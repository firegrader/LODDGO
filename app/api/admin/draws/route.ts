/**
 * Admin API: Run draw
 * POST /api/admin/draws
 * Requires x-admin-key header
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey } from '@/lib/adminAuth';
import { drawWinner, getEventByCode } from '@/lib/loddgo';

export async function POST(request: NextRequest) {
  try {
    // Validate admin key
    validateAdminKey(request);

    const body = await request.json();

    // Validation
    const { event_code, winning_ticket_number, winning_order_id, method } = body;

    if (!event_code || typeof event_code !== 'string') {
      return NextResponse.json(
        { error: 'event_code is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof winning_ticket_number !== 'number' || winning_ticket_number < 1 || !Number.isInteger(winning_ticket_number)) {
      return NextResponse.json(
        { error: 'winning_ticket_number must be a positive integer' },
        { status: 400 }
      );
    }

    if (!winning_order_id || typeof winning_order_id !== 'string') {
      return NextResponse.json(
        { error: 'winning_order_id is required and must be a string (UUID)' },
        { status: 400 }
      );
    }

    if (method !== undefined && typeof method !== 'string') {
      return NextResponse.json(
        { error: 'method must be a string' },
        { status: 400 }
      );
    }

    // Get event to validate it exists
    const event = await getEventByCode(event_code);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Run draw
    const draw = await drawWinner({
      event_id: event.id,
      winning_ticket_number,
      winning_order_id,
      method: method || 'manual',
    });

    return NextResponse.json(draw, { status: 201 });
  } catch (error) {
    console.error('Error running draw:', error);

    if (error instanceof Error) {
      if (error.message.includes('admin key')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('already exists') || error.message.includes('Draw already')) {
        return NextResponse.json(
          { error: 'Draw already exists for this event' },
          { status: 409 }
        );
      }
      if (error.message.includes('does not match')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
