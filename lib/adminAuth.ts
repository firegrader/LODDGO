/**
 * Admin authentication helper
 * Validates x-admin-key header for admin endpoints
 */

export function validateAdminKey(request: Request): void {
  const adminKey = request.headers.get('x-admin-key');
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) {
    throw new Error('ADMIN_KEY environment variable not configured');
  }

  if (!adminKey || adminKey !== expectedKey) {
    throw new Error('Invalid or missing admin key');
  }
}
