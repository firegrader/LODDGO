/**
 * Admin API: Create event
 * POST /api/admin/events
 * Requires x-admin-key header
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey } from '@/lib/adminAuth';
import { createEvent } from '@/lib/loddgo';

export async function POST(request: NextRequest) {
  try {
    // Validate admin key
    validateAdminKey(request);

    const body = await request.json();

    // Validation
    const { code, title, price_nok, status, draw_at } = body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'code is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'title is required and must be a non-empty string' },
        { status: 400 }
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

    // Create event
    const event = await createEvent({
      code: code.trim(),
      title: title.trim(),
      price_nok,
      status: status || 'live',
      draw_at: draw_at || null,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);

    if (error instanceof Error) {
      if (error.message.includes('admin key')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
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
