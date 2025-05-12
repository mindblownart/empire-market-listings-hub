
// Importing from the integrations directory instead of using a duplicate client
import { supabase } from '@/integrations/supabase/client';

// Using the existing client instance
export const useSupabase = () => {
  return { supabase };
};

export default useSupabase;
