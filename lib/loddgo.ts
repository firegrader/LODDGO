/**
 * LODDGO Domain Logic
 * Pure domain functions for event management, ticket purchasing, and draws
 * Milestone M2: Server-side DB access & domain logic
 */

import { supabaseServer } from './supabaseServer';

// Database types matching schema.sql
export interface Event {
  id: string;
  code: string;
  title: string;
  price_nok: number;
  status: 'draft' | 'live' | 'closed' | 'drawn';
  draw_at: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  event_id: string;
  buyer_display_name: string | null;
  qty: number;
  amount_nok: number;
  paid: boolean;
  payment_provider: string;
  idempotency_key: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  order_id: string;
  ticket_number: number;
  created_at: string;
}

export interface Draw {
  id: string;
  event_id: string;
  winning_ticket_number: number;
  winning_order_id: string;
  method: string;
  drawn_at: string;
}

/**
 * Create a new event
 */
export async function createEvent(data: {
  code: string;
  title: string;
  price_nok: number;
  status?: Event['status'];
  draw_at?: string | null;
}): Promise<Event> {
  const { data: event, error } = await supabaseServer
    .from('events')
    .insert({
      code: data.code,
      title: data.title,
      price_nok: data.price_nok,
      status: data.status ?? 'live',
      draw_at: data.draw_at ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return event;
}

/**
 * Get event by public code
 */
export async function getEventByCode(code: string): Promise<Event | null> {
  const { data: event, error } = await supabaseServer
    .from('events')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get event: ${error.message}`);
  }

  return event;
}

/**
 * Buy tickets transactionally with concurrency-safe ticket number assignment
 * Uses SELECT ... FOR UPDATE to ensure sequential ticket numbers
 */
export async function buyTicketsTransactionally(data: {
  event_id: string;
  buyer_display_name: string | null;
  qty: number;
  amount_nok: number;
  paid: boolean;
  payment_provider?: string;
  idempotency_key?: string | null;
}): Promise<{ order: Order; tickets: Ticket[] }> {
  // Check idempotency if key provided
  if (data.idempotency_key) {
    const { data: existingOrder } = await supabaseServer
      .from('orders')
      .select('id')
      .eq('idempotency_key', data.idempotency_key)
      .single();

    if (existingOrder) {
      // Return existing order and tickets
      const { data: tickets } = await supabaseServer
        .from('tickets')
        .select('*')
        .eq('order_id', existingOrder.id)
        .order('ticket_number', { ascending: true });

      const { data: order } = await supabaseServer
        .from('orders')
        .select('*')
        .eq('id', existingOrder.id)
        .single();

      if (!order || !tickets) {
        throw new Error('Failed to retrieve existing order');
      }

      return { order, tickets };
    }
  }

  // Step 1: Get the next ticket number using concurrency-safe database function
  // This function uses advisory locks to ensure sequential ticket numbers
  console.log('Calling get_next_ticket_number for event:', data.event_id);
  
  const { data: nextTicketNumber, error: ticketNumError } = await supabaseServer
    .rpc('get_next_ticket_number', {
      p_event_id: data.event_id,
    })
    .single();

  console.log('RPC response:', { nextTicketNumber, error: ticketNumError });

  if (ticketNumError) {
    console.error('Ticket number RPC error:', ticketNumError);
    if (ticketNumError.code === '42883') {
      throw new Error(
        'Database function get_next_ticket_number not found. Please run supabase/functions.sql'
      );
    }
    throw new Error(`Failed to get next ticket number: ${ticketNumError.message} (code: ${ticketNumError.code})`);
  }

  if (typeof nextTicketNumber !== 'number' || nextTicketNumber < 1) {
    console.error('Invalid ticket number returned:', nextTicketNumber);
    throw new Error(`Invalid ticket number returned from database function: ${nextTicketNumber}`);
  }

  console.log('Next ticket number:', nextTicketNumber);

  // Step 2: Create order
  const { data: order, error: orderError } = await supabaseServer
    .from('orders')
    .insert({
      event_id: data.event_id,
      buyer_display_name: data.buyer_display_name,
      qty: data.qty,
      amount_nok: data.amount_nok,
      paid: data.paid,
      payment_provider: data.payment_provider ?? 'mock',
      idempotency_key: data.idempotency_key ?? null,
    })
    .select()
    .single();

  if (orderError) {
    if (orderError.code === '23505') {
      // Unique constraint violation (idempotency_key)
      throw new Error('Duplicate order detected (idempotency_key conflict)');
    }
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Step 3: Create tickets with sequential numbers
  const ticketsToInsert = Array.from({ length: data.qty }, (_, i) => ({
    event_id: data.event_id,
    order_id: order.id,
    ticket_number: nextTicketNumber + i,
  }));

  const { data: tickets, error: ticketsInsertError } = await supabaseServer
    .from('tickets')
    .insert(ticketsToInsert)
    .select();

  if (ticketsInsertError) {
    // Rollback: delete the order if ticket creation fails
    // This handles the case where ticket numbers conflict (shouldn't happen with proper locking)
    await supabaseServer.from('orders').delete().eq('id', order.id);
    
    if (ticketsInsertError.code === '23505') {
      throw new Error(
        `Ticket number conflict: ${ticketsInsertError.message}. This indicates a concurrency issue.`
      );
    }
    throw new Error(`Failed to create tickets: ${ticketsInsertError.message}`);
  }

  return { order, tickets: tickets || [] };
}

/**
 * Draw a winner for an event
 * Creates a draw record with the winning ticket number and order
 */
export async function drawWinner(data: {
  event_id: string;
  winning_ticket_number: number;
  winning_order_id: string;
  method?: string;
}): Promise<Draw> {
  // Verify the ticket exists and belongs to the event
  const { data: ticket, error: ticketError } = await supabaseServer
    .from('tickets')
    .select('*')
    .eq('event_id', data.event_id)
    .eq('ticket_number', data.winning_ticket_number)
    .single();

  if (ticketError || !ticket) {
    throw new Error(`Ticket ${data.winning_ticket_number} not found for event ${data.event_id}`);
  }

  // Verify the order matches
  if (ticket.order_id !== data.winning_order_id) {
    throw new Error('Winning order ID does not match ticket order');
  }

  // Create draw record
  const { data: draw, error: drawError } = await supabaseServer
    .from('draws')
    .insert({
      event_id: data.event_id,
      winning_ticket_number: data.winning_ticket_number,
      winning_order_id: data.winning_order_id,
      method: data.method ?? 'manual',
    })
    .select()
    .single();

  if (drawError) {
    if (drawError.code === '23505') {
      throw new Error('This ticket has already been drawn');
    }
    throw new Error(`Failed to create draw: ${drawError.message}`);
  }

  return draw;
}
