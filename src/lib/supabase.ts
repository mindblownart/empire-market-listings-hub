
import { createClient } from '@supabase/supabase-js';

// Use the credentials from the connected Supabase project
const supabaseUrl = "https://dfvjqmhlkwluxwkkzmpn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdmpxbWhsa3dsdXh3a2t6bXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTk1OTIsImV4cCI6MjA2MjI5NTU5Mn0.sjkjCHJk59DZh6t2Ic19CUmmOtUYvlfPcoBlkaaHW_Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
