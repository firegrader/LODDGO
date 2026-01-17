/**
 * Quick connection test script
 * Run with: npx tsx test-connection.ts
 * Or: node --loader ts-node/esm test-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...\n');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Key:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing environment variables!');
  process.exit(1);
}

// Remove trailing slash if present
const cleanUrl = supabaseUrl.replace(/\/$/, '');
console.log('\nClean URL:', cleanUrl);

const supabase = createClient(cleanUrl, supabaseKey);

// Test connection
const run = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('count')
      .limit(1);

    if (error) {
      if (
        error.code === 'PGRST204' ||
        error.message.includes('relation') ||
        error.message.includes('does not exist')
      ) {
        console.log('\n⚠️  Connection works, but database tables not set up yet.');
        console.log('   Run supabase/schema.sql in your Supabase SQL Editor.');
      } else {
        console.error('\n❌ Connection error:', error.message);
        console.error('   Code:', error.code);
      }
    } else {
      console.log('\n✅ Connection successful!');
      console.log('   Database is ready.');
    }
  } catch (err: any) {
    console.error('\n❌ Connection failed:', err.message);
  }
};

run();
