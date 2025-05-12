
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      business_listings: {
        Row: {
          annual_profit: string
          annual_revenue: string
          asking_price: string
          business_name: string
          category: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_role: string | null
          created_at: string
          currency_code: string
          description: string | null
          employees: string | null
          gallery_images: string[] | null
          highlights: string[] | null
          id: string
          is_featured: boolean
          is_hot: boolean
          is_new: boolean
          is_published: boolean
          location: string
          primary_image_url: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          year_established: number | null
        }
        Insert: {
          annual_profit: string
          annual_revenue: string
          asking_price: string
          business_name: string
          category: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          currency_code?: string
          description?: string | null
          employees?: string | null
          gallery_images?: string[] | null
          highlights?: string[] | null
          id?: string
          is_featured?: boolean
          is_hot?: boolean
          is_new?: boolean
          is_published?: boolean
          location: string
          primary_image_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          year_established?: number | null
        }
        Update: {
          annual_profit?: string
          annual_revenue?: string
          asking_price?: string
          business_name?: string
          category?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          currency_code?: string
          description?: string | null
          employees?: string | null
          gallery_images?: string[] | null
          highlights?: string[] | null
          id?: string
          is_featured?: boolean
          is_hot?: boolean
          is_new?: boolean
          is_published?: boolean
          location?: string
          primary_image_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          year_established?: number | null
        }
        Relationships: []
      }
      empiremarket: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          country: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

export type BusinessListing = Database['public']['Tables']['business_listings']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];

export type Tables<
  TableName extends keyof Database['public']['Tables'] = keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Row'];

export type TablesInsert<
  TableName extends keyof Database['public']['Tables'] = keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Insert'];

export type TablesUpdate<
  TableName extends keyof Database['public']['Tables'] = keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Update'];
