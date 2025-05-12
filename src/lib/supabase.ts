
// Re-exporting the client from the integrations directory
import { supabase } from '@/integrations/supabase/client';
import type { BusinessListing, Favorite } from '@/types/supabase';

// Export the supabase client
export { supabase };

// Export types for convenience
export type { BusinessListing, Favorite };
