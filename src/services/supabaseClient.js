import { createClient } from '@supabase/supabase-js';

/**
 * Retrieve environment variables safely across Vite and Vitest/Node environments
 */
function getEnv(key) {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

let clientInstance = null;

/**
 * Check if valid Supabase credentials have been configured
 */
export function isSupabaseConfigured() {
  const url = getEnv('VITE_SUPABASE_URL');
  const key = getEnv('VITE_SUPABASE_ANON_KEY');
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-key')
  );
}

/**
 * Get or initialize the Supabase client
 * Returns null if credentials are not configured, enabling graceful local-only offline operation.
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    const url = getEnv('VITE_SUPABASE_URL');
    const key = getEnv('VITE_SUPABASE_ANON_KEY');
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return clientInstance;
}

/**
 * Test connectivity to Supabase backend
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      status: 'unconfigured',
      message: 'Supabase credentials not configured. Operating in local-only offline mode.'
    };
  }

  const client = getSupabaseClient();
  try {
    const { error } = await client.from('telemetry_logs').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        connected: false,
        status: 'error',
        message: error.message
      };
    }
    return {
      connected: true,
      status: 'connected',
      message: 'Successfully connected to Supabase backend.'
    };
  } catch (err) {
    return {
      connected: false,
      status: 'network_error',
      message: err.message || 'Network unreachable'
    };
  }
}
