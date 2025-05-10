
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use placeholder values
// These placeholder values will allow the app to load, but Supabase functionality won't work
// until real credentials are provided through environment variables or Lovable's Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log a warning if using placeholder values
if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
  console.warn('Using placeholder Supabase credentials. Connect to Supabase for full functionality.');
}
