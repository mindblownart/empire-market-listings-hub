
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { BusinessListing } from '@/types/supabase';

const SUPABASE_URL = "https://dfvjqmhlkwluxwkkzmpn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdmpxbWhsa3dsdXh3a2t6bXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTk1OTIsImV4cCI6MjA2MjI5NTU5Mn0.sjkjCHJk59DZh6t2Ic19CUmmOtUYvlfPcoBlkaaHW_Q";

// Create a typed client with our database type
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// Export types for convenience
export type { BusinessListing };
