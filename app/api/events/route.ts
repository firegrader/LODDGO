/**
 * Public API: Create event (for organizers)
 * POST /api/events
 * No authentication required for MVP - organizers can create events freely
 */

import { NextRequest, NextResponse } from 'next/server';
import { createEvent, getEventByCode } from '@/lib/loddgo';
import { generateEventCode } from '@/lib/eventCodeGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const { title, price_nok, status, draw_at } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Generate event code automatically from title
    let code = generateEventCode(title.trim());
    
    // Ensure uniqueness - if code exists, try with different suffix
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const existingEvent = await getEventByCode(code);
      if (!existingEvent) {
        break; // Code is unique, we can use it
      }
      // Code exists, generate a new one with different suffix
      const timestamp = Date.now().toString();
      const baseCode = generateEventCode(title.trim()).slice(0, -6); // Remove old suffix
      code = `${baseCode}${timestamp.slice(-6)}`;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Unable to generate unique event code. Please try again.' },
        { status: 500 }
      );
    }

    if (typeof price_nok !== 'number' || price_nok < 0 || !Number.isInteger(price_nok)) {
      return NextResponse.json(
        { error: 'price_nok must be a non-negative integer' },
        { status: 400 }
      );
    }

    if (status !== undefined && !['draft', 'live', 'closed', 'drawn'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be one of: draft, live, closed, drawn' },
        { status: 400 }
      );
    }

    if (draw_at !== undefined && draw_at !== null && typeof draw_at !== 'string') {
      return NextResponse.json(
        { error: 'draw_at must be a string (ISO timestamp) or null' },
        { status: 400 }
      );
    }

    // Create event (no authentication required for MVP)
    const event = await createEvent({
      code: code,
      title: title.trim(),
      price_nok,
      status: status || 'live',
      draw_at: draw_at || null,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);

    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'Event code already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
