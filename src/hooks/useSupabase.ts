
// Importing from the integrations directory instead of using a duplicate client
import { supabase } from '@/integrations/supabase/client';
import { ExtendedDatabase } from '@/types/supabase';

// Using the existing client instance
export const useSupabase = () => {
  return { supabase };
};

export default useSupabase;
