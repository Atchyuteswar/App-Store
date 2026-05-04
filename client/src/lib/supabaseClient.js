import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pntvhqelpygzywrzzfkl.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudHZocWVscHlnenl3cnp6ZmtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg1Mzc3MSwiZXhwIjoyMDkzNDI5NzcxfQ.VX7ntBc9WBhqIcgr-9oe_GiDeSJEq8823vkZLLQ6Z8U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
