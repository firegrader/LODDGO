/**
 * Generate a unique event code from event title
 * Optimized for backend architecture (URL-safe, uppercase, alphanumeric)
 */

export function generateEventCode(title: string): string {
  // Step 1: Convert to uppercase
  let code = title.toUpperCase();
  
  // Step 2: Remove special characters, keep only letters, numbers, and spaces
  code = code.replace(/[^A-Z0-9\s]/g, '');
  
  // Step 3: Replace spaces with nothing (or could use underscores, but keeping it clean)
  code = code.replace(/\s+/g, '');
  
  // Step 4: Limit length (max 20 chars for readability)
  if (code.length > 20) {
    code = code.substring(0, 20);
  }
  
  // Step 5: If empty after cleaning, use a default
  if (code.length === 0) {
    code = 'EVENT';
  }
  
  // Step 6: Add timestamp suffix for uniqueness (last 6 digits of timestamp)
  // Format: BASENAME + last 6 digits of timestamp
  const timestamp = Date.now().toString();
  const suffix = timestamp.slice(-6); // Last 6 digits
  
  return `${code}${suffix}`;
}

/**
 * Alternative: Generate code with random suffix instead of timestamp
 * This gives shorter codes but requires checking for duplicates
 */
export function generateEventCodeWithRandomSuffix(title: string): string {
  let code = title.toUpperCase();
  code = code.replace(/[^A-Z0-9\s]/g, '');
  code = code.replace(/\s+/g, '');
  
  if (code.length > 15) {
    code = code.substring(0, 15);
  }
  
  if (code.length === 0) {
    code = 'EVENT';
  }
  
  // Add 4 random alphanumeric characters
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${code}${randomSuffix}`;
}
