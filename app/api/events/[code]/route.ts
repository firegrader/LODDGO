/**
 * Public API: Get event by code
 * GET /api/events/[code]
 */

import { NextRequest, NextResponse } from 'next/server';
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

    const event = await getEventByCode(code);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
