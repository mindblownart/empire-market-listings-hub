
-- This SQL file would be executed in Supabase to add constraint checks for favorites

-- Create a function to check if a user owns a business listing
CREATE OR REPLACE FUNCTION public.check_not_own_listing(listing_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.business_listings 
    WHERE id = listing_id AND user_id = check_not_own_listing.user_id
  );
END;
$$;

-- Add RLS policy to favorites table to enforce the constraint
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy to prevent inserting favorites for own listings
CREATE POLICY "Users cannot favorite their own listings" ON public.favorites
  FOR INSERT
  WITH CHECK (check_not_own_listing(listing_id, auth.uid()));

-- Policy to allow users to delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR DELETE
  USING (user_id = auth.uid());

-- Policy to allow users to see their own favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT
  USING (user_id = auth.uid());
