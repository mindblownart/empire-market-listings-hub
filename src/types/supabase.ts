
import { Database } from '@/integrations/supabase/types';

// Define our business_listings table structure
export interface BusinessListing {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  business_name: string;
  category: string;
  location: string;
  year_established: number | null;
  employees: string | null;
  asking_price: string;
  annual_revenue: string;
  annual_profit: string;
  currency_code: string;
  description: string | null;
  highlights: string[] | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_role: string | null;
  primary_image_url: string | null;
  gallery_images: string[] | null;
  video_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_hot: boolean;
  primary_image_index?: number;
}

// Define our favorites table structure
export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

// Add the favorites table to the Database type
declare module '@/integrations/supabase/types' {
  interface Database {
    public: {
      Tables: {
        favorites: {
          Row: Favorite;
          Insert: Omit<Favorite, 'id' | 'created_at'>;
          Update: Partial<Favorite>;
        };
      } & Database['public']['Tables'];
    };
  }
}

export type { Database };
